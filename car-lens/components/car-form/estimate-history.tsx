"use client";

import type { Estimate } from "@/app/dashboard/page";
import { formatDistanceToNow } from "date-fns";
import { Link2, ClipboardList } from "lucide-react";

interface EstimateHistoryProps {
  estimates: Estimate[];
}

export function EstimateHistory({ estimates }: EstimateHistoryProps) {
  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No estimates yet. Get your first car price estimate!</p>
      </div>
    );
  }

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {estimates.map((estimate) => (
        <div key={estimate.id} className="border rounded-lg p-3 hover:bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{estimate.makeModel}</p>
              <div className="text-sm text-slate-600">
                <p>{estimate.year} • {estimate.mileage.toLocaleString()} miles</p>
                <p>${estimate.estimatedPrice.toLocaleString()}</p>
                <p className="text-xs text-slate-400">
                  {formatTimeAgo(estimate.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {estimate.isScraped ? (
                <Link2 size={16} className="text-blue-500" />
              ) : (
                <ClipboardList size={16} className="text-green-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}