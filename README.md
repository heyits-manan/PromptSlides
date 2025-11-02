# AI Slides - AI-Powered Presentation Generator

An intelligent web application that generates professional presentation slides using Google's Gemini AI. Users can create presentations from text prompts, edit individual slides, and manage multiple conversation histories.

## Features

### Core Features
- **AI-Powered Slide Generation**: Create professional presentations from simple text prompts
- **Real-time Reasoning Display**: Watch the AI think through the presentation structure
- **Slide Editing**: Edit individual slides with natural language instructions
- **Conversation History**: Manage multiple presentation projects with automatic saving
- **PowerPoint Export**: Download presentations as .pptx files
- **Live Preview**: Real-time preview of generated slides with navigation

### Advanced Features
- **Smart Title Generation**: Automatically generates conversation titles from first user message
- **Date Grouping**: Conversations organized by "Today", "Yesterday", "Previous 7 Days", and "Older"
- **Relative Timestamps**: User-friendly time display (e.g., "5m ago", "2h ago")
- **Delete Confirmation**: Two-click delete with auto-cancel for safety
- **Local Persistence**: All conversations saved to browser localStorage
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.1.16** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Google Generative AI** - Gemini 2.0 Flash for AI generation
- **Streaming Responses** - Server-sent events for real-time updates

### Tools & Libraries
- **pptxgenjs** - PowerPoint file generation
- **ESLint 9** - Code linting
- **PostCSS** - CSS processing

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Google Gemini API key (free tier available)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get your API key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key.

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Instructions

### Creating a Presentation

1. **Start a New Chat**
   - Click the "New Chat" button in the conversation history sidebar
   - Or start typing in the input field at the bottom

2. **Enter Your Prompt**
   - Type a description of your presentation (e.g., "Create a presentation about artificial intelligence")
   - Click "Generate" or press Enter

3. **Watch the AI Work**
   - The AI's reasoning steps appear in real-time
   - See how it plans and structures your presentation
   - Wait for the "Slides ready to review" message

4. **Review Your Presentation**
   - The preview panel appears on the right
   - Navigate through slides using the arrow buttons
   - Review the title, content, and layout of each slide

### Editing Slides

1. **Select a Slide**
   - Navigate to the slide you want to edit in the preview panel

2. **Enter Edit Mode**
   - Click the "Edit this slide" button below the slide preview

3. **Provide Edit Instructions**
   - Type natural language instructions (e.g., "Make the title more catchy" or "Add more technical details")
   - Click "Apply Edit"

4. **Review Changes**
   - The AI updates the slide based on your instructions
   - Changes appear in real-time in the preview

### Downloading Presentations

1. Click the "Download PPTX" button in the preview panel
2. The presentation downloads as a PowerPoint file
3. Open in Microsoft PowerPoint, Google Slides, or compatible software

### Managing Conversations

**Switch Conversations**
- Click any conversation in the history sidebar
- Your progress is automatically saved

**Delete Conversations**
- Hover over a conversation
- Click the trash icon
- Click again to confirm deletion

**Organize by Date**
- Conversations are automatically grouped by date
- Most recent conversations appear at the top

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── edit-slide/
│   │   │   │   └── route.ts          # Slide editing endpoint
│   │   │   └── generate/
│   │   │       └── route.ts          # Presentation generation endpoint
│   │   ├── layout.tsx                # Root layout with metadata
│   │   └── page.tsx                  # Main application page
│   │
│   ├── components/
│   │   ├── ConversationHistory.tsx   # Conversation sidebar with history
│   │   ├── MainContent.tsx           # Input form component
│   │   ├── MessageBlock.tsx          # Chat message display
│   │   ├── PresentationPreview.tsx   # Slide preview panel
│   │   ├── ReasoningBlock.tsx        # AI reasoning step display
│   │   ├── Sidebar.tsx               # Left navigation sidebar
│   │   └── SlideViewer.tsx           # Individual slide viewer
│   │
│   ├── lib/
│   │   └── pptGenerator.ts           # PowerPoint generation logic
│   │
│   └── types/
│       └── index.ts                  # TypeScript type definitions
│
├── public/                           # Static assets
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── next.config.ts                    # Next.js configuration
└── README.md                         # This file
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | None |

### API Configuration

The application uses Google Gemini 2.0 Flash Thinking Experimental model with the following settings:

```typescript
model: "gemini-2.0-flash-thinking-exp"
temperature: 0.7
maxOutputTokens: 8192
```

### Storage

- **Method**: Browser localStorage
- **Key**: `ai-slides.conversations`
- **Data**: JSON array of conversation objects
- **Capacity**: ~5-10MB (browser dependent)
- **Persistence**: Survives page refreshes, per-browser/device

## Assumptions Made

### Technical Assumptions

1. **Browser Compatibility**
   - Modern browsers with ES6+ support
   - localStorage API available
   - Minimum 1280px screen width for optimal experience

2. **API Limitations**
   - Gemini API free tier limits apply (60 requests per minute)
   - Maximum 8192 tokens per response
   - Streaming responses supported by the client

3. **Data Persistence**
   - No backend database required
   - Users access application from the same browser/device
   - Conversations lost if localStorage is cleared
   - No cross-device synchronization

4. **Network Conditions**
   - Stable internet connection for API calls
   - Streaming responses work correctly
   - Reasonable latency for real-time updates

### Business Assumptions

1. **User Behavior**
   - Users create presentations for professional/educational purposes
   - Average presentation has 5-10 slides
   - Users may iterate on slides multiple times
   - Conversations kept for reference but may be deleted

2. **Content Generation**
   - AI-generated content is reviewed before use
   - Users have basic presentation design knowledge
   - Generated slides serve as starting points for customization

3. **Privacy**
   - No sensitive data stored on servers
   - User data remains in browser only
   - API requests contain only necessary prompt data

### Architectural Assumptions

1. **Scalability**
   - Client-side only application (no server state)
   - Each user's data isolated in their browser
   - No concurrent editing of conversations

2. **Error Handling**
   - Network errors handled gracefully
   - Failed generations can be retried
   - Partial data loss acceptable (client-side only)

3. **File Management**
   - Generated PPTX files are temporary (browser downloads)
   - No server-side file storage required
   - Users manage downloaded files locally

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build (optimized)
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Deployment Options

**Vercel (Recommended)**
```bash
vercel
```

**Manual Deployment**
1. Build the application: `npm run build`
2. Set environment variables on your hosting platform
3. Start the production server: `npm run start`

**Supported Platforms**
- Vercel (native Next.js support)
- Netlify
- AWS Amplify
- Digital Ocean
- Any Node.js hosting provider

## Troubleshooting

### Common Issues

**API Key Not Working**
```
Error: API key not configured
```
- Verify `.env` file exists in root directory
- Check `GEMINI_API_KEY` is set correctly
- Restart the development server

**Conversation Not Saving**
- Check browser localStorage is enabled
- Clear localStorage and try again: `localStorage.clear()`
- Check browser console for errors

**Slides Not Generating**
```
Error: Failed to generate presentation
```
- Check internet connection
- Verify API key is valid
- Check Gemini API quota limits
- Review browser console for detailed errors

**Build Failures**
```
Type error: ...
```
- Run `npm install` to ensure dependencies are current
- Delete `.next` directory and rebuild
- Check Node.js version (18+ required)

### Debug Mode

Enable detailed logging by checking browser DevTools console:
- Network tab: View API requests/responses
- Console tab: Application logs and errors
- Application tab > Local Storage: View saved conversations


## Future Enhancements

- [ ] Cloud storage integration (Supabase, Firebase)
- [ ] User authentication and multi-device sync
- [ ] Collaborative editing
- [ ] Presentation templates and themes
- [ ] Image generation and embedding
- [ ] Export to Google Slides
- [ ] Presentation sharing via links
- [ ] Version history for presentations
- [ ] Offline mode with service workers
- [ ] Custom branding and styling options

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Gemini AI for powerful language models
- Next.js team for excellent framework
- Tailwind CSS for utility-first styling
- pptxgenjs for PowerPoint generation

---
