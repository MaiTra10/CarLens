"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarUrlForm } from "./car-url-form";
import { ManualCarForm } from "./car-manual-form";
import type { Estimate } from "@/app/dashboard/page";

export interface ClientCarFormsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewEstimate: (estimate: Estimate) => void;
}

export function ClientCarForms({ 
  activeTab, 
  setActiveTab, 
  onNewEstimate 
}: ClientCarFormsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="url">From URL</TabsTrigger>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
      </TabsList>
      
      <TabsContent value="url">
        <CarUrlForm onSuccess={onNewEstimate} />
      </TabsContent>
      
      <TabsContent value="manual">
        <ManualCarForm onSuccess={onNewEstimate} />
      </TabsContent>
    </Tabs>
  );
}