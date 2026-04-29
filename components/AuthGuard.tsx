// /components/AuthGuard.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    check()
  }, [])

  async function check() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return <>{children}</>
}