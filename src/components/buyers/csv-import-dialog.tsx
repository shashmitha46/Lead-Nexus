"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { importBuyers } from "@/lib/actions"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Download } from "lucide-react"

type ImportError = {
  row: number
  message: string
}

export function CSVImportDialog() {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setErrors([])
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to import.",
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("file", file)

      const result = await importBuyers(formData)

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `${result.importedCount} leads have been imported.`,
        })
        setIsOpen(false)
        setFile(null)
        setErrors([])
        router.refresh()
      } else {
        setErrors(result.errors || [])
      }
    })
  }
  
  const resetState = () => {
    setFile(null)
    setErrors([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if(!open) resetState()
        }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Import
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file to import. The file must have the correct headers.
            Max 200 rows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Import Errors</AlertTitle>
              <AlertDescription>
                Some rows could not be imported. Please fix the errors and try again.
              </AlertDescription>
              <div className="mt-4 max-h-60 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!file || isPending}>
            {isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
