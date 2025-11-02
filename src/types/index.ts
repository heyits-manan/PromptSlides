export interface Slide {
  id?: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image-text';
  order: number;
}

export interface Presentation {
  id?: string;
  title: string;
  description?: string;
  slides: Slide[];
}

export interface ReasoningStep {
  type: 'thinking' | 'searching' | 'reading' | 'analyzing' | 'generating';
  title: string;
  content: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: ReasoningStep[];
  presentation?: Presentation;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

// API Request/Response types
export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  message: ChatMessage;
  presentation?: Presentation;
}

export interface EditSlideRequest {
  presentation: Presentation;
  slideIndex: number;
  instruction: string;
}

export interface EditSlideResponse {
  presentation: Presentation;
}
