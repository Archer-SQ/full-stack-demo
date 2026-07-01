import AppModal from './AppModal'

type HotRecommendConfigModalProps = {
  threshold: number
  saving: boolean
  onThresholdChange: (threshold: number) => void
  onClose: () => void
  onSave: () => void
}

const HotRecommendConfigModal = ({
  threshold,
  saving,
  onThresholdChange,
  onClose,
  onSave,
}: HotRecommendConfigModalProps) => {
  return (
    <AppModal
      title="常问设置"
      width="sm"
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
          问题频次阈值
          <div className="hot-threshold-row">
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={event => onThresholdChange(Number(event.target.value))}
            />
            <span>次（同一问题出现次数超过此值即视为常问）</span>
          </div>
        </label>
      </div>
    </AppModal>
  )
}

export default HotRecommendConfigModal
