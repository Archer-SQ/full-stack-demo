import { memo, useCallback } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { MoreVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'
import type { ChatSession } from '../api/types'

type ChatHistoryItemProps = {
  session: ChatSession
  isActive: boolean
  isMenuOpen: boolean
  onSelectSession: (sessionId: number) => void
  onToggleMenu: (sessionId: number) => void
  onRename?: () => void
  onUp?: () => void
  onDelete?: () => void
}

const ChatHistoryItem = ({
  session,
  isActive,
  isMenuOpen,
  onSelectSession,
  onToggleMenu,
  onRename,
  onUp,
  onDelete,
}: ChatHistoryItemProps) => {
  const handleSelect = useCallback(() => {
    onSelectSession(session.id)
  }, [onSelectSession, session.id])

  const handleSelectButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onSelectSession(session.id)
    },
    [onSelectSession, session.id]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelectSession(session.id)
      }
    },
    [onSelectSession, session.id]
  )

  const handleToggleMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onToggleMenu(session.id)
    },
    [onToggleMenu, session.id]
  )

  const handleMenuClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }, [])

  return (
    <div
      className={['chat-history-item', isActive ? 'active' : '', isMenuOpen ? 'menu-open' : '']
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <button className="chat-history-select" type="button" onClick={handleSelectButtonClick}>
        {session.pinned && <Pin size={13} className="chat-history-pin" />}
        <span className="chat-history-title">{session.title}</span>
      </button>

      <div className="chat-history-more-wrap" onClick={handleMenuClick}>
        <button
          className="chat-history-more-button"
          type="button"
          aria-label="更多操作"
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <MoreVertical size={16} />
        </button>

        <div className="chat-history-menu">
          <button type="button" onClick={onRename}>
            <Pencil size={14} />
            <span>重命名</span>
          </button>
          <button type="button" onClick={onUp}>
            {session.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            <span>{session.pinned ? '取消置顶' : '置顶'}</span>
          </button>
          <button className="danger" type="button" onClick={onDelete}>
            <Trash2 size={14} />
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatHistoryItem)
