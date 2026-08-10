"use client";

import { useEffect, useRef, useState } from "react";

export type PublicContentMode = "code" | "background-api";

export const PUBLIC_CONTENT_MODE: PublicContentMode = "background-api";

const responseCache = new Map<string, unknown>();
const pendingRequests = new Map<string, Promise<unknown>>();

async function getCachedContent<T>(url: string): Promise<T> {
  if (responseCache.has(url)) {
    return responseCache.get(url) as T;
  }

  const existing = pendingRequests.get(url);

  if (existing) {
    return existing as Promise<T>;
  }

  const request = fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
      }

      const data = (await response.json()) as T;

      responseCache.set(url, data);

      return data;
    })
    .finally(() => {
      pendingRequests.delete(url);
    });

  pendingRequests.set(url, request);

  return request;
}

export function usePublicContent<T>(
  url: string,
  initialData: T,
  mergeFn?: (staticData: T, apiData: T) => T,
) {
  const [data, setData] = useState<T>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const requestedRef = useRef(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    if (PUBLIC_CONTENT_MODE === "code") {
      return;
    }

    if (requestedRef.current) {
      return;
    }

    requestedRef.current = true;
    setRefreshing(true);

    getCachedContent<T>(url)
      .then((apiData) => {
        if (mergeFn) {
          setData(mergeFn(initialDataRef.current, apiData));
        } else if (apiData) {
          setData(apiData);
        }
      })
      .catch((error) => {
        console.error(`Failed to load ${url}:`, error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    refreshing,
  };
}