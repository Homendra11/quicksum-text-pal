
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryHistoryProps {
  history: any[]; // Array of summary records
}

const SummaryHistory = ({ history }: SummaryHistoryProps) => {
  if (!history?.length) {
    return (
      <div className="text-gray-500 text-center text-sm">
        No summary history found.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((record, i) => (
            <div
              key={record.id || i}
              className="border-b border-gray-200 pb-4 mb-4 last:mb-0 last:border-none"
            >
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <div className="flex flex-wrap gap-2">
                  {record.summary_type && (
                    <Badge>{record.summary_type}</Badge>
                  )}
                  {record.summary_tone && (
                    <Badge variant="outline">{record.summary_tone}</Badge>
                  )}
                  {typeof record.summary_length === "number" && (
                    <Badge variant="outline">
                      {record.summary_length}% length
                    </Badge>
                  )}
                  {record.file_name && (
                    <Badge variant="secondary">{record.file_name}</Badge>
                  )}
                  {record.summary_input_type && (
                    <Badge>{record.summary_input_type}</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {record.created_at
                    ? new Date(record.created_at).toLocaleString()
                    : ""}
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-800 mb-2">
                {record.summary_result}
              </div>
              <div className="flex flex-wrap gap-2">
                {record.keywords &&
                  Array.isArray(record.keywords) &&
                  record.keywords.map((keyword: string) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryHistory;
