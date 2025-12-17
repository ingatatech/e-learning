// SWR fetcher utility
export async function fetcher<T = any>(url: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.")
    // Attach extra info to the error object
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

// POST fetcher for mutations
export async function postFetcher<T = any>(url: string, { arg }: { arg: any }, token?: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const error = new Error("An error occurred while posting the data.")
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}
