import { http } from "./http";
import type { ChatSession } from "./types";

export function createSession(title: string) {
  return http.post<ChatSession>("/api/sessions", { title });
}

export function getSessions() {
  return http.get<ChatSession[]>("/api/sessions");
}

export function getSession(sessionId: number) {
  return http.get<ChatSession>(`/api/sessions/${sessionId}`);
}

export function sendMessage(sessionId: number, content: string) {
  return http.post<ChatSession>(`/api/sessions/${sessionId}/messages`, {
    role: "user",
    content,
  });
}