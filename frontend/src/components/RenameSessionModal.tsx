import { useState } from "react";
import AppModal from "./AppModal";

type RenameSessionModalProps = {
  oldTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
};

const RenameSessionModal = ({
  oldTitle,
  loading,
  onClose,
  onConfirm,
}: RenameSessionModalProps) => {
  const [title, setTitle] = useState(oldTitle);
  const normalizedTitle = title?.trim().replace(/\s+/g, " ");
  const originTitle = oldTitle?.trim().replace(/\s+/g, " ");
  const canSubmit =
    normalizedTitle?.length > 0 && normalizedTitle !== originTitle && !loading;

  return (
    <AppModal
      title="重命名会话"
      width="sm"
      closeDisabled={loading}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={loading} onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(normalizedTitle)}
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <label className="rename-session-field">
        <span>会话名称</span>
        <input
          className="rename-session-input"
          value={title}
          disabled={loading}
          maxLength={200}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) {
              onConfirm(normalizedTitle);
            }
          }}
        />
      </label>
    </AppModal>
  );
};

export default RenameSessionModal;
