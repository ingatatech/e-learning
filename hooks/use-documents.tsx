"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Document } from "@/types"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/lib/fetcher"

interface DocumentsContextType {
  useDocs: () => {
    documents: Document[]
    loading: boolean
    error: any
    mutate: () => void
  }
  useDocument: (id: string) => {
    document: Document | undefined
    loading: boolean
    error: any
    mutate: () => void
  }
  updateDocumentInCache: (id: string, updates: Partial<Document>) => Promise<void>
  addDocumentToCache: (document: Document) => Promise<void>
  removeDocumentFromCache: (id: string) => Promise<void>
  invalidateCache: () => Promise<void>
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()

  const useDocs = () => {
    const getCacheKey = () => {
      if (!user || !token) return null

      if (user.role === "instructor") {
        return `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user.id}`
      } else if (user.role === "sysAdmin") {
        return `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`
      }

      return null
    }

    const {
      data,
      error,
      isLoading,
      mutate: mutateDocuments,
    } = useSWR(getCacheKey(), (url) => fetcher(url, token!), {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    })

    return {
      documents: data || [],
      loading: isLoading,
      error,
      mutate: mutateDocuments,
    }
  }

  const useDocument = (id: string) => {
    const getCacheKey = () => {
      if (!token || !id) return null
      return `${process.env.NEXT_PUBLIC_API_URL}/docs/${id}`
    }

    const {
      data,
      error,
      isLoading,
      mutate: mutateDocument,
    } = useSWR(getCacheKey(), (url) => fetcher(url, token!), {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    })

    return {
      document: data,
      loading: isLoading,
      error,
      mutate: mutateDocument,
    }
  }

  const updateDocumentInCache = async (id: string, updates: Partial<Document>) => {
    const listCacheKey =
      user?.role === "instructor"
        ? `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`

    const singleCacheKey = `${process.env.NEXT_PUBLIC_API_URL}/docs/${id}`

    // Update both list and single document caches
    await Promise.all([
      mutate(
        listCacheKey,
        (data: Document[]) => {
          if (!data) return data
          return data.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
        },
        { revalidate: false },
      ),
      mutate(
        singleCacheKey,
        (data: Document) => {
          if (!data) return data
          return { ...data, ...updates }
        },
        { revalidate: false },
      ),
    ])
  }

  const addDocumentToCache = async (document: Document) => {
    const listCacheKey =
      user?.role === "instructor"
        ? `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`

    await mutate(
      listCacheKey,
      (data: Document[]) => {
        if (!data) return [document]
        return [document, ...data]
      },
      { revalidate: false },
    )
  }

  const removeDocumentFromCache = async (id: string) => {
    const listCacheKey =
      user?.role === "instructor"
        ? `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`

    await mutate(
      listCacheKey,
      (data: Document[]) => {
        if (!data) return data
        return data.filter((doc) => doc.id !== id)
      },
      { revalidate: false },
    )
  }

  const invalidateCache = async () => {
    const cacheKeys = [
      `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user?.id}`,
      `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`,
    ]

    await Promise.all(cacheKeys.map((key) => mutate(key)))
  }

  return (
    <DocumentsContext.Provider
      value={{
        useDocs,
        useDocument,
        updateDocumentInCache,
        addDocumentToCache,
        removeDocumentFromCache,
        invalidateCache,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider")
  }
  return context
}
