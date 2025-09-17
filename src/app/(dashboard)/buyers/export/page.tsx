
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportBuyersAction } from "@/lib/actions";
import { buyerSchema, baseBuyerSchema } from "@/lib/schemas";
import { z } from "zod";

type BuyerKeys = keyof z.infer<typeof buyerSchema>;

const allFields = Object.keys(
  baseBuyerSchema.shape
) as BuyerKeys[];

const defaultSelectedFields: BuyerKeys[] = [
  "fullName", "email", "phone", "city", "propertyType", "bhk", "purpose", "budgetMin", "budgetMax", "timeline", "source", "status", "tags",
];

export default function ExportBuyersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<BuyerKeys[]>(defaultSelectedFields);
  const [isExporting, setIsExporting] = useState(false);

  const handleFieldToggle = (field: BuyerKeys) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => setSelectedFields(allFields);
  const handleSelectNone = () => setSelectedFields([]);

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        variant: "destructive",
        title: "No fields selected",
        description: "Please select at least one field to export.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportBuyersAction({ fields: selectedFields });
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `lead-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Export successful",
          description: "Your lead data has been downloaded.",
        });
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Could not export leads.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/buyers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <PageHeader title="Export Leads" className="flex-1" />
      </div>
       <p className="text-muted-foreground -mt-4">
        Download your lead data as a CSV file.
      </p>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>
            Choose which fields to include in your CSV export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSelectNone}>
              Select None
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {allFields.map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={() => handleFieldToggle(field)}
                />
                <Label htmlFor={field} className="capitalize font-normal">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : `Export CSV (${selectedFields.length} fields)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
