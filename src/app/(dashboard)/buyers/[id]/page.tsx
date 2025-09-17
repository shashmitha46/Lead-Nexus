import { notFound } from "next/navigation";
import { getBuyerById } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { BuyerForm } from "@/components/buyers/buyer-form";
import { BuyerHistory } from "@/components/buyers/buyer-history";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const buyer = await getBuyerById(params.id);
  return {
    title: buyer ? `Edit: ${buyer.fullName}` : "Lead Not Found",
  };
}

export default async function EditBuyerPage({
  params,
}: {
  params: { id: string };
}) {
  const buyer = await getBuyerById(params.id);

  if (!buyer) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={`Edit: ${buyer.fullName}`} />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <BuyerForm buyer={buyer} />
        </div>
        <div className="md:col-span-1">
            <BuyerHistory buyerId={buyer.id} />
        </div>
      </div>
    </div>
  );
}
