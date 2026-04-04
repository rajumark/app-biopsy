import { SearchForm } from "@/components/search-form"
import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Navigation",
      url: "#",
      items: [
        {
          title: "Explore files",
          url: "/explore-files",
        },
        {
          title: "Files Category",
          url: "/files-category",
        },
      ],
    },
  ],
}

export function SimpleSidebar({ onNavigate, currentPage, activeProject }: { 
  onNavigate?: (page: { type: string; title: string }) => void; 
  currentPage?: { type: string; title: string };
  activeProject?: any;
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
      <div className="flex h-16 shrink-0 items-center gap-2 px-0">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none px-1">
          {activeProject ? (
            <>
              <span className="font-medium truncate max-w-[120px]" title={activeProject.project_name}>
                {activeProject.project_name || "Unnamed"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(activeProject.projection_creation_time).toLocaleDateString()}
              </span>
            </>
          ) : (
            <span className="font-medium"></span>
          )}
        </div>
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
                        if (item.url === '/explore-files') {
                          onNavigate({ type: 'explore-files', title: '' })
                        } else if (item.url === '/files-category') {
                          onNavigate({ type: 'files-category', title: '' })
                        } else {
                          onNavigate({ type: 'default', title: item.title })
                        }
                      }
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors ${
                      currentPage && (
                        (item.url === '/explore-files' && currentPage.type === 'explore-files') ||
                        (item.url === '/files-category' && currentPage.type === 'files-category') ||
                        (item.url !== '/explore-files' && item.url !== '/files-category' && currentPage.type === 'default' && currentPage.title === item.title)
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
