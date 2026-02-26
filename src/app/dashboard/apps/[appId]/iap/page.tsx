"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, CreditCard } from "@phosphor-icons/react";
import { toast } from "sonner";
import { MOCK_APPS } from "@/lib/mock-data";

const MOCK_IAPS = [
  {
    id: "iap-1",
    name: "Pro upgrade",
    productId: "com.example.weatherly.pro",
    type: "Non-consumable",
    price: "$4.99",
    status: "Approved",
  },
  {
    id: "iap-2",
    name: "Tip jar – small",
    productId: "com.example.weatherly.tip.small",
    type: "Consumable",
    price: "$0.99",
    status: "Approved",
  },
  {
    id: "iap-3",
    name: "Tip jar – large",
    productId: "com.example.weatherly.tip.large",
    type: "Consumable",
    price: "$4.99",
    status: "Approved",
  },
];

export default function InAppPurchasesPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          In-app purchases
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Not available in prototype")}
        >
          <Plus size={14} className="mr-1.5" />
          New product
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="consumable">Consumable</TabsTrigger>
          <TabsTrigger value="non-consumable">Non-consumable</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        {MOCK_IAPS.map((iap, i) => (
          <div
            key={iap.id}
            className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                {iap.type === "Consumable" ? (
                  <CreditCard size={14} className="text-muted-foreground" />
                ) : (
                  <Package size={14} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{iap.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {iap.productId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono">{iap.price}</span>
              <Badge variant="outline" className="text-xs">
                {iap.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
