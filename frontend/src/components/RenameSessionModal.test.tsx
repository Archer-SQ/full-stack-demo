import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RenameSessionModal from './RenameSessionModal'
import type { ComponentProps } from 'react'

type RenameSessionModalProps = ComponentProps<typeof RenameSessionModal>

const renderModal = (props?: Partial<RenameSessionModalProps>) => {
  const defaultProps = {
    oldTitle: '旧会话标题',
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  const mergedProps = {
    ...defaultProps,
    ...props,
  }

  render(<RenameSessionModal {...mergedProps} />)

  return mergedProps
}

describe('RenameSessionModal', () => {
  it('renders old title as input value', () => {
    renderModal()

    expect(screen.getByLabelText('会话名称')).toHaveValue('旧会话标题')
  })

  it('disables save button when title is unchanged', () => {
    renderModal()

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('disables save button when title is empty', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.clear(screen.getByLabelText('会话名称'))

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('calls onConfirm with normalized title', async () => {
    const user = userEvent.setup()
    const props = renderModal()
    const input = screen.getByLabelText('会话名称')

    await user.clear(input)
    await user.type(input, '  新   会话   标题  ')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(props.onConfirm).toHaveBeenCalledWith('新 会话 标题')
  })

  it('calls onConfirm when pressing Enter with valid title', async () => {
    const user = userEvent.setup()
    const props = renderModal()
    const input = screen.getByLabelText('会话名称')

    await user.clear(input)
    await user.type(input, '新标题{Enter}')

    expect(props.onConfirm).toHaveBeenCalledWith('新标题')
  })

  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup()
    const props = renderModal()

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(props.onClose).toHaveBeenCalled()
  })

  it('disables input and buttons while loading', () => {
    renderModal({ loading: true })

    expect(screen.getByLabelText('会话名称')).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '关闭' })).toBeDisabled()
  })
})