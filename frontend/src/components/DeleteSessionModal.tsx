import AppModal from "./AppModal";

type DeleteSessionModalProps = {
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteSessionModal = ({
  title,
  loading,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) => {
  return (
    <AppModal
      title="删除会话"
      width="sm"
      closeDisabled={loading}
      onClose={onClose}
      footer={
        <>
          <button type="button" disabled={loading} onClick={onClose}>
            取消
          </button>
          <button
            className="danger"
            type="button"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "删除中..." : "删除"}
          </button>
        </>
      }
    >
      <p className="delete-session-warning">
        删除后，该会话及其消息记录将无法恢复。
      </p>
      <div className="delete-session-title">{title}</div>
    </AppModal>
  );
};

export default DeleteSessionModal;
