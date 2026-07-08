import { useEffect, useState } from "react";
import { loadData, saveData, AppData } from "./local-data";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  const refresh = () => {
    const fresh = loadData();
    setData(fresh);
  };

  const updateData = (newData: AppData) => {
    saveData(newData);
    setData(newData);
  };

  // Re-read on mount / when storage or custom sync event fires
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("mudir-data-updated" as any, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("mudir-data-updated" as any, handler);
    };
  }, []);

  return { data, refresh, updateData };
}
