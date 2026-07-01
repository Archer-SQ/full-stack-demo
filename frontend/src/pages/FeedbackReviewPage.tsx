import { useState, useMemo } from 'react'
import { getFeedbacks, updateFeedback } from '../api/feedback'
import type { Feedback, FeedbackListResponse, FeedbackStatus } from '../api/types'
import FeedbackHandleModal from '../components/FeedbackHandleModal'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'

const initialFeedbackResponse: FeedbackListResponse = {
  total: 0,
  page: 1,
  page_size: 10,
  items: [],
}

const pageSize = 10

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已处理', value: 'resolved' },
] as const

const formatStatus = (status: Feedback['status']) => {
  if (status === 'resolved') {
    return '已处理'
  }
  return '待处理'
}

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  })
}

const FeedbackReviewPage = () => {
  const [activeFeedback, setActiveFeedback] = useState<Feedback | null>(null)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusDraft, setStatusDraft] = useState<FeedbackStatus>('pending')
  const [questionKeyword, setQuestionKeyword] = useState('')
  const [userKeyword, setUserKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('')
  const [page, setPage] = useState(1)

  const loadFeedbacks = useMemo(() => {
    return () =>
      getFeedbacks({
        question: questionKeyword.trim() || undefined,
        user: userKeyword.trim() || undefined,
        status: statusFilter || undefined,
        page,
        page_size: pageSize,
      })
  }, [page, questionKeyword, statusFilter, userKeyword])

  const { data, setData, error, setError } = useAsyncData(
    loadFeedbacks,
    initialFeedbackResponse
  )

  const feedbacks = data.items
  const total = data.total

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openHandleDialog = (feedback: Feedback) => {
    setActiveFeedback(feedback)
    setStatusDraft(feedback.status === 'resolved' ? 'resolved' : 'pending')
    setRemark(feedback.remark ?? '')
    setError(null)
  }

  const closeHandleDialog = () => {
    if (submitting) {
      return
    }

    setStatusDraft('pending')
    setActiveFeedback(null)
    setRemark('')
  }

  const handleSubmitFeedback = async () => {
    if (!activeFeedback || submitting) {
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await toAsyncResult(
      updateFeedback(activeFeedback.id, {
        status: statusDraft,
        remark: remark.trim(),
      })
    )

    if (result.ok === false) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    setData(currentData => ({
      ...currentData,
      items: currentData.items.map(item => (item.id === result.data.id ? result.data : item)),
    }))

    setActiveFeedback(null)
    setRemark('')
    setSubmitting(false)
    setStatusDraft('pending')
  }

  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>反馈管理</span>
          <span>/</span>
          <strong>回复校对</strong>
        </nav>

        <header className="page-header">
          <div className='title'>
            <h1>回复校对</h1>
            <p>查看用户标记为 AI 回复有误的信息数据。</p>
          </div>
          <div className="summary">
            <span>{total}</span>
            <small>共计</small>
          </div>
        </header>

        {error && <p className="state-text error">{error}</p>}

        <section className="table-card" aria-label="回复校对列表">
          <div className="feedback-panel-header">
            <div>
              <strong>回复校对</strong>
              <span>此列表为用户标注AI回复数据有误的信息数据</span>
            </div>

            <div className="feedback-filters">
              <input
                value={questionKeyword}
                placeholder="搜索问题..."
                onChange={event => {
                  setPage(1)
                  setQuestionKeyword(event.target.value)
                }}
              />
              <input
                value={userKeyword}
                placeholder="搜索用户..."
                onChange={event => {
                  setPage(1)
                  setUserKeyword(event.target.value)
                }}
              />
              <select
                value={statusFilter}
                onChange={event => {
                  setPage(1)
                  setStatusFilter(event.target.value as FeedbackStatus | '')
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="table-count">共 {total} 条</span>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <colgroup>
                <col className="feedback-col-index" />
                <col className="feedback-col-user" />
                <col className="feedback-col-question" />
                <col className="feedback-col-time" />
                <col className="feedback-col-status" />
                <col className="feedback-col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>用户</th>
                  <th>问题</th>
                  <th>反馈时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((item, index) => (
                  <tr key={item.id}>
                    <td className="table-index">{index + 1}</td>
                    <td className="table-user">{item.user_name}</td>
                    <td className="table-question" title={item.question}>
                      {item.question}
                    </td>
                    <td className="table-date">{formatDateTime(item.created_at)}</td>
                    <td className="table-status">
                      <span
                        className={
                          item.status === 'resolved' ? 'status-tag resolved' : 'status-tag pending'
                        }
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="table-action">
                      <button type="button" onClick={() => openHandleDialog(item)}>
                        处理
                      </button>
                    </td>
                  </tr>
                ))}

                {feedbacks.length === 0 && (
                  <tr>
                    <td className="empty-cell" colSpan={6}>
                      暂无反馈数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="feedback-pagination">
              <span>
                共 {total} 条，每页 {pageSize} 条
              </span>
              <div>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(current => current - 1)}
                >
                  上一页
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(current => current + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </section>

        {activeFeedback && (
          <FeedbackHandleModal
            feedback={activeFeedback}
            status={statusDraft}
            remark={remark}
            submitting={submitting}
            onStatusChange={setStatusDraft}
            onRemarkChange={setRemark}
            onClose={closeHandleDialog}
            onConfirm={() => void handleSubmitFeedback()}
          />
        )}
      </div>
    </main>
  )
}

export default FeedbackReviewPage
