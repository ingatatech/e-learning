"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

export default function OrgManagement() {
    const { token, user } = useAuth()
    if (!token || !user) return

    useEffect(() => {
        const fetchOrg = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${user.organization?.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = res.json()
            console.log(data)
        }

    fetchOrg()
    }, [token, user])

    return (
        <div>
            <h1>Organization</h1>
        </div>
    )
}