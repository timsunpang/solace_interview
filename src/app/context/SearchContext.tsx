"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Advocate = {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
};

type SearchContextValue = {
  advocates: Advocate[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setSearchQuery: (q: string) => void;
  search: (q?: string) => Promise<void>;
  goToPage: (p: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  reset: () => Promise<void>;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAdvocates = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("searchQuery", q);
      params.set("page", String(p));
      params.set("limit", String(limit));
      const url = `/api/advocates?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`Failed to fetch advocates: ${res.status}`);
      const json = await res.json();
      setAdvocates(Array.isArray(json.data) ? json.data : []);
      const meta = json.meta || {};
      setTotal(Number(meta.total ?? 0));
      setTotalPages(Number(meta.totalPages ?? 1));
      setPage(Number(meta.page ?? p));
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setAdvocates([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const search = useCallback(async (q?: string) => {
    const next = (q ?? "").trim();
    setSearchQuery(next);
    await fetchAdvocates(next, 1);
  }, [fetchAdvocates]);

  const goToPage = useCallback(async (p: number) => {
    const safe = Math.max(1, p);
    await fetchAdvocates(searchQuery, safe);
  }, [fetchAdvocates, searchQuery]);

  const nextPage = useCallback(async () => {
    if (page < totalPages) await goToPage(page + 1);
  }, [goToPage, page, totalPages]);

  const prevPage = useCallback(async () => {
    if (page > 1) await goToPage(page - 1);
  }, [goToPage, page]);

  const reset = useCallback(async () => {
    setSearchQuery("");
    await fetchAdvocates("", 1);
  }, [fetchAdvocates]);

  useEffect(() => {
    // Initial load
    fetchAdvocates("", 1);
  }, [fetchAdvocates]);

  const value = useMemo<SearchContextValue>(() => ({
    advocates,
    loading,
    error,
    searchQuery,
    page,
    limit,
    total,
    totalPages,
    setSearchQuery: (q: string) => setSearchQuery(q),
    search,
    goToPage,
    nextPage,
    prevPage,
    reset,
  }), [advocates, loading, error, searchQuery, page, limit, total, totalPages, search, goToPage, nextPage, prevPage, reset]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}
