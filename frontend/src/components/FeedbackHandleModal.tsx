import type { Feedback, FeedbackStatus } from '../api/types'
import AppModal from './AppModal'

type FeedbackHandleModalProps = {
  feedback: Feedback
  status: FeedbackStatus
  remark: string
  submitting: boolean
  onStatusChange: (status: FeedbackStatus) => void
  onRemarkChange: (remark: string) => void
  onClose: () => void
  onConfirm: () => void
}

const FeedbackHandleModal = ({
  feedback,
  status,
  remark,
  submitting,
  onStatusChange,
  onRemarkChange,
  onClose,
  onConfirm,
}: FeedbackHandleModalProps) => {
  return (
    <AppModal
      title="反馈处理"
      width="lg"
      className="feedback-handle-modal"
      closeDisabled={submitting}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={submitting} onClick={onClose}>
            取消
          </button>
          <button type="button" disabled={submitting} onClick={onConfirm}>
            {submitting ? '保存中...' : '确认'}
          </button>
        </>
      }
    >
      <div className="feedback-modal-body two-column">
        <div className="feedback-preview">
          <label>
            用户提问
            <p>{feedback.question}</p>
          </label>

          <label>
            AI回复
            <p className="ai-reply">{feedback.ai_answer || '（暂无AI回复数据）'}</p>
          </label>
        </div>

        <div className="feedback-form">
          <label>
            处理状态
            <select
              value={status}
              onChange={event => onStatusChange(event.target.value as FeedbackStatus)}
            >
              <option value="pending">待处理</option>
              <option value="resolved">已处理</option>
            </select>
          </label>

          <label>
            处理备注
            <textarea
              value={remark}
              placeholder="请填写处理备注..."
              onChange={event => onRemarkChange(event.target.value)}
            />
          </label>
        </div>
      </div>
    </AppModal>
  )
}

export default FeedbackHandleModal
