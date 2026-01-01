import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, setCookie } from "../utils/cookie";

export type TuningType = "normal" | "dropD";

interface TuningContextType {
  tuning: TuningType;
  setTuning: (tuning: TuningType) => void;
}

const TuningContext = createContext<TuningContextType | undefined>(undefined);

const COOKIE_NAME = "fret-checker-tuning";

export const TuningProvider = ({ children }: { children: ReactNode }) => {
  // Cookieから初期値を読み込む
  const [tuning, setTuningState] = useState<TuningType>(() => {
    const saved = getCookie(COOKIE_NAME);
    return (saved === "normal" || saved === "dropD") ? saved : "normal";
  });

  // 値が変更されたときにCookieに保存
  useEffect(() => {
    setCookie(COOKIE_NAME, tuning);
  }, [tuning]);

  const setTuning = (newTuning: TuningType) => {
    setTuningState(newTuning);
  };

  return (
    <TuningContext.Provider value={{ tuning, setTuning }}>
      {children}
    </TuningContext.Provider>
  );
};

export const useTuning = () => {
  const context = useContext(TuningContext);
  if (context === undefined) {
    throw new Error("useTuning must be used within a TuningProvider");
  }
  return context;
};

