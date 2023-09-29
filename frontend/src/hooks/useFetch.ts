import { useEffect, useState } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const doFetch = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setData(data);
          setError(null);
          setIsLoading(false);
        } else {
          const data = await response.text();
          throw new Error(data);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
        setData(null);
        setIsLoading(false);
      }
    };
    doFetch();
  }, [url]);

  return { data, error, isLoading };
}
