import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { FilesCategoryPanel } from "@/components/files-category-panel";
import { ipc } from "@/ipc/manager";
import { ProjectInfo } from "@/components/project-list-dialog";

function FilesCategoryPage() {
  const [activeProject, setActiveProject] = useState<ProjectInfo | null>(null);

  useEffect(() => {
    const fetchDefault = async () => {
      const projectId = await ipc.client.project.getDefaultProjectHandler();
      if (projectId) {
        const list = await ipc.client.project.getProjectList();
        const found = list.find((p: any) => p.project_id === projectId);
        if (found) setActiveProject(found as unknown as ProjectInfo);
      }
    };
    fetchDefault();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Raw source</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Files Category</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto w-full">
          <FilesCategoryPanel activeProject={activeProject} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute("/files-category")({
  component: FilesCategoryPage,
});
