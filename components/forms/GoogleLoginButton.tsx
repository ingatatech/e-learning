import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  onError?: (msg: string) => void;
}

export function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = async (response: any) => {
      setLoading(true);
      const token = response.credential;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          if (onError) onError(data.message || "Google login failed");
          return;
        }
        setUser(data.user);
        localStorage.setItem("Euser", JSON.stringify(data.user))
        localStorage.setItem("Etoken", JSON.stringify(data.accessToken))
        if (data.user.firstLogin) {
        router.push("/change-password")
        } else {
          router.push(`/${data.user.role}`)
        }
      } catch (err: any) {
        if (onError) onError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true,
    });

    if (!loading) {
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large" }
      );
    }
  }, [loading]);

  return (
    <div className="w-full flex justify-center">
      {loading ? (
        <button className="w-full py-2 flex justify-center items-center border rounded" disabled>
          <Loader2 className="animate-spin mr-2" /> Logging in...
        </button>
      ) : (
        <div id="googleButton"></div>
      )}
    </div>
  );
}
