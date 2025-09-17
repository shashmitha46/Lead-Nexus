import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getBuyers } from "@/lib/data"
import { BuyersTable } from "@/components/buyers/buyers-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { BuyersTableToolbar } from "@/components/buyers/buyers-table-toolbar"

export const metadata = {
  title: "Buyers",
}

interface BuyersPageProps {
  searchParams: {
    page?: string
    limit?: string
    query?: string
    city?: string
    propertyType?: string
    status?: string
    timeline?: string
  }
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  // Parse search params
  const params = await Promise.resolve(searchParams)
  const page = Number(params?.page) || 1
  const limit = Number(params?.limit) || 10
  const query = params?.query || ""
  const city = params?.city || undefined
  const propertyType = params?.propertyType || undefined
  const status = params?.status || undefined
  const timeline = params?.timeline || undefined

  const { buyers, total } = await getBuyers({
    page,
    limit,
    query,
    city,
    propertyType,
    status,
    timeline,
  })

  return (
    <div className="space-y-4">
      <PageHeader title="Buyer Leads">
        <Button asChild size="sm" className="gap-1">
          <Link href="/buyers/new">
            <PlusCircle className="h-4 w-4" />
            Create Lead
          </Link>
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent>
          <div className="py-4">
            <BuyersTableToolbar />
          </div>
          <div className="border rounded-md">
            <BuyersTable buyers={buyers} />
          </div>
          <div className="pt-4">
            <DataTablePagination page={page} limit={limit} total={total} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
