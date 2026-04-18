import { useCallback, useEffect, useState } from "react";

export type UseApiOptions = {
  /** When true, no request is made (e.g. missing route param). */
  skip?: boolean;
};

export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const skip = options.skip ?? false;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(() => !skip && url !== null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (skip || url === null) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errText = await response.text().catch(() => response.statusText);
          let message = `Request failed (${response.status})`;
          try {
            const j = JSON.parse(errText) as { error?: string };
            if (j?.error) message = j.error;
          } catch {
            if (errText) message = errText;
          }
          throw new Error(message);
        }
        const json = (await response.json()) as T;
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "An error occurred";
          setError(message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, skip, version]);

  return { data, loading, error, refetch };
}
