import * as React from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ipc } from "@/ipc/manager"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: (projectId: string) => void
}

export function UploadDialog({ isOpen, onClose, onProjectCreated }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<{ name: string; path: string } | null>(null)
  const [projectName, setProjectName] = React.useState("")
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)

  if (!isOpen) return null

  const openFileDialog = async () => {
    if (isCreating) return
    
    try {
      const result = await ipc.client.project.selectApkFile()
      if (result.success && result.filePath) {
        // Extract filename from path
        const pathParts = result.filePath.split(/[/\\]/)
        const fileName = pathParts[pathParts.length - 1]
        
        setSelectedFile({
          name: fileName,
          path: result.filePath
        })
      }
    } catch (error) {
      console.error("Error selecting file:", error)
      alert("Failed to open file dialog")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.toLowerCase().endsWith('.apk')) {
      const filePath = (file as any).path
      if (!filePath) {
        alert("Could not get the absolute path of this file. Please use the selection button instead.")
        return
      }
      setSelectedFile({
        name: file.name,
        path: filePath
      })
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
  }

  const handleCreateProject = async () => {
    if (!selectedFile || !projectName.trim()) return

    setIsCreating(true)
    try {
      const result = await ipc.client.project.createNewProject({
        apkPath: selectedFile.path,
        projectName: projectName.trim()
      })

      if (result.success && result.projectId) {
        alert(`Project created successfully! ID: ${result.projectId}`)
        setProjectName("")
        onProjectCreated?.(result.projectId)
        onClose()
      } else {
        alert(`Failed to create project: ${result.error}`)
      }
    } catch (error) {
      console.error("Project creation error:", error)
      alert("An unexpected error occurred during project creation")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-md font-semibold text-muted-foreground">Select apk file</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          {!selectedFile ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
                isDragOver 
                ? "border-primary bg-primary/10" 
                : "border-muted-foreground/20 bg-muted/10 hover:bg-muted/20"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="size-5 text-primary" />
              </div>
              <div className="mb-1 text-sm font-medium">
                Drag and drop apk here
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                or click to browse from your computer
              </p>
              <Button 
                size="sm"
                className="pointer-events-none select-none"
              >
                Upload file from computer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <div className="text-[10px] font-bold text-primary">APK</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{selectedFile.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{selectedFile.path}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input 
                  placeholder="Enter project name" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetSelection} disabled={isCreating}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateProject} disabled={isCreating || !projectName.trim()}>
                  {isCreating ? "Creating..." : "Create project"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
