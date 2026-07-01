import type { ReactNode } from 'react'

type AppModalProps = {
  title: string
  width?: 'sm' | 'md' | 'lg'
  children: ReactNode
  footer: ReactNode
  closeDisabled?: boolean
  className?: string
  onClose: () => void
}

const AppModal = ({
  title,
  width = 'md',
  children,
  footer,
  closeDisabled = false,
  className = '',
  onClose,
}: AppModalProps) => {
  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <section
        className={`app-modal ${width} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={event => event.stopPropagation()}
      >
        <header className="app-modal-header">
          <h2>{title}</h2>
          <button type="button" disabled={closeDisabled} onClick={onClose}>
            关闭
          </button>
        </header>

        <div className="app-modal-body">{children}</div>

        <footer className="app-modal-footer">{footer}</footer>
      </section>
    </div>
  )
}

export default AppModal
