"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { STATUSES } from "@/lib/constants"
import type { Buyer, Status } from "@/lib/types"
import { useTransition } from "react"
import { updateBuyerStatus } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface BuyersTableActionsProps {
  buyer: Buyer
}

export function BuyersTableActions({ buyer }: BuyersTableActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatusChange = (status: Status) => {
    startTransition(async () => {
      const result = await updateBuyerStatus(buyer.id, buyer.updatedAt, status)
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Buyer "${buyer.fullName}" status changed to ${status}.`,
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error,
        })
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/buyers/${buyer.id}`)}>
          View / Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isPending}>
            Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={buyer.status}
              onValueChange={(value) => handleStatusChange(value as Status)}
            >
              {STATUSES.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {status}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
