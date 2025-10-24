"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Palette, Save, Lock, ShieldCheck, KeyRound } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const [show2FADialog, setShow2FADialog] = useState(false)

  const [userInfo, setUserInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    organization: user?.organization?.name || "",
  })

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: user?.theme || "light",
    language: user?.preferredLanguage || "en",
  })

  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization?.name || "",
      })
      setAppearance({
        theme: user.theme || "light",
        language: user.preferredLanguage || "en",
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        }),
      })

      if (response.ok) {
        updateUser({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        })
        toast.success("Profile updated successfully!")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAppearance = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme: appearance.theme,
          preferredLanguage: appearance.language,
        }),
      })

      if (response.ok) {
        updateUser({
          theme: appearance.theme,
          preferredLanguage: appearance.language,
        })
        toast.success("Appearance settings updated!")
      } else {
        toast.error("Failed to update settings")
      }
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle2FA = () => {
    setShow2FADialog(true)
  }

  const confirmToggle2FA = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${user?.id}/twostepv`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          twostepv: !user!.twostepv,
        }),
      })

      if (response.ok) {
        updateUser({
          twostepv: !user!.twostepv,
        })
        toast.success(`2FA ${!user!.twostepv ? "enabled" : "disabled"} successfully!`)
        setShow2FADialog(false)
      } else {
        toast.error("Failed to update 2FA settings")
      }
    } catch (error) {
      toast.error("Failed to update 2FA settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => setAppearance({ ...appearance, theme: value })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={appearance.language}
                  onValueChange={(value) => setAppearance({ ...appearance, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleSaveAppearance} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2FA Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account by requiring a verification code in addition to
                        your password when signing in.
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleToggle2FA}
                          disabled={isSaving}
                          variant={user?.twostepv ? "destructive" : "default"}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {user?.twostepv ? "Disable 2FA" : "Enable 2FA"}
                        </Button>
                        {user?.twostepv && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="font-medium">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <KeyRound className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your password regularly to keep your account secure. Use a strong password with a mix of
                        letters, numbers, and symbols.
                      </p>
                      <Button onClick={() => router.push("/change-password")} variant="outline">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user?.twostepv ? "Disable Two-Factor Authentication?" : "Enable Two-Factor Authentication?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user?.twostepv
                ? "Disabling 2FA will make your account less secure. You will only need your password to sign in."
                : "Enabling 2FA will add an extra layer of security to your account. You will need to enter a verification code sent to your email when signing in."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle2FA} disabled={isSaving}>
              {isSaving ? "Processing..." : user?.twostepv ? "Disable 2FA" : "Enable 2FA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
