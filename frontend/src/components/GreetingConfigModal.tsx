import AppModal from './AppModal'

type GreetingConfigModalProps = {
  text: string
  questions: string[]
  saving: boolean
  onTextChange: (text: string) => void
  onQuestionChange: (index: number, value: string) => void
  onAddQuestion: () => void
  onRemoveQuestion: (index: number) => void
  onClose: () => void
  onSave: () => void
}

const GreetingConfigModal = ({
  text,
  questions,
  saving,
  onTextChange,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onClose,
  onSave,
}: GreetingConfigModalProps) => {
  return (
    <AppModal
      title="对话开场白"
      width="md"
      className="setting-config-modal"
      closeDisabled={saving}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={saving} onClick={onClose}>
            取消
          </button>
          <button type="button" disabled={saving} onClick={onSave}>
            {saving ? '保存中...' : '保存'}
          </button>
        </>
      }
    >
      <div className="config-modal-body">
        <label>
          开场白文案
          <textarea
            value={text}
            placeholder="请输入欢迎开场白..."
            onChange={event => onTextChange(event.target.value)}
          />
        </label>

        <div className="greeting-question-header">
          <strong>开场问题 · {questions.length}/10</strong>
          <button type="button" disabled={questions.length >= 10} onClick={onAddQuestion}>
            添加开场问题
          </button>
        </div>

        <div className="greeting-question-list">
          {questions.map((question, index) => (
            <div className="greeting-question-row" key={index}>
              <input
                value={question}
                maxLength={100}
                placeholder="请输入快捷问题"
                onChange={event => onQuestionChange(index, event.target.value)}
              />
              <button type="button" onClick={() => onRemoveQuestion(index)}>
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppModal>
  )
}

export default GreetingConfigModal
