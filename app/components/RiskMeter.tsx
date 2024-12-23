"use client";

import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number | 0;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const getColor = (score: number) => {
    if (score <= 30) return "bg-green-500";
    if (score <= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full font-sans">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Risk Score</span>
        <span
          className={cn(
            "text-sm font-medium",
            score <= 30
              ? "text-green-700"
              : score <= 70
              ? "text-yellow-700"
              : "text-red-700"
          )}
        >
          {score}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={cn("h-2.5 rounded-full", getColor(score))}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}
