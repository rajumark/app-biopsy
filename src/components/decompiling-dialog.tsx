import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { ipc } from "@/ipc/manager"

interface DecompilingDialogProps {
  isOpen: boolean
  projectId: string | null
  onClose: () => void
  onComplete?: () => void
}

export function DecompilingDialog({ isOpen, projectId, onClose, onComplete }: DecompilingDialogProps) {
  const [status, setStatus] = useState<'idle' | 'decompiling' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen && projectId) {
      startDecompilation()
    } else if (!isOpen) {
      // Reset state when dialog closes
      setStatus('idle')
      setProgress(0)
      setLogs([])
      setError(null)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isOpen, projectId])

  const simulateProgress = () => {
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5 // Random progress between 5-20%
      if (currentProgress >= 95) {
        currentProgress = 95 // Cap at 95% until actual completion
        clearInterval(interval)
        progressIntervalRef.current = null
      }
      setProgress(Math.min(currentProgress, 95))
    }, 800) // Update every 800ms
    
    progressIntervalRef.current = interval
  }

  const startDecompilation = async () => {
    if (!projectId) return

    setStatus('decompiling')
    setProgress(0)
    setLogs([])
    setError(null)
    
    // Start simulated progress
    simulateProgress()

    try {
      // Start decompilation
      const result = await ipc.client.tools.decompileApk({ projectId })
      
      // Clear progress simulation
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      
      if (result.success) {
        setStatus('completed')
        setProgress(100)
        if (result.logs) {
          setLogs(result.logs.split('\n').filter(line => line.trim()))
        }
        onComplete?.()
      } else {
        setStatus('error')
        setError(result.error || 'Unknown error occurred')
        if (result.logs) {
          setLogs(result.logs.split('\n').filter(line => line.trim()))
        }
      }
    } catch (e) {
      // Clear progress simulation
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      
      setStatus('error')
      setError('Failed to start decompilation')
      console.error(e)
    }
  }

  const handleClose = () => {
    if (status === 'decompiling') {
      // Don't allow closing while decompiling
      return
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-md font-semibold text-muted-foreground">Decompiling APK</h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors disabled:opacity-50"
            disabled={status === 'decompiling'}
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Status Section */}
          <div className="flex items-center gap-3 mb-4">
            {status === 'decompiling' && (
              <Loader2 className="size-5 text-blue-500 animate-spin" />
            )}
            {status === 'completed' && (
              <CheckCircle className="size-5 text-green-500" />
            )}
            {status === 'error' && (
              <AlertCircle className="size-5 text-red-500" />
            )}
            
            <div className="flex-1">
              <p className="text-sm font-medium">
                {status === 'decompiling' && 'Decompiling APK...'}
                {status === 'completed' && 'Decompilation completed successfully!'}
                {status === 'error' && 'Decompilation failed'}
              </p>
              {status === 'decompiling' && (
                <p className="text-xs text-muted-foreground">Please wait while we decompile your APK file</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* APK Info */}
          <div className="bg-muted/40 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground/80">local_app.apk</span>
              <span className="text-xs text-muted-foreground">Will be decompiled</span>
            </div>
          </div>

          {/* Logs Section */}
          {(logs.length > 0 || error) && (
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">
                {status === 'error' ? 'Error Details' : 'Decompilation Logs'}
              </h4>
              <div className="text-xs font-mono space-y-1">
                {error && (
                  <div className="text-red-500 bg-red-500/10 p-2 rounded">
                    {error}
                  </div>
                )}
                {logs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {status === 'completed' && (
              <>
                <Button 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Explore Files
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <>
                <Button 
                  onClick={startDecompilation}
                  className="flex-1"
                  variant="outline"
                >
                  Retry
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
