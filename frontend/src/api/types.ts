export type AppSetting = {
  id: number;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  answer_data: Record<string, unknown> | null;
  elapsed_ms: number | null;
  token_count: number | null;
};

export type ChatSession = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
};

export type Feedback = {
  id: number;
  user_name: string;
  question: string;
  ai_answer: string;
  status: string;
  created_at: string;
  remark: string | null;
  message_id: number | null;
  handled_at: string | null;
};
