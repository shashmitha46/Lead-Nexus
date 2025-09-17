"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
})

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError(null)
    startTransition(async () => {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (err) {
        setError(err.message)
        const region = document.getElementById("auth-error")
        region?.focus()
        return
      }
      router.replace("/buyers")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-md w-full p-6">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div id="auth-error" tabIndex={-1} aria-live="assertive" className="sr-only" />
          {error && (
            <div role="alert" className="text-sm text-red-600">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account? <a className="underline" href="/auth/signup">Sign up</a>
      </p>
    </div>
  )
}


