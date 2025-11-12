"use client";

import { useCallback, useState, memo } from "react";
import { useSearch } from "@/app/context/SearchContext";
import { Input, Button, Typography } from "@material-tailwind/react";

function SearchBarInner() {
  const { search, searchQuery, loading } = useSearch();
  const [value, setValue] = useState<string>(searchQuery);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await search(value);
  }, [search, value]);

  const onViewAll = useCallback(async () => {
    // Fetch all results without altering the current input text
    await search("");
  }, [search]);

  const onClear = useCallback(async () => {
    setValue("");
    await search("");
  }, [search]);

  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="flex items-end gap-3">
        <div className="min-w-[280px]">
          <Input
            label="Search advocates"
            value={value}
            crossOrigin={undefined}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} color="blue" size="sm">
          {loading ? "Searching..." : "Search"}
        </Button>
        <Button
          type="button"
          color="red"
          variant="filled"
          size="sm"
          onClick={onClear}
          disabled={loading}
        >
          Clear
        </Button>
        <Button type="button" variant="outlined" size="sm" onClick={onViewAll} disabled={loading}>
          View all
        </Button>
      </div>
    </form>
  );
}

export default memo(SearchBarInner);
