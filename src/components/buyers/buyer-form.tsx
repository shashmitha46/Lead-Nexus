"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buyerSchema, type BuyerFormValues } from "@/lib/schemas"
import {
  CITIES,
  PROPERTY_TYPES,
  BHK_OPTIONS,
  PURPOSES,
  TIMELINES,
  SOURCES,
  RESIDENTIAL_PROPERTY_TYPES,
} from "@/lib/constants"
import type { Buyer } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createBuyerAction, updateBuyerAction, getSuggestedTags } from "@/lib/actions"
import { TagInput } from "./tag-input"
import { Badge } from "../ui/badge"
import { Sparkles } from "lucide-react"
import { useState, useTransition } from "react"

interface BuyerFormProps {
  buyer?: Buyer | null
}

export function BuyerForm({ buyer }: BuyerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isSuggesting, startSuggestion] = useTransition()

  const form = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: buyer?.fullName || "",
      email: buyer?.email || "",
      phone: buyer?.phone || "",
      city: buyer?.city,
      propertyType: buyer?.propertyType,
      bhk: buyer?.bhk || null,
      purpose: buyer?.purpose,
      budgetMin: buyer?.budgetMin || null,
      budgetMax: buyer?.budgetMax || null,
      timeline: buyer?.timeline,
      source: buyer?.source,
      notes: buyer?.notes || "",
      tags: buyer?.tags || [],
      updatedAt: buyer?.updatedAt,
    },
  })

  const propertyType = form.watch("propertyType")
  const notes = form.watch("notes")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  async function onSubmit(data: BuyerFormValues) {
    startTransition(async () => {
      const action = buyer
        ? () => updateBuyerAction(buyer.id, data)
        : () => createBuyerAction(data)

      const result = await action()

      if (result.success) {
        toast({
          title: `Buyer ${buyer ? "updated" : "created"}`,
          description: `The buyer "${data.fullName}" has been successfully ${
            buyer ? "updated" : "saved"
          }.`,
        })
        router.push("/buyers")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: result.error || "Something went wrong.",
        })
        const errorRegion = document.getElementById('form-error-region')
        if (errorRegion) errorRegion.focus()
      }
    })
  }
  
  const handleSuggestTags = async () => {
    if(!notes?.trim()) {
      setSuggestedTags([]);
      return;
    }
    startSuggestion(async () => {
      const result = await getSuggestedTags(notes);
      if(result.success) {
        setSuggestedTags(result.tags || []);
      } else {
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: result.error,
        })
      }
    })
  }

  const addSuggestedTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tag)) {
      form.setValue("tags", [...currentTags, tag]);
    }
    setSuggestedTags(currentTags.filter(t => t !== tag));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div id="form-error-region" tabIndex={-1} aria-live="assertive" className="sr-only" />
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Requirements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {propertyType && RESIDENTIAL_PROPERTY_TYPES.includes(propertyType) && (
              <FormField
                control={form.control}
                name="bhk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BHK</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select BHK" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BHK_OPTIONS.map((bhk) => (
                          <SelectItem key={bhk} value={bhk}>
                            {bhk}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PURPOSES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Budget (INR, Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000000"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Budget (INR, Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 7500000"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMELINES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 space-y-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any notes about the lead..."
                        className="resize-min h-24"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggesting}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isSuggesting ? "Thinking..." : "Suggest Tags"}
                </Button>
                {suggestedTags.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-2">
                     {suggestedTags.map(tag => (
                       <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addSuggestedTag(tag)}>
                         {tag}
                       </Badge>
                     ))}
                   </div>
                )}
              </div>
            </div>
             <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                            <TagInput {...field} placeholder="Add relevant tags..." />
                        </FormControl>
                        <FormDescription>
                            Press Enter or comma to add a tag.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
        </Card>
        
        {buyer && <input type="hidden" {...form.register("updatedAt")} />}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Lead"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
