import { SearchForm } from "@/components/search-form"
import { GalleryVerticalEnd } from "lucide-react"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Raw source",
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
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Build Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
}

export function SimpleSidebar({ onNavigate, currentPage }: { onNavigate?: (page: { type: string; title: string }) => void; currentPage?: { type: string; title: string } }) {
  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-medium">Documentation</span>
          <span className="">v1.0.0</span>
        </div>
      </div>
      <SearchForm />
      <div className="flex-1 overflow-auto px-2 py-2">
        <nav className="space-y-1">
          {data.navMain.map((section) => (
            <div key={section.title}>
              <div className="px-2 py-2 text-sm font-semibold text-muted-foreground">
                {section.title}
              </div>
              <div className="space-y-1">
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
                    className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors ${
                      (item.isActive || (currentPage && 
                        ((item.url === '/explore-files' && currentPage.type === 'explore-files') ||
                           (item.url === '/files-category' && currentPage.type === 'files-category') ||
                           (item.url !== '/explore-files' && item.url !== '/files-category' && currentPage.type === 'default' && currentPage.title === item.title)))
                      ? 'bg-accent text-accent-foreground' : ''
                      )
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
