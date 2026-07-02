import { http } from './http'
import type { ChatSession, UpdateSessionPayload } from './types'

export const createSession = (title: string) => {
  return http.post<ChatSession>('/api/sessions', { title })
}

export const getSessions = () => {
  return http.get<ChatSession[]>('/api/sessions')
}

export const getSession = (sessionId: number) => {
  return http.get<ChatSession>(`/api/sessions/${sessionId}`)
}

export const sendMessage = (sessionId: number, content: string) => {
  return http.post<ChatSession>(`/api/sessions/${sessionId}/messages`, {
    role: 'user',
    content,
  })
}

export const updateSession = (sessionId: number, payload: UpdateSessionPayload) => {
  return http.patch<ChatSession>(`/api/sessions/${sessionId}`, payload)
}

export const deleteSession = (sessionId: number) => {
  return http.delete<void>(`/api/sessions/${sessionId}`)
}
