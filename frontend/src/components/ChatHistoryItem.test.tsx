import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatHistoryItem from './ChatHistoryItem'
import type { ComponentProps } from 'react'
import type { ChatSession } from '../api/types'

type ChatHistoryItemProps = ComponentProps<typeof ChatHistoryItem>

const session: ChatSession = {
  id: 1,
  title: '政企行业收入筛选',
  pinned: false,
  created_at: '2026-07-02T10:00:00Z',
  updated_at: '2026-07-02T10:00:00Z',
  messages: [],
}

const renderItem = (overrideProps: Partial<ChatHistoryItemProps> = {}) => {
  const props = {
    session,
    isActive: false,
    isMenuOpen: true,
    actionLoading: false,
    onSelectSession: vi.fn(),
    onOpenMenu: vi.fn(),
    onCloseMenu: vi.fn(),
    onRename: vi.fn(),
    onUp: vi.fn(),
    onDelete: vi.fn(),
    ...overrideProps,
  }

  const view = render(<ChatHistoryItem {...props} />)

  return {
    ...view,
    props,
  }
}

describe('ChatHistoryItem', () => {
  it('renders session title', () => {
    renderItem()

    expect(screen.getByText('政企行业收入筛选')).toBeInTheDocument()
  })

  it('adds active class when current session is active', () => {
    const { container } = renderItem({ isActive: true })

    expect(container.querySelector('.chat-history-item')).toHaveClass('active')
  })

  it('opens and closes action menu on hover area', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()
    const moreButton = screen.getByLabelText('更多操作')
    const moreWrap = moreButton.parentElement as HTMLElement

    await user.hover(moreWrap)
    expect(props.onOpenMenu).toHaveBeenCalledWith(session.id)

    await user.unhover(moreWrap)
    expect(props.onCloseMenu).toHaveBeenCalled()
  })

  it('selects session when clicking history item body', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByText('政企行业收入筛选'))

    expect(props.onSelectSession).toHaveBeenCalledWith(session.id)
  })

  it('calls rename callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '重命名' }))

    expect(props.onRename).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('calls pin callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '置顶' }))

    expect(props.onUp).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('calls delete callback and does not select session', async () => {
    const user = userEvent.setup()
    const { props } = renderItem()

    await user.click(screen.getByRole('button', { name: '删除' }))

    expect(props.onDelete).toHaveBeenCalledWith(session)
    expect(props.onSelectSession).not.toHaveBeenCalled()
  })

  it('disables menu actions when action is loading', () => {
    renderItem({ actionLoading: true })

    expect(screen.getByRole('button', { name: '重命名' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '置顶' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled()
  })

  it('shows cancel pin text when session is pinned', () => {
    renderItem({
      session: {
        ...session,
        pinned: true,
      },
    })

    expect(screen.getByRole('button', { name: '取消置顶' })).toBeInTheDocument()
  })
})