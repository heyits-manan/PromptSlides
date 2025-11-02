import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import type { EditSlideRequest, Presentation } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let body: EditSlideRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { presentation, slideIndex, instruction } = body || {};

  if (!presentation || !Array.isArray(presentation.slides)) {
    return NextResponse.json(
      { error: "Valid presentation with slides is required" },
      { status: 400 }
    );
  }

  if (
    typeof slideIndex !== "number" ||
    Number.isNaN(slideIndex) ||
    slideIndex < 0 ||
    slideIndex >= presentation.slides.length
  ) {
    return NextResponse.json(
      { error: "slideIndex must reference an existing slide" },
      { status: 400 }
    );
  }

  if (!instruction || typeof instruction !== "string") {
    return NextResponse.json(
      { error: "instruction is required" },
      { status: 400 }
    );
  }

  const targetSlide = presentation.slides[slideIndex];

  const contextSummary = presentation.slides
    .map((slide, index) => {
      const bullets = slide.content
        .map((point) => `  - ${point}`)
        .join("\n");
      return `Slide ${index + 1}: ${slide.title}\n${bullets}`;
    })
    .join("\n\n");

  const systemPrompt = `You are an expert presentation copywriter. Edit the target slide to follow the user's instruction while keeping tone and format consistent with the rest of the presentation.
- Maintain clear, concise bullet points (3-5 bullets preferred).
- Bullets should be sentence fragments, not full paragraphs.
- Avoid markdown or numbering; plain text only.
- Return only JSON. Do not include explanations.`;

  const userPrompt = `Presentation title: ${presentation.title}
Presentation description: ${presentation.description ?? "(none)"}

Current presentation overview:
${contextSummary}

Target slide (Slide ${slideIndex + 1}):
${JSON.stringify(
    {
      title: targetSlide.title,
      content: targetSlide.content,
      layout: targetSlide.layout,
      order: targetSlide.order,
    },
    null,
    2
  )}

Instruction: ${instruction}

Return JSON in this shape:
{
  "title": "Updated slide title",
  "content": ["Bullet point one", "Bullet point two"]
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21",
    });

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);

    const rawText = result.response.text();
    const jsonMatch = rawText.match(/```json[\s\S]*?```|\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Model response did not include JSON");
    }

    const cleaned = jsonMatch[0]
      .replace(/```json|```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      title?: unknown;
      content?: unknown;
    };

    const updatedTitle = typeof parsed.title === "string" ? parsed.title.trim() : targetSlide.title;

    let updatedContent: string[] = [];

    if (Array.isArray(parsed.content)) {
      updatedContent = parsed.content
        .map((item) => String(item).trim())
        .filter(Boolean);
    } else if (typeof parsed.content === "string") {
      updatedContent = parsed.content
        .split(/\n+/)
        .map((line) => line.replace(/^[\-•*]\s*/, "").trim())
        .filter(Boolean);
    }

    if (updatedContent.length === 0) {
      throw new Error("Model did not return valid bullet points");
    }

    const now = new Date().toISOString();

    const updatedPresentation: Presentation = {
      ...presentation,
      updated_at: now,
      slides: presentation.slides.map((slide, index) =>
        index === slideIndex
          ? {
              ...slide,
              title: updatedTitle,
              content: updatedContent,
              updated_at: now,
            }
          : slide
      ),
    };

    return NextResponse.json({ presentation: updatedPresentation });
  } catch (error) {
    console.error("Error editing slide:", error);
    const message =
      error instanceof Error ? error.message : "Failed to edit slide";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
