import { afterEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('http', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses JSON response', async () => {
    const fetchMock = mockFetch(
      new Response(JSON.stringify({ database: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(http.get<{ database: string }>('/api/health')).resolves.toEqual({
      database: 'ok',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )
  })

  it('returns undefined for 204 response', async () => {
    mockFetch(new Response(null, { status: 204 }))

    await expect(http.delete<void>('/api/sessions/1')).resolves.toBeUndefined()
  })

  it('returns undefined for empty successful response body', async () => {
    mockFetch(new Response('', { status: 200 }))

    await expect(http.get<void>('/api/empty')).resolves.toBeUndefined()
  })

  it('throws error when response is not ok', async () => {
    mockFetch(new Response('session not found', { status: 404 }))

    await expect(http.get('/api/sessions/999')).rejects.toThrow('session not found')
  })
})