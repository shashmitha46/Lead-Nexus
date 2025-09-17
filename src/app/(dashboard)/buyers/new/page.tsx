import { BuyerForm } from "@/components/buyers/buyer-form";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Create New Lead",
};

export default function NewBuyerPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Create New Lead" />
      <BuyerForm />
    </div>
  );
}
