"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["buyer", "admin"]).default("buyer"),
})

export default function SignupPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", role: "buyer" },
  })

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const { data, error: err } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/login`,
          data: { role: values.role },
        }
      })
      if (err) {
        setError(err.message)
        const region = document.getElementById("auth-error")
        region?.focus()
        return
      }
      // If email confirmations are enabled, there may be no session yet
      if (!data?.session) {
        setSuccess("Check your email to confirm your account, then log in.")
        return
      }
      router.replace("/buyers")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-md w-full p-6">
      <h1 className="text-2xl font-semibold mb-6">Sign up</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div id="auth-error" tabIndex={-1} aria-live="assertive" className="sr-only" />
          {error && (
            <div role="alert" className="text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div role="status" aria-live="polite" className="text-sm text-green-600">
              {success}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" required autoFocus {...field} />
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
                  <Input type="password" autoComplete="new-password" placeholder="••••••" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account? <a className="underline" href="/auth/login">Log in</a>
      </p>
    </div>
  )
}


