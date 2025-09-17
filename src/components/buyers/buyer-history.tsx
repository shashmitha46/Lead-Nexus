import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBuyerHistory } from "@/lib/data";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User } from "lucide-react";

interface BuyerHistoryProps {
  buyerId: string;
}

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "empty";
  return `"${String(value)}"`;
};

export async function BuyerHistory({ buyerId }: BuyerHistoryProps) {
  const history = await getBuyerHistory(buyerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
        <CardDescription>Last 5 changes made to this lead.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <ScrollArea className="h-72">
            <div className="space-y-6">
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {entry.changedBy}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {Object.entries(entry.diff).map(([key, value]) => (
                        <div key={key}>
                          {key === "_initial" ? (
                             <span>Lead created</span>
                          ) : (
                            <span>
                              Changed <span className="font-semibold">{key}</span> from{" "}
                              {formatValue(value.old)} to {formatValue(value.new)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1" title={format(new Date(entry.changedAt), "PPpp")}>
                      {formatDistanceToNow(new Date(entry.changedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No history found for this lead.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
