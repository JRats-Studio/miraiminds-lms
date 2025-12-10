'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  type CollectionSlug,
  type QueryParams,
  type PaginatedResponse,
} from '@/lib/api/payload-api'

interface UseCollectionOptions extends QueryParams {
  enabled?: boolean
}

interface UseCollectionReturn<T> {
  data: PaginatedResponse<T> | null
  loading: boolean
  error: string | null
  params: QueryParams
  setParams: (params: QueryParams) => void
  refresh: () => Promise<void>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
}

/**
 * React hook for managing Payload collection data
 * Provides CRUD operations with automatic refresh
 */
export function useCollection<T>(
  collection: CollectionSlug,
  options: UseCollectionOptions = {}
): UseCollectionReturn<T> {
  const { enabled = true, ...initialParams } = options

  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    depth: 1,
    ...initialParams,
  })

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getDocuments<T>(collection, params)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(message)
      console.error(`Error fetching ${collection}:`, err)
    } finally {
      setLoading(false)
    }
  }, [collection, params, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const create = async (newData: Partial<T>): Promise<T> => {
    const result = await createDocument<T>(collection, newData)
    await fetchData() // Refresh list
    return result.doc
  }

  const update = async (id: string, updateData: Partial<T>): Promise<T> => {
    const result = await updateDocument<T>(collection, id, updateData)
    await fetchData() // Refresh list
    return result.doc
  }

  const remove = async (id: string): Promise<void> => {
    await deleteDocument(collection, id)
    await fetchData() // Refresh list
  }

  const updateParams = useCallback((newParams: QueryParams) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }, [])

  return {
    data,
    loading,
    error,
    params,
    setParams: updateParams,
    refresh: fetchData,
    create,
    update,
    remove,
  }
}

/**
 * Hook to fetch a single document by ID
 */
export function useDocument<T>(
  collection: CollectionSlug,
  id: string | null,
  depth?: number
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { getDocument } = await import('@/lib/api/payload-api')
      const result = await getDocument<T>(collection, id, depth)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch document'
      setError(message)
      console.error(`Error fetching ${collection}/${id}:`, err)
    } finally {
      setLoading(false)
    }
  }, [collection, id, depth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
