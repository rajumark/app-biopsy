import { createFileRoute } from "@tanstack/react-router";
import { SimpleSidebar } from "@/components/simple-sidebar"
import { AppMenubar } from "@/components/app-menubar"
import { useState, useEffect } from "react"
import DefaultPage from "@/components/default-page"
import { UploadDialog } from "@/components/upload-dialog"
import { ProjectListDialog, ProjectInfo } from "@/components/project-list-dialog"
import { DecompileManagerDialog } from "@/components/decompile-manager-dialog"
import { ipc } from "@/ipc/manager"

/*
 * Update this page to modify your home page.
 * You can delete this file component to start from a blank page.
 */

function HomePage() {
  const [currentPage, setCurrentPage] = useState<{ type: string; title: string }>({ type: "explore-files", title: "" })
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isProjectListOpen, setIsProjectListOpen] = useState(false)
  const [isDecompileManagerOpen, setIsDecompileManagerOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<ProjectInfo | null>(null)
  const [isProjectListMandatory, setIsProjectListMandatory] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const projectId = await ipc.client.project.getDefaultProjectHandler()
        if (projectId) {
          const allProjects = await ipc.client.project.getProjectList()
          const matched = allProjects.find((p: any) => p.project_id === projectId)
          if (matched) {
            setActiveProject(matched as ProjectInfo)
            setIsInitializing(false)
            return
          }
        }
      } catch (e) {
        console.error("Init error", e)
      }
      setIsProjectListMandatory(true)
      setIsProjectListOpen(true)
      setIsInitializing(false)
    }
    init()
  }, [])

  const handleSelectProject = async (project: ProjectInfo) => {
    try {
      await ipc.client.project.setDefaultProjectHandler({ projectId: project.project_id })
      setActiveProject(project)
      setIsProjectListMandatory(false)
      setIsProjectListOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

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
    <>
      <div className="fixed top-0 left-0 right-0 pt-6 z-50 bg-background border-b shadow-xs">
        <AppMenubar 
          onNewProject={() => setIsUploadDialogOpen(true)}
          onProjectList={() => setIsProjectListOpen(true)}
          onToolsCheck={() => setIsDecompileManagerOpen(true)}
        />
      </div>
      <div className="flex h-screen">
        <div className="w-[200px] border-r bg-muted/50 pt-8">
          <SimpleSidebar 
            onNavigate={setCurrentPage} 
            currentPage={currentPage} 
            activeProject={activeProject} 
            onShowProjectList={() => setIsProjectListOpen(true)}
            onDecompileClick={() => setIsDecompileManagerOpen(true)}
          />
        </div>
        <div className="flex-1 pt-8">
          <div className="flex flex-1 flex-col gap-4 p-4">
            {renderContent()}
          </div>
        </div>
      </div>
      <UploadDialog 
        isOpen={isUploadDialogOpen} 
        onClose={() => setIsUploadDialogOpen(false)} 
        onProjectCreated={(projectId) => {
          // After created, maybe fetch and set active project
          ipc.client.project.getProjectList().then((list) => {
            const p = list.find((item: any) => item.project_id === projectId)
            if (p) handleSelectProject(p as unknown as ProjectInfo)
          })
        }}
      />
      {!isInitializing && (
        <ProjectListDialog
          isOpen={isProjectListOpen}
          isMandatory={isProjectListMandatory}
          onClose={() => setIsProjectListOpen(false)}
          onSelectProject={handleSelectProject}
          onCreateProjectClick={() => setIsUploadDialogOpen(true)}
          activeProjectId={activeProject?.project_id}
        />
      )}
      <DecompileManagerDialog 
        isOpen={isDecompileManagerOpen}
        onClose={() => setIsDecompileManagerOpen(false)}
      />
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
