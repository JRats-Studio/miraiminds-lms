/**
 * Payload CMS REST API helper functions
 * Provides type-safe CRUD operations for all collections
 */

// Collection types (matching Payload collections)
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'student'
  createdAt: string
  updatedAt: string
}

export interface Grade {
  id: string
  name: string
  description?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: string
  name: string
  grade: string | Grade
  description?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  name: string
  subject: string | Subject
  description?: unknown // Rich text content
  videoUrl?: string
  allowedUsers?: (string | User)[]
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  title: string
  module: string | Module
  content?: unknown // Rich text content
  pdfUrl?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type CollectionSlug = 'users' | 'grades' | 'subjects' | 'modules' | 'lessons'

export type CollectionDocument = User | Grade | Subject | Module | Lesson

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  where?: Record<string, unknown>
  depth?: number
}

// Base fetch wrapper with credentials
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include auth cookies
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * GET all documents from a collection (paginated)
 */
export async function getDocuments<T>(
  collection: CollectionSlug,
  params: QueryParams = {}
): Promise<PaginatedResponse<T>> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.depth !== undefined) searchParams.set('depth', params.depth.toString())
  if (params.where) searchParams.set('where', JSON.stringify(params.where))

  const query = searchParams.toString()
  return fetchAPI<PaginatedResponse<T>>(`/${collection}${query ? `?${query}` : ''}`)
}

/**
 * GET a single document by ID
 */
export async function getDocument<T>(
  collection: CollectionSlug,
  id: string,
  depth?: number
): Promise<T> {
  const query = depth !== undefined ? `?depth=${depth}` : ''
  return fetchAPI<T>(`/${collection}/${id}${query}`)
}

/**
 * CREATE a new document
 */
export async function createDocument<T>(
  collection: CollectionSlug,
  data: Partial<T>
): Promise<{ doc: T; message: string }> {
  return fetchAPI<{ doc: T; message: string }>(`/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * UPDATE an existing document
 */
export async function updateDocument<T>(
  collection: CollectionSlug,
  id: string,
  data: Partial<T>
): Promise<{ doc: T; message: string }> {
  return fetchAPI<{ doc: T; message: string }>(`/${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE a document
 */
export async function deleteDocument(
  collection: CollectionSlug,
  id: string
): Promise<{ id: string; message: string }> {
  return fetchAPI<{ id: string; message: string }>(`/${collection}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetchAPI<{ user: User | null }>('/users/me')
    return response.user
  } catch {
    return null
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  await fetchAPI('/users/logout', { method: 'POST' })
}
