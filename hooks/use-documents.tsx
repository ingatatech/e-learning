"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import type { Document } from "@/types"

interface DocumentsContextType {
  documents: Document[]
  loading: boolean
  error: string | null
  fetchDocuments: (forceRefresh?: boolean) => Promise<void>
  getDocument: (id: string) => Document | undefined
  invalidateCache: () => void
  updateDocumentInCache: (id: string, updates: Partial<Document>) => void
  addDocumentToCache: (document: Document) => void
  removeDocumentFromCache: (id: string) => void
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const { user, token } = useAuth()

  const fetchDocuments = async (forceRefresh = false) => {
    if (hasFetched && documents.length > 0 && !forceRefresh) {
      return
    }

    if (!user || !token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      let url = ""

      if (user.role === "instructor") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/docs/instructor/${user.id}`
      } else if (user.role === "sysAdmin") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/docs/submitted`
      } else {
        return
      }


      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
        setHasFetched(true)
      } else {
        throw new Error("Failed to fetch documents")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }

  const getDocument = (id: string) => {
    const doc = documents.find((document) => Number(document.id) === Number(id))
    return doc
  }

  const invalidateCache = () => {
    setDocuments([])
    setHasFetched(false)
  }

  const updateDocumentInCache = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)))
  }

  const addDocumentToCache = (document: Document) => {
    setDocuments((prev) => [document, ...prev])
  }

  const removeDocumentFromCache = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        loading,
        error,
        fetchDocuments,
        getDocument,
        invalidateCache,
        updateDocumentInCache,
        addDocumentToCache,
        removeDocumentFromCache,
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
