import { CircleAlert, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function QueryError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" strokeWidth={1.75} />
      <AlertTitle>Data belum bisa dimuat</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-3">
          <RefreshCw aria-hidden="true" strokeWidth={1.75} />
          Coba Lagi
        </Button>
      </AlertDescription>
    </Alert>
  );
}
