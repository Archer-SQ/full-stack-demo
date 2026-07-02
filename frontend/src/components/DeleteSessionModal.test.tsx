import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DeleteSessionModal from './DeleteSessionModal'
import type { ComponentProps } from 'react'

type DeleteSessionModalProps = ComponentProps<typeof DeleteSessionModal>

const renderModal = (props?: Partial<DeleteSessionModalProps>) => {
  const defaultProps = {
    title: '待删除会话',
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  const mergedProps = {
    ...defaultProps,
    ...props,
  }

  render(<DeleteSessionModal {...mergedProps} />)

  return mergedProps
}

describe('DeleteSessionModal', () => {
  it('renders session title', () => {
    renderModal()

    expect(screen.getByText('待删除会话')).toBeInTheDocument()
    expect(screen.getByText('删除后，该会话及其消息记录将无法恢复。')).toBeInTheDocument()
  })

  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(props.onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when clicking delete', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '删除' }))

    expect(props.onConfirm).toHaveBeenCalled()
  })

  it('disables buttons while loading', () => {
    renderModal({ loading: true })

    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled()
  })
})