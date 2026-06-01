"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

// A simple search input that writes its value to the URL as a search query
// parameter when the form is submitted. It keeps a small piece of client state
// for input responsiveness only; the page is server rendered from the URL.
export function SearchInput({
  paramName = "q",
  placeholder = "Search",
  label = "Search",
}: {
  paramName?: string;
  placeholder?: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get(paramName) ?? "");

  // If the URL changes, reflect it in the input.
  useEffect(() => {
    setValue(params.get(paramName) ?? "");
  }, [params, paramName]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const next = new URLSearchParams(params.toString());
        if (value.trim().length > 0) {
          next.set(paramName, value.trim());
        } else {
          next.delete(paramName);
        }
        next.delete("page");
        router.push(`${pathname}?${next.toString()}`);
      }}
      className="relative w-full sm:max-w-xs"
    >
      <label className="sr-only" htmlFor={`${paramName}-input`}>
        {label}
      </label>
      <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={`${paramName}-input`}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-8 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}
