// Database-ready types for future Supabase integration

export interface Slide {
  id?: string;
  presentation_id?: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image-text';
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Presentation {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  slides: Slide[];
  created_at?: string;
  updated_at?: string;
}

export interface ReasoningStep {
  id?: string;
  type: 'thinking' | 'searching' | 'reading' | 'analyzing' | 'generating';
  title: string;
  content: string;
  timestamp?: string;
}

export interface ChatMessage {
  id?: string;
  conversation_id?: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: ReasoningStep[];
  presentation?: Presentation;
  created_at?: string;
}

export interface Conversation {
  id?: string;
  user_id?: string;
  title?: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

// API Request/Response types
export interface GenerateRequest {
  prompt: string;
  conversationId?: string;
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
