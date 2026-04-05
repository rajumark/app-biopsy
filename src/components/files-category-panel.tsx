import React, { useEffect, useState } from "react";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import { ipc } from "@/ipc/manager";
import { ProjectInfo } from "./project-list-dialog";
import { TreeItem } from "@/utils/project-manager";
import { Folder, FileCode, ChevronRight, ChevronDown, RefreshCw, FolderOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function FilesCategoryPanel({ activeProject }: { activeProject: ProjectInfo | null }) {
  const [treeData, setTreeData] = useState<Record<string, TreeItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeProject) {
      loadTree();
    } else {
      setTreeData(null);
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
        <p className="text-sm text-muted-foreground">Reading file structure...</p>
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

  if (!treeData) {
    return null;
  }

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="flex flex-col min-h-0 bg-muted/5">
          <div className="flex items-center justify-between p-3 border-b shrink-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Files</h3>
            <Button variant="ghost" size="icon" onClick={loadTree} title="Refresh Tree" className="size-6">
              <RefreshCw className="size-3" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 custom-scrollbar min-h-0">
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
                       context.isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground/80'
                     }`}
                     style={{ paddingLeft: `${depth * 12 + 4}px` }}
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
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80} className="flex flex-col items-center justify-center bg-background p-8 min-h-0">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <Code2 className="size-8 text-primary/40" />
             </div>
             <div className="space-y-1.5">
               <h3 className="text-xl font-semibold tracking-tight uppercase">Coming soon monaco editor</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 A high-performance code editor is being integrated for exploring decompiled source files directly within the app.
               </p>
             </div>
          </div>
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
          background: rgba(0,0,0,0.08);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
        }
      `}} />
    </div>
  );
}
