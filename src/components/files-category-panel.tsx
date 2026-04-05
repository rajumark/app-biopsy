import React, { useEffect, useState } from "react";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import { ipc } from "@/ipc/manager";
import { ProjectInfo } from "./project-list-dialog";
import { TreeItem } from "@/utils/project-manager";
import { Folder, FileCode, ChevronRight, ChevronDown, RefreshCw, FolderOpen, Code2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Editor from "@monaco-editor/react";
import "@/lib/monaco"; // Initialize offline Monaco

export function FilesCategoryPanel({ activeProject }: { activeProject: ProjectInfo | null }) {
  const [treeData, setTreeData] = useState<Record<string, TreeItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editor state
  const [selectedFile, setSelectedFile] = useState<TreeItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [readingFile, setReadingFile] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  useEffect(() => {
    if (activeProject) {
      loadTree();
    } else {
      setTreeData(null);
      setSelectedFile(null);
      setFileContent("");
    }
  }, [activeProject]);

  const loadTree = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ipc.client.project.fetchFileTree({ projectId: activeProject.project_id });
      if (res.success && res.tree) {
        setTreeData(res.tree);
      } else {
        setError(res.error || "Failed to load files. Make sure the project is decompiled.");
      }
    } catch (e: any) {
      setError(e.message || "Error loading files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (item: TreeItem) => {
    if (item.isFolder) return;
    if (selectedFile?.path === item.path) return;
    
    setReadingFile(true);
    setSelectedFile(item);
    try {
      const res = await ipc.client.project.readFileContent({ path: item.path });
      if (res.success) {
        setFileContent(typeof res.content === 'string' ? res.content : "");
      } else {
        setFileContent(`// Error reading file: ${res.error}`);
      }
    } catch (e: any) {
      setFileContent(`// Error exception: ${e.message}`);
    } finally {
      setReadingFile(false);
    }
  };

  const getLanguage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "java": return "java";
      case "xml": return "xml";
      case "json": return "json";
      case "js": return "javascript";
      case "ts": return "typescript";
      case "smali": return "plaintext";
      case "txt": return "plaintext";
      case "html": return "html";
      case "css": return "css";
      default: return "plaintext";
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Folder className="size-12 opacity-20" />
        <p className="text-sm font-medium">No project selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <RefreshCw className="size-8 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground">Reading project structure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <FolderOpen className="size-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">File Tree Unavailable</p>
          <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadTree} className="mt-2">
          <RefreshCw className="size-3.5 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch">
        <ResizablePanel defaultSize={30} minSize={10} className="flex flex-col min-h-0 bg-muted/5">
          <div className="flex items-center justify-between p-3 border-b shrink-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</h3>
            <Button variant="ghost" size="icon" onClick={loadTree} title="Refresh Tree" className="size-6">
              <RefreshCw className="size-3" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 custom-scrollbar min-h-0">
            {treeData && (
              <UncontrolledTreeEnvironment
                dataProvider={new StaticTreeDataProvider(treeData, (item, data) => ({ ...item, data }))}
                getItemTitle={(item) => item.data}
                viewState={{}}
                renderItemTitle={({ title }) => <span className="truncate">{title}</span>}
                renderItemArrow={({ item, context }) => {
                  if (!item.isFolder) return <div className="w-4 mr-0.5" />;
                  return (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        context.toggleExpandedState();
                      }}
                      className="hover:bg-accent rounded p-0.5 shrink-0"
                    >
                      {context.isExpanded ? 
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : 
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </button>
                  );
                }}
                renderItem={({ item, depth, children, title, context, arrow }) => (
                  <li {...(context as any).listItemProps}>
                    <div 
                       {...(context as any).interactiveElementProps}
                       className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors group ${
                         context.isSelected || selectedFile?.path === (item as any).path ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground/80'
                       }`}
                       style={{ paddingLeft: `${depth * 12 + 4}px` }}
                       onClick={() => handleFileSelect(item as any)}
                    >
                      {arrow}
                      {item.isFolder ? 
                        <Folder className={`w-3.5 h-3.5 shrink-0 ${context.isExpanded ? 'text-blue-500 fill-blue-500/20' : 'text-blue-400'}`} /> : 
                        <FileCode className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      }
                      <span className="text-xs font-medium truncate">{title}</span>
                    </div>
                    {children}
                  </li>
                )}
              >
                <Tree treeId="tree-1" rootItem="root" treeLabel="File Tree" />
              </UncontrolledTreeEnvironment>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={10} className="flex flex-col bg-background min-h-0 relative">
          {selectedFile ? (
            <>
              <div className="h-9 border-b flex items-center px-4 bg-muted/20 shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <FileCode className="size-3.5" />
                  <span className="truncate max-w-[200px]">{selectedFile.data}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] uppercase font-bold text-primary/80">
                    {getLanguage(selectedFile.data)}
                  </span>
                </div>
                {readingFile && <Loader2 className="size-3.5 ml-2 animate-spin text-primary/40" />}
              </div>
              
              <div className="flex-1 min-h-0 relative">
                {!monacoLoaded && (
                   <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto opacity-50 select-none">
                     <div className="animate-pulse flex flex-col gap-2">
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/2 bg-muted rounded" />
                        <div className="h-4 w-5/6 bg-muted rounded" />
                        <div className="h-4 w-2/3 bg-muted rounded" />
                     </div>
                   </div>
                )}
                
                <Editor
                  height="100%"
                  language={getLanguage(selectedFile.data)}
                  value={fileContent || "// Loading..."}
                  theme="vs-dark"
                  onMount={() => setMonacoLoaded(true)}
                  loading={
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground bg-background">
                      <Loader2 className="size-6 animate-spin" />
                      <span className="text-xs">Connecting to Monaco...</span>
                    </div>
                  }
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    fontSize: 13,
                    fontFamily: "'Geist Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                    renderLineHighlight: "all",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
               <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-[inner_0_2px_12px_rgba(0,0,0,0.02)] mb-6">
                  <Code2 className="size-10 text-primary/40" />
               </div>
               <div className="space-y-2 max-w-sm">
                 <h3 className="text-2xl font-bold tracking-tight text-foreground/90 uppercase">Code Explorer</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   Select a file from the explorer to view its source code.
                 </p>
               </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .rct-tree-item-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}} />
    </div>
  );
}
