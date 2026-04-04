import * as React from "react"
import { X, Search, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ipc } from "@/ipc/manager"

export interface ProjectInfo {
  projection_creation_time: string;
  project_id: string;
  jadx_decompile_status: number;
  project_name: string;
  source_apk_name?: string;
  local_apk_name?: string;
  source_apk_path?: string;
  local_apk_path?: string;
}

interface ProjectListDialogProps {
  isOpen: boolean
  onClose: () => void
  isMandatory?: boolean
  onSelectProject?: (project: ProjectInfo) => void
  onCreateProjectClick?: () => void
  activeProjectId?: string | null
}

export function ProjectListDialog({ 
  isOpen, 
  onClose, 
  isMandatory, 
  onSelectProject, 
  onCreateProjectClick,
  activeProjectId 
}: ProjectListDialogProps) {
  const [projects, setProjects] = React.useState<ProjectInfo[]>([])
  const [search, setSearch] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await ipc.client.project.getProjectList()
      // Sort projects by creation time descending (newest first)
      const sortedResult = [...result].sort((a, b) => new Date(b.projection_creation_time).getTime() - new Date(a.projection_creation_time).getTime())
      setProjects(sortedResult as any)
    } catch (error) {
      console.error("Failed to fetch projects", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      fetchProjects()
      setSearch("")
    } else {
      setProjects([])
      setSearch("")
    }
  }, [isOpen, fetchProjects])

  if (!isOpen) return null

  const filteredProjects = projects.filter(p => 
    p.project_name?.toLowerCase().includes(search.toLowerCase()) || 
    (p.source_apk_name || (p as any).apk_name)?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete project '${projectName}'?`)) {
      try {
        const res = await ipc.client.project.deleteExistingProject({ projectId })
        if (res.success) {
          fetchProjects()
        } else {
          alert(`Failed to delete project: ${res.error}`)
        }
      } catch (err) {
        console.error("Error deleting project:", err)
        alert("Unexpected error occurred while deleting project")
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={() => !isMandatory && onClose()}
      />
      <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-md font-semibold text-muted-foreground">Project List</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchProjects} disabled={isLoading} title="Refresh List" className="gap-2">
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </Button>
            <Button size="sm" onClick={onCreateProjectClick}>
              Create Project
            </Button>
            {!isMandatory && (
              <button 
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-muted transition-colors"
                title="Close"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">No projects found.</div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.project_id} 
                className={`group flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors ${
                  activeProjectId === project.project_id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div 
                  className="min-w-0 pr-4 flex-1 cursor-pointer"
                  onClick={() => onSelectProject?.(project)}
                >
                  <h3 className="font-medium text-sm truncate" title={project.project_name}>
                    {project.project_name || "Unnamed Project"}
                    {activeProjectId === project.project_id && (
                      <span className="ml-2 text-[10px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase">Active</span>
                    )}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p className="truncate" title={project.source_apk_name || (project as any).apk_name}>APK: {project.source_apk_name || (project as any).apk_name}</p>
                    <p>Created: {new Date(project.projection_creation_time).toLocaleString()}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(project.project_id, project.project_name)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-100/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
