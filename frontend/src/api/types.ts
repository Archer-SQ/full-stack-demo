// 设置
export type AppSetting = {
  id: number
  code: string
  name: string
  description: string
  enabled: boolean
  config: Record<string, unknown>
  updated_at: string
}

// 对话
export type ChatAnswerTableColumn = {
  key: string
  label: string
}

export type ChatAnswerTableRow = Record<string, string | number>

export type ChatAnswerStat = {
  label: string
  value: string
}

export type ChatAnswerChartSeries = {
  key: string
  name: string
  color: string
}

export type ChatAnswerData = {
  title: string
  description: string
  table: {
    columns: ChatAnswerTableColumn[]
    rows: ChatAnswerTableRow[]
  }
  stats: ChatAnswerStat[]
  chart: {
    type: string
    title: string
    x_key: string
    series: ChatAnswerChartSeries[]
  }
  suggestions: string[]
}

export type ChatMessage = {
  id: number
  session_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
  answer_data: ChatAnswerData | null
  elapsed_ms: number | null
  token_count: number | null
}

export type ChatSession = {
  id: number
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

// 反馈
export type Feedback = {
  id: number
  user_name: string
  question: string
  ai_answer: string
  status: string
  created_at: string
  remark: string | null
  message_id: number | null
  handled_at: string | null
}

export type FeedbackStatus = 'pending' | 'resolved'

export type FeedbackListResponse = {
  total: number
  page: number
  page_size: number
  items: Feedback[]
}

export type FeedbackQuery = {
  question?: string
  user?: string
  status?: FeedbackStatus
  page?: number
  page_size?: number
}

export type FeedbackCreatePayload = {
  user_name: string
  question: string
  ai_answer: string
  message_id: number | null
}

export type FeedbackUpdatePayload = {
  status?: FeedbackStatus
  remark?: string
}
