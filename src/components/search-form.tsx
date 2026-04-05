"use client";

import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

export function SearchForm({ 
  value, 
  onQueryChange, 
  placeholder = "Search...",
  ...props 
}: React.ComponentProps<"form"> & { 
  value?: string; 
  onQueryChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="p-0">
        <SidebarGroupContent className="relative">
          <Label className="sr-only" htmlFor="search">
            Search
          </Label>
          <SidebarInput
            className="pl-8"
            id="search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onQueryChange?.(e.target.value)}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
