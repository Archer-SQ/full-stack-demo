import { http } from './http'
import type {
  Feedback,
  FeedbackCreatePayload,
  FeedbackListResponse,
  FeedbackQuery,
  FeedbackUpdatePayload,
} from './types'

const buildFeedbackQuery = (query: FeedbackQuery = {}) => {
  const searchParams = new URLSearchParams()

  if (query.question) {
    searchParams.set('question', query.question)
  }

  if (query.user) {
    searchParams.set('user', query.user)
  }

  if (query.status) {
    searchParams.set('status', query.status)
  }

  if (query.page) {
    searchParams.set('page', String(query.page))
  }

  if (query.page_size) {
    searchParams.set('page_size', String(query.page_size))
  }

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

// 反馈列表查询
export const getFeedbacks = (query: FeedbackQuery = {}) => {
  return http.get<FeedbackListResponse>(`/api/feedbacks${buildFeedbackQuery(query)}`)
}
// 单条反馈记录查询
export const getFeedback = (feedbackId: number) => {
  return http.get<Feedback>(`/api/feedbacks/${feedbackId}`)
}
// 创建反馈记录
export const createFeedback = (payload: FeedbackCreatePayload) => {
  return http.post<Feedback>('/api/feedbacks', payload)
}
// 更新反馈记录
export const updateFeedback = (feedbackId: number, payload: FeedbackUpdatePayload) => {
  return http.patch<Feedback>(`/api/feedbacks/${feedbackId}`, payload)
}
