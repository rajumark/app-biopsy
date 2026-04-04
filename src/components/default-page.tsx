import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DefaultPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            This page is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Content for {title} will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
