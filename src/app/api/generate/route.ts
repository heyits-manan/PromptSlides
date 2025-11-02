import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import type { Presentation } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial planning step
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "reasoning",
              step: {
                type: "thinking",
                title: "",
                content: `I will start by researching ${prompt} to gather comprehensive information for your presentation. I'll analyze key concepts, features, applications, and importance. After gathering enough information, I will structure it into a professional presentation with 5-8 slides.`,
              },
            })}\n\n`
          )
        );

        // Use Gemini 2.0 Flash Thinking model
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-thinking-exp-01-21",
        });

        const systemPrompt = `You are an expert presentation creator. Your task is to create professional, informative presentations based on user topics.

When given a topic, you should:
1. Research and gather information about the topic
2. Structure the content into logical slides
3. Create engaging titles and bullet points
4. Return the presentation in JSON format

Return your response in this exact JSON format:
{
  "title": "Presentation Title",
  "description": "Brief description",
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "layout": "content",
      "order": 0
    }
  ]
}

Guidelines:
- Create 5-8 slides
- Use clear, concise language
- Include an introduction slide, content slides, and a conclusion slide
- Each content slide should have 3-5 bullet points
- Make it professional and informative`;

        const fullPrompt = `${systemPrompt}\n\nUser's topic: ${prompt}\n\nPlease create a comprehensive presentation about this topic.`;

        // Simulate research progress
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Send research update
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "reasoning",
              step: {
                type: "searching",
                title: "",
                content: `I've completed the initial research for "${prompt}". I've gathered a good amount of information about its key aspects, features, and applications.\n\nNow, I will delve deeper by analyzing the most relevant information to ensure a comprehensive understanding of ${prompt}. This will help me create a detailed and informative presentation.`,
              },
            })}\n\n`
          )
        );

        // Generate content with streaming
        const result = await model.generateContentStream(fullPrompt);

        let fullText = "";

        // Send generating step before streaming starts
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "reasoning",
              step: {
                type: "generating",
                title: "",
                content: `I have thoroughly researched ${prompt}, covering its key aspects, features, applications, and importance by analyzing comprehensive information. I am now ready to generate a professional presentation for you.\n\nHere is your presentation on ${prompt}:`,
              },
            })}\n\n`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Send a progress message while AI generates the content
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              message: "Generating presentation content...",
            })}\n\n`
          )
        );

        // Accumulate all chunks (don't stream raw JSON to frontend)
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
        }

        // Extract JSON from the response
        let presentationData: Presentation | null = null;

        // Send processing progress
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              message: "Processing AI response...",
            })}\n\n`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 200));

        // Try to find JSON in the response
        const jsonMatch = fullText.match(/\{[\s\S]*"slides"[\s\S]*\}/);

        if (jsonMatch) {
          try {
            presentationData = JSON.parse(jsonMatch[0]);

            // Send slide creation progress
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  message: `Creating ${presentationData?.slides.length} slides...`,
                })}\n\n`
              )
            );

            await new Promise((resolve) => setTimeout(resolve, 300));

            // Add IDs and timestamps
            if (presentationData) {
              presentationData.id = crypto.randomUUID();
              presentationData.created_at = new Date().toISOString();

              // Process slides with progress updates
              presentationData.slides = presentationData.slides.map(
                (slide, index) => {
                  // Send progress for each slide
                  if (index % 2 === 0) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "progress",
                          message: `Generating slide ${index + 1}/${
                            presentationData!.slides.length
                          }...`,
                        })}\n\n`
                      )
                    );
                  }

                  return {
                    ...slide,
                    id: crypto.randomUUID(),
                    presentation_id: presentationData!.id,
                    order: index,
                    created_at: new Date().toISOString(),
                  };
                }
              );

              // Send finalizing progress
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    message: "Generating layouts...",
                  })}\n\n`
                )
              );

              await new Promise((resolve) => setTimeout(resolve, 300));

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    message: "Finalizing presentation...",
                  })}\n\n`
                )
              );

              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          } catch (e) {
            console.error("Failed to parse JSON:", e);
          }
        }

        // If no JSON found, create a simple presentation from the text
        if (!presentationData) {
          // Try to create a basic presentation from the text
          const lines = fullText.split("\n").filter((l) => l.trim());
          presentationData = {
            id: crypto.randomUUID(),
            title: prompt,
            description: "AI Generated Presentation",
            slides: [
              {
                id: crypto.randomUUID(),
                title: prompt,
                content: lines.slice(0, 5).map((l) => l.trim()),
                layout: "content",
                order: 0,
                created_at: new Date().toISOString(),
              },
            ],
            created_at: new Date().toISOString(),
          };
        }

        // Send final presentation
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "presentation",
              presentation: presentationData,
            })}\n\n`
          )
        );

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error: unknown) {
        console.error("Error generating presentation:", error);
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Failed to generate presentation";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: message,
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
