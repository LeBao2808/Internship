import { useState, useCallback } from "react";

interface FetchOptions {
  defaultPage?: number;
  defaultSize?: number;
  initialData?: any[];
}

 const useFetchData = (initialUrl: string, options: FetchOptions = {}) => {
  const { defaultPage = 1, defaultSize = 10, initialData = [] } = options;
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (
      query = "",
      page = defaultPage,
      size = defaultSize,
      additionalParams = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        let url = initialUrl;
        const params = [];

        if (query) params.push(`search=${encodeURIComponent(query)}`);
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (["string", "number", "boolean"].includes(typeof value)) {
              params.push(
                `${key}=${encodeURIComponent(
                  value as string 
                )}`
              );
            }
          }
        });

        if (page) params.push(`page=${page}`);
        if (size) params.push(`pageSize=${size}`);

        if (params.length > 0) url += "?" + params.join("&");

        const res = await fetch(url);

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        setTotal(result.total || 0);
      } catch (err:any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [initialUrl, defaultPage, defaultSize]
  );

  return { data, total, loading, error, fetchData, setData };
};

export default useFetchData;
