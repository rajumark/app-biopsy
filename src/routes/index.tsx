import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import DefaultPage from "@/components/default-page"

/*
 * Update this page to modify your home page.
 * You can delete this file component to start from a blank page.
 */

function HomePage() {
  const [currentPage, setCurrentPage] = useState<{ type: string; title: string }>({ type: "explore-files", title: "" })

  const renderContent = () => {
    switch(currentPage.type) {
      case "explore-files":
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <h1 className="text-2xl font-semibold">Explore files</h1>
          </div>
        )
      case "files-category":
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <h1 className="text-2xl font-semibold">Files Category</h1>
          </div>
        )
      default:
        if (currentPage.title) {
          return <DefaultPage title={currentPage.title} />
        }
        return (
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setCurrentPage} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-12">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
