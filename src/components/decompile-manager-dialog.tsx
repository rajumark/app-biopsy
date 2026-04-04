import { X, CheckCircle, Clock, DownloadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ipc } from "@/ipc/manager"

interface DecompileManagerDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DecompileManagerDialog({ isOpen, onClose }: DecompileManagerDialogProps) {
  const [jadxStatus, setJadxStatus] = useState<number>(0) // 0=Pending, 1=Ready, 2=Downloading
  const [errorInfo, setErrorInfo] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const status = await ipc.client.tools.getToolsStatus()
      if (status.jadx_status !== undefined) {
        setJadxStatus(status.jadx_status)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStatus()
      setErrorInfo(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = async () => {
    setJadxStatus(2)
    setErrorInfo(null)
    try {
      const res = await ipc.client.tools.downloadJadx()
      if (res.success) {
        await fetchStatus()
      } else {
        setJadxStatus(0)
        setErrorInfo(res.error || "Failed to download.")
      }
    } catch (e) {
      setJadxStatus(0)
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-md font-semibold text-muted-foreground">Decompile Manager</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <div className="border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-3">Tool Check</h3>
            
            <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded border text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">JADX</span>
                {jadxStatus === 1 ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                    <CheckCircle className="size-3" /> Ready
                  </span>
                ) : jadxStatus === 2 ? (
                  <span className="flex items-center gap-1 text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold animate-pulse">
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                    <Clock className="size-3" /> Pending
                  </span>
                )}
              </div>
              
              {jadxStatus === 0 && (
                <Button size="sm" onClick={handleDownload} className="h-7 text-xs px-3">
                  <DownloadCloud className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
            </div>

            {errorInfo && (
              <div className="mt-3 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                Error: {errorInfo}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
