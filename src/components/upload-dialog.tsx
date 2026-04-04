import * as React from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dialog Content */}
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
          <div 
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10 px-4 py-8 text-center transition-colors hover:bg-muted/20"
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
        </div>
      </div>
    </div>
  )
}
