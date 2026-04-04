import * as React from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<{ name: string; path: string } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile({
        name: file.name,
        // In Electron, the real path is available on the file object
        path: (file as any).path || file.name
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.toLowerCase().endsWith('.apk')) {
      setSelectedFile({
        name: file.name,
        path: (file as any).path || file.name
      })
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
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
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".apk"
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10 px-4 py-8 text-center cursor-pointer transition-colors hover:bg-muted/20"
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

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetSelection}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  console.log("Continuing with", selectedFile)
                  onClose()
                }}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
