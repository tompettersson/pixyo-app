// Prompt generation types
export interface GeneratePromptRequest {
  userIdea: string;
  styleId: string;
  mode: 'photo' | 'illustration';
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
}

export interface GeneratePromptResponse {
  prompt: string;
  reasoning?: string;
}

// Image generation types
export interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  mode: 'photo' | 'illustration';
  variationSeed?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  createdAt: string;
}

export interface GenerateImageResponse {
  images: GeneratedImage[];
}

// API error response
export interface ApiError {
  error: string;
  message: string;
  code?: string;
}




