"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface SearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceTime?: number;
  defaultValue?: string;
}

export function Search({
  placeholder = "Search...",
  onSearch,
  className,
  debounceTime = 300,
  defaultValue = "",
}: SearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTime);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, debounceTime, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <SearchIcon
          className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors",
            isFocused && "text-foreground"
          )}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-10 pr-8 text-foreground"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}