import { createFileRoute } from "@tanstack/react-router";
import { SimpleSidebar } from "@/components/simple-sidebar"
import { AppMenubar } from "@/components/app-menubar"
import { useState, useEffect, useRef } from "react"
import DefaultPage from "@/components/default-page"
import { UploadDialog } from "@/components/upload-dialog"
import { ProjectListDialog, ProjectInfo } from "@/components/project-list-dialog"
import { DecompileManagerDialog } from "@/components/decompile-manager-dialog"
import { FilesCategoryPanel } from "@/components/files-category-panel"
import { Button } from "@/components/ui/button"
import { ipc } from "@/ipc/manager"

// ─── Explore Files / Decompile Panel ────────────────────────────────────────

type DecompileState = "idle" | "running" | "done" | "error"

function ExploreFilesPanel({ activeProject }: { activeProject: ProjectInfo | null }) {
  const [state, setState] = useState<DecompileState>("idle")
  const [logs, setLogs] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const logsRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  const handleDecompile = async () => {
    if (!activeProject) return
    setState("running")
    setLogs("")
    setError(null)
    try {
      const res = await ipc.client.tools.decompileApk({ projectId: activeProject.project_id })
      if (res.success) {
        setState("done")
        setLogs(res.logs || "Done.")
      } else {
        setState("error")
        setError(res.error || "Unknown error")
        setLogs(res.logs || "")
      }
    } catch (e: any) {
      setState("error")
      setError(e?.message || "Unexpected error")
    }
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-muted-foreground text-sm">No project selected.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto flex flex-col gap-4 p-2 max-w-2xl custom-scrollbar min-h-0">
      <h1 className="text-xl font-semibold">Explore Files</h1>

      {/* APK info card */}
      <div className="border rounded-lg p-3 bg-muted/30 text-sm flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">APK</span>
          <span className="font-mono text-foreground/90">{activeProject.local_apk_name || "local_app.apk"}</span>
          <span className="text-xs text-muted-foreground">{activeProject.project_name}</span>
        </div>
        <Button
          size="sm"
          onClick={handleDecompile}
          disabled={state === "running"}
          variant={state === "done" ? "outline" : "default"}
          className="shrink-0"
        >
          {state === "running" ? "Decompiling…" : state === "done" ? "Decompile again" : "Decompile"}
        </Button>
      </div>

      {/* Status badge */}
      {state !== "idle" && (
        <div className={`text-xs font-semibold px-2 py-1 rounded w-fit ${
          state === "running" ? "bg-blue-500/10 text-blue-600" :
          state === "done"    ? "bg-green-500/10 text-green-600" :
                                "bg-red-500/10 text-red-600"
        }`}>
          {state === "running" ? "Decompiling…" : state === "done" ? "✓ Decompiled successfully" : `✗ ${error}`}
        </div>
      )}

      {/* Log output */}
      {logs && (
        <pre
          ref={logsRef}
          className="rounded-lg border bg-muted/50 p-3 text-xs font-mono whitespace-pre-wrap break-words max-h-60 overflow-y-auto text-foreground/80"
        >
          {logs}
        </pre>
      )}
    </div>
  )
}

// ─── Home Page ───────────────────────────────────────────────────────────────

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
        return <ExploreFilesPanel activeProject={activeProject} />
      case "files-category":
        return <FilesCategoryPanel activeProject={activeProject} />
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
      <div className="flex h-screen overflow-hidden">
        <div className="w-[200px] border-r bg-muted/50 pt-8 shrink-0">
          <SimpleSidebar 
            onNavigate={setCurrentPage} 
            currentPage={currentPage} 
            activeProject={activeProject} 
            onShowProjectList={() => setIsProjectListOpen(true)}
            onDecompileClick={() => setIsDecompileManagerOpen(true)}
          />
        </div>
        <div className="flex-1 pt-20 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
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
