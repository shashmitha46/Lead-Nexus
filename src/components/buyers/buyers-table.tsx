import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Buyer } from "@/lib/types"
import { format } from "date-fns"
import { BuyersTableActions } from "./buyers-table-actions"

interface BuyersTableProps {
  buyers: Buyer[]
}

const statusColors: Record<Buyer["status"], string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  Qualified: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
  Contacted: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
  Visited: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
  Negotiation: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  Converted: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Dropped: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

function formatBudget(min: number | null, max: number | null) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

  if (min && max) {
    if (min === max) return formatter.format(min)
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }
  if (min) return `From ${formatter.format(min)}`
  if (max) return `Up to ${formatter.format(max)}`
  return "N/A"
}

export function BuyersTable({ buyers }: BuyersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Phone</TableHead>
          <TableHead className="hidden lg:table-cell">City</TableHead>
          <TableHead className="hidden lg:table-cell">Property</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead className="hidden md:table-cell">Timeline</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Last Updated</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers.length > 0 ? (
          buyers.map((buyer) => (
            <TableRow key={buyer.id}>
              <TableCell className="font-medium">{buyer.fullName}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {buyer.phone}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">{buyer.city}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {buyer.propertyType}
                {buyer.bhk && ` (${buyer.bhk} BHK)`}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{buyer.timeline}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[buyer.status]}
                >
                  {buyer.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {format(new Date(buyer.updatedAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell>
                <BuyersTableActions buyer={buyer} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
