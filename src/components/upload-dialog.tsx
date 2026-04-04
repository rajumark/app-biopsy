import * as React from "react"
import { X, Upload } from "lucide-react"

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
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Select apk file</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-8">
          <div 
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-12 text-center transition-colors hover:bg-muted/30"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-6 text-primary" />
            </div>
            <div className="mb-2 text-sm font-medium">
              Drag and drop apk here
            </div>
            <p className="mb-6 text-xs text-muted-foreground">
              or click to browse from your computer
            </p>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Upload file from computer
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t bg-muted/20 px-6 py-4">
          <button 
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
