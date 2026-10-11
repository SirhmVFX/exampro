"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EmptyState } from "./empty";
import { inputClass } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Value used for sorting this column. Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  /** Extra classes for the cell + header (e.g. alignment). */
  className?: string;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  /** First option should be the "all" catch-all (value ""). */
  options: { value: string; label: string }[];
  getValue: (row: T) => string;
}

export function DataTable<T>({
  rows,
  columns,
  filters = [],
  searchable = true,
  searchKeys,
  searchPlaceholder = "Search…",
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  getRowId,
}: {
  rows: T[];
  columns: Column<T>[];
  filters?: FilterDef<T>[];
  searchable?: boolean;
  /** Return the haystack string a row is matched against for the search box. */
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  getRowId?: (row: T, index: number) => string | number;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && searchKeys) {
        if (!searchKeys(row).toLowerCase().includes(needle)) return false;
      }
      for (const f of filters) {
        const want = active[f.key];
        if (want && f.getValue(row) !== want) return false;
      }
      return true;
    });
  }, [rows, q, active, filters, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-3">
      {(searchable || filters.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetPage();
                }}
                placeholder={searchPlaceholder}
                className={`${inputClass} pl-9`}
              />
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              value={active[f.key] ?? ""}
              onChange={(e) => {
                setActive((prev) => ({ ...prev, [f.key]: e.target.value }));
                resetPage();
              }}
              className={`${inputClass} w-auto`}
              aria-label={f.label}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {paged.length === 0 ? (
        <EmptyState
          icon={emptyIcon ?? <Search className="w-6 h-6" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--dash-surface-alt)] text-left text-xs font-semibold text-[var(--dash-text-muted)] uppercase">
              <tr>
                {columns.map((c) => {
                  const isSorted = sortKey === c.key;
                  return (
                    <th key={c.key} className={`px-6 py-3 ${c.className ?? ""}`}>
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1 uppercase hover:text-[var(--dash-text)] transition-colors"
                        >
                          {c.header}
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-border)]">
              {paged.map((row, i) => (
                <tr key={getRowId ? getRowId(row, i) : i}>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-6 py-3 ${c.className ?? ""}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[var(--dash-text-muted)]">
            <span>
              Showing {start + 1}–{Math.min(start + pageSize, sorted.length)} of{" "}
              {sorted.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                resetPage();
              }}
              className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-xs"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-md border border-[var(--dash-border)] text-[var(--dash-text-muted)] disabled:opacity-40 hover:bg-[var(--dash-surface-alt)] transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[var(--dash-text-muted)] px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-md border border-[var(--dash-border)] text-[var(--dash-text-muted)] disabled:opacity-40 hover:bg-[var(--dash-surface-alt)] transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
