import { useState, useEffect, useCallback } from "react";
import { getApps } from "@/services/api";

export function useApps(initialParams = {}) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanParams = {};
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "All") {
          cleanParams[key] = val;
        }
      });
      const { data } = await getApps(cleanParams);
      setApps(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch apps");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const refetch = () => fetchApps();

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return { apps, loading, error, refetch, updateParams, params };
}

export default useApps;
