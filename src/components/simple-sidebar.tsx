import { SearchForm } from "@/components/search-form"
import { GalleryVerticalEnd, ChevronDown } from "lucide-react"
import { useState } from "react"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Navigation",
      url: "#",
      items: [
        {
          title: "Files Category",
          url: "/files-category",
        },
        {
          title: "Permissions",
          url: "/permissions",
        },
      ],
    },
  ],
}

export function SimpleSidebar({ onNavigate, currentPage, activeProject, onShowProjectList }: { 
  onNavigate?: (page: { type: string; title: string }) => void; 
  currentPage?: { type: string; title: string };
  activeProject?: any;
  onShowProjectList?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNavMain = data.navMain.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full w-full flex-col bg-card px-[6px]">
      <div 
        className="flex h-auto py-2.5 shrink-0 items-center justify-between px-2 mx-1 mt-2 mb-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onShowProjectList}
        title="Switch Project"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none px-1 overflow-hidden flex-1">
            {activeProject ? (
              <>
                <span className="font-medium truncate" title={activeProject.project_name}>
                  {activeProject.project_name || "Unnamed"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {new Date(activeProject.projection_creation_time).toLocaleDateString()}
                </span>
              </>
            ) : (
              <span className="font-medium"></span>
            )}
          </div>
        </div>
        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
      </div>
      <SearchForm value={searchQuery} onQueryChange={setSearchQuery} />
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1">
          {filteredNavMain.map((section) => (
            <div key={section.title} className="space-y-1">
              {section.items.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      if (onNavigate) {
                        if (item.url === '/files-category') {
                          onNavigate({ type: 'files-category', title: '' })
                        } else if (item.url === '/permissions') {
                          onNavigate({ type: 'permissions', title: '' })
                        } else {
                          onNavigate({ type: 'default', title: item.title })
                        }
                      }
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors ${
                      currentPage && (
                        (item.url === '/files-category' && currentPage.type === 'files-category') ||
                        (item.url === '/permissions' && currentPage.type === 'permissions') ||
                        (item.url !== '/files-category' && item.url !== '/permissions' && currentPage.type === 'default' && currentPage.title === item.title)
                      ) ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
