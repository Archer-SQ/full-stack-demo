export type AsyncResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: string
    }

export const getErrorMessage = (err: unknown, fallback = '请求失败') => {
  return err instanceof Error ? err.message : fallback
}

export const toAsyncResult = async <T>(promise: Promise<T>): Promise<AsyncResult<T>> => {
  try {
    const data = await promise
    return {
      ok: true,
      data,
    }
  } catch (err: unknown) {
    return {
      ok: false,
      error: getErrorMessage(err),
    }
  }
}
