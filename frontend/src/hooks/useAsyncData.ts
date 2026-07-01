import { useEffect, useState } from 'react'
import { getErrorMessage } from '../utils/asyncResult'

export const useAsyncData = <T>(request: () => Promise<T>, initialData: T) => {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await request()

        if (!ignore) {
          setData(result)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [request])

  return {
    data,
    setData,
    loading,
    error,
    setError,
  }
}
