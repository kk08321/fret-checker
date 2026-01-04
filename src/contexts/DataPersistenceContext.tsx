import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, setCookie } from "../utils/cookie";

export type DataPersistenceMode = "enabled" | "disabled";

interface DataPersistenceContextType {
  dataPersistence: DataPersistenceMode;
  setDataPersistence: (mode: DataPersistenceMode) => void;
}

const DataPersistenceContext = createContext<DataPersistenceContextType | undefined>(undefined);

const COOKIE_NAME = "fret-checker-data-persistence";

export const DataPersistenceProvider = ({ children }: { children: ReactNode }) => {
  // Cookieから初期値を読み込む（デフォルトは有効）
  const [dataPersistence, setDataPersistenceState] = useState<DataPersistenceMode>(() => {
    const saved = getCookie(COOKIE_NAME);
    return (saved === "disabled" || saved === "enabled") ? saved : "enabled";
  });

  // 値が変更されたときにCookieに保存
  useEffect(() => {
    setCookie(COOKIE_NAME, dataPersistence);
  }, [dataPersistence]);

  const setDataPersistence = (mode: DataPersistenceMode) => {
    setDataPersistenceState(mode);
  };

  return (
    <DataPersistenceContext.Provider value={{ dataPersistence, setDataPersistence }}>
      {children}
    </DataPersistenceContext.Provider>
  );
};

export const useDataPersistence = () => {
  const context = useContext(DataPersistenceContext);
  if (context === undefined) {
    throw new Error("useDataPersistence must be used within a DataPersistenceProvider");
  }
  return context;
};

