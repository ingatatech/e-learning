"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "@/components/payment/subscription-plans"
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react"

interface Payment {
  id: string
  courseId: string
  courseTitle: string
  amount: number
  currency: string
  status: "succeeded" | "failed" | "pending"
  method: string
  createdAt: string
  receiptUrl: string | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: "current-user-id",
        status: filter,
      })

      const response = await fetch(`/api/payments/history?${params}`)
      const data = await response.json()
      setPayments(data.payments)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const totalSpent = payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments & Billing</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your payments, subscriptions, and billing information
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-primary-600">${totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Payments</p>
                <p className="text-2xl font-bold text-primary-600">
                  {payments.filter((p) => p.status === "succeeded").length}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-primary-600">$149.98</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment History</CardTitle>
                <div className="flex gap-2">
                  {["all", "succeeded", "failed", "pending"].map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{payment.courseTitle}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(payment.createdAt).toLocaleDateString()} • {payment.method}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${payment.amount}</p>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </div>

                        {payment.receiptUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No payments found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionPlans />
        </TabsContent>
      </Tabs>
    </div>
  )
}
