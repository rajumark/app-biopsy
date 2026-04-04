import { X } from "lucide-react"

interface DecompileManagerDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DecompileManagerDialog({ isOpen, onClose }: DecompileManagerDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-md font-semibold text-muted-foreground">Decompile Manager</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          Coming Soon
        </div>
      </div>
    </div>
  )
}
