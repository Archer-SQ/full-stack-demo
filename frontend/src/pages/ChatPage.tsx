import { useMemo, useState } from 'react'
import { ClipboardCheck, Plus, Send } from 'lucide-react'
import { createSession, getSessions, sendMessage } from '../api/chat'
import type { ChatSession } from '../api/types'
import { createFeedback } from '../api/feedback'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'
import AnswerDataView from '../components/AnswerDataView'

const defaultTitle = '经营单元收入&完成率分析'
const newSessionTitle = '新的智能问数'
const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  })
}

const ChatPage = () => {
  const {
    data: sessions,
    setData: setSessions,
    loading,
    error,
    setError,
  } = useAsyncData<ChatSession[]>(getSessions, [])
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null
  const [question, setQuestion] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [feedbackMessageId, setFeedbackMessageId] = useState<number | null>(null)
  const [feedbackDoneIds, setFeedbackDoneIds] = useState<number[]>([])

  const activeSession = useMemo(() => {
    return sessions.find(session => session.id === activeSessionId) ?? null
  }, [activeSessionId, sessions])

  const messages = useMemo(() => {
    return [...(activeSession?.messages ?? [])].sort((prev, next) => prev.id - next.id)
  }, [activeSession])

  const pageTitle = activeSession?.title ?? defaultTitle

  const getPreviousUserQuestion = (messageIndex: number) => {
    const previousUserMessage = [...messages]
      .slice(0, messageIndex)
      .reverse()
      .find(message => message.role === 'user')

    return previousUserMessage?.content ?? pageTitle
  }

  const handleCreateSession = async () => {
    if (creatingSession) {
      return
    }

    setCreatingSession(true)
    setError(null)

    const result = await toAsyncResult(createSession(newSessionTitle))

    if (result.ok === false) {
      setError(result.error)
      setCreatingSession(false)
      return
    }

    setSessions(currentSessions => [result.data, ...currentSessions])
    setSelectedSessionId(result.data.id)
    setCreatingSession(false)
  }

  const handleSendMessage = async (nextQuestion?: string) => {
    const content = (nextQuestion ?? question).trim()

    if (!activeSessionId || !content || sendingMessage) {
      return
    }

    setSendingMessage(true)
    setError(null)

    const result = await toAsyncResult(sendMessage(activeSessionId, content))

    if (result.ok === false) {
      setError(result.error)
      setSendingMessage(false)
      return
    }

    setSessions(currentSessions => [
      result.data,
      ...currentSessions.filter(session => session.id !== result.data.id),
    ])

    setSelectedSessionId(result.data.id)
    setQuestion('')
    setSendingMessage(false)
  }

  const handleCreateFeedback = async (
    messageId: number,
    messageIndex: number,
    aiAnswer: string
  ) => {
    if (feedbackDoneIds.includes(messageId) || feedbackMessageId === messageId) {
      return
    }

    setFeedbackMessageId(messageId)
    setError(null)

    const result = await toAsyncResult(
      createFeedback({
        user_name: '管理员',
        question: getPreviousUserQuestion(messageIndex),
        ai_answer: aiAnswer,
        message_id: messageId,
      })
    )

    if (result.ok === false) {
      setError(result.error)
      setFeedbackMessageId(null)
      return
    }

    setFeedbackDoneIds(currentIds => [...currentIds, messageId])
    setFeedbackMessageId(null)
  }

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <strong>近30天记录</strong>
        </div>

        <button
          className="new-chat-button"
          type="button"
          disabled={creatingSession}
          onClick={() => void handleCreateSession()}
        >
          <Plus size={18} />
          {creatingSession ? '创建中...' : '开启新对话'}
        </button>

        <nav className="chat-history" aria-label="历史对话">
          {loading && <p className="chat-history-state">加载中...</p>}
          {error && <p className="chat-history-state error">{error}</p>}

          {!loading &&
            !error &&
            sessions.map(session => (
              <button
                className={
                  session.id === activeSessionId ? 'chat-history-item active' : 'chat-history-item'
                }
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
              >
                <span>{session.title}</span>
                <small>{formatDateTime(session.updated_at)}</small>
              </button>
            ))}

          {!loading && !error && sessions.length === 0 && (
            <p className="chat-history-state">暂无历史对话</p>
          )}
        </nav>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <h1>{pageTitle}</h1>
        </header>

        <div className="chat-content">
          {messages.length === 0 && (
            <article className="assistant-card">
              <h2>{pageTitle}</h2>
              <p>
                {activeSession
                  ? '当前会话还没有消息，请在下方输入问题。'
                  : '当前还没有历史对话，请先开启新对话。'}
              </p>
            </article>
          )}

          {messages.map((message, index) => (
            <article
              className={message.role === 'user' ? 'message-row user' : 'message-row assistant'}
              key={message.id}
            >
              <div className="message-bubble">
                <strong>{message.role === 'user' ? '你' : 'AI'}</strong>
                <p>{message.content}</p>
                {message.role === 'assistant' && message.answer_data && (
                  <AnswerDataView
                    answerData={message.answer_data}
                    onSuggestionClick={suggestion => void handleSendMessage(suggestion)}
                  />
                )}
                {message.role === 'assistant' && (
                  <div className="message-actions">
                    <button
                      type="button"
                      disabled={
                        feedbackMessageId === message.id || feedbackDoneIds.includes(message.id)
                      }
                      onClick={() => void handleCreateFeedback(message.id, index, message.content)}
                    >
                      <ClipboardCheck size={16} />
                      {feedbackDoneIds.includes(message.id) ? '已反馈' : '数据有误'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="chat-input-bar">
          <input
            value={question}
            disabled={!activeSessionId || sendingMessage}
            placeholder={activeSessionId ? '请写下您的想法...' : '请先开启新对话'}
            onChange={event => setQuestion(event.target.value)}
          />
          <button
            type="button"
            disabled={!activeSessionId || !question.trim() || sendingMessage}
            aria-label="发送"
            onClick={() => handleSendMessage()}
          >
            <Send size={18} />
          </button>
        </div>
      </section>
    </main>
  )
}

export default ChatPage
