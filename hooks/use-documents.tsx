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
  fetchSingleDocument: (id: string) => Promise<Document | null>
  invalidateCache: () => void
  updateDocumentInCache: (id: string, updates: Partial<Document>) => void
  addDocumentToCache: (document: Document) => void
  removeDocumentFromCache: (id: string) => void
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

// Cache keys based on user role
const DOCUMENTS_CACHE_KEYS = "docs"

const loadFromLocal = (): Document[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_CACHE_KEYS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToLocal = (data: Document[]) => {
  try {
    localStorage.setItem(DOCUMENTS_CACHE_KEYS, JSON.stringify(data))
  } catch {
    console.error("Could not save documents to localStorage")
  }
}


export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, token } = useAuth()

  const fetchDocuments = async (forceRefresh = false) => {

    if (!user || !token) return

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedDocuments = loadFromLocal()
      if (cachedDocuments.length > 0) {
        setDocuments(cachedDocuments)
        return
      }
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
        // Save to localStorage
        saveToLocal(data)
        
        setDocuments(data)
      } else {
        throw new Error("Failed to fetch documents")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }

  const getDocument = (id: string): Document | undefined => {
    // First check in-memory cache
    const inMemoryDoc = documents.find((document) => Number(document.id) === Number(id))
    if (inMemoryDoc) return inMemoryDoc
    
    // Then check localStorage cache
    if (user) {
      const cachedDocuments = loadFromLocal()
      return cachedDocuments.find((document) => Number(document.id) === Number(id))
    }
    
    return undefined
  }

  const fetchSingleDocument = async (id: string): Promise<Document | null> => {
    // First check cache
    const cachedDoc = getDocument(id)
    if (cachedDoc) return cachedDoc

    // If not in cache, fetch from API
    if (!token) return null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const document = await response.json()
        
        // Add to cache
        if (user) {
          const cachedDocuments = loadFromLocal()
          const updatedDocuments = [...cachedDocuments.filter(d => d.id !== document.id), document]
          saveToLocal(updatedDocuments)
          
          // Also update in-memory state
          setDocuments(prev => {
            const filtered = prev.filter(d => d.id !== document.id)
            return [...filtered, document]
          })
        }
        
        return document
      }
      return null
    } catch (err) {
      console.error("Error fetching single document:", err)
      return null
    }
  }

  const invalidateCache = () => {
    setDocuments([])
    if (user) {
      localStorage.removeItem(DOCUMENTS_CACHE_KEYS)
    }
  }

  const updateDocumentInCache = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) => {
      const updated = prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
      
      // Also update localStorage
      if (user) {
        saveToLocal(updated)
      }
      
      return updated
    })
  }

  const addDocumentToCache = (document: Document) => {
    setDocuments((prev) => {
      const updated = [document, ...prev]
      
      // Also update localStorage
      if (user) {
        saveToLocal(updated)
      }
      
      return updated
    })
  }

  const removeDocumentFromCache = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== id)
      
      // Also update localStorage
      if (user) {
        saveToLocal(updated)
      }
      
      return updated
    })
  }

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        loading,
        error,
        fetchDocuments,
        getDocument,
        fetchSingleDocument,
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