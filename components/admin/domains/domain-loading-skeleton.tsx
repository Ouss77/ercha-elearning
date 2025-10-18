import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DomainLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

