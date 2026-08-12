"use client";

import { useEffect, useRef, useState } from "react";

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Pure API-only data hook.
 *
 * - No static/default fallback content.
 * - No merge logic.
 * - Exposes loading / error / data so pages can render
 *   proper Loading / Error / Empty states.
 */
export function useApiData<T>(url: string): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = (await res.json()) as T;

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        console.error(`Failed to load ${url}:`, err);

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load content",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}