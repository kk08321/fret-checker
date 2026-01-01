import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { KeySignatureType } from "../utils/keySignature";
import { getCookie, setCookie, deleteCookie } from "../utils/cookie";

interface KeySignatureContextType {
  selectedKeySignature: KeySignatureType | null;
  setSelectedKeySignature: (key: KeySignatureType | null) => void;
}

const KeySignatureContext = createContext<KeySignatureContextType | undefined>(undefined);

const COOKIE_NAME = "fret-checker-key-signature";

export const KeySignatureProvider = ({ children }: { children: ReactNode }) => {
  // Cookieから初期値を読み込む
  const [selectedKeySignature, setSelectedKeySignatureState] = useState<KeySignatureType | null>(() => {
    const saved = getCookie(COOKIE_NAME);
    return (saved as KeySignatureType) || null;
  });

  // 値が変更されたときにCookieに保存
  useEffect(() => {
    if (selectedKeySignature) {
      setCookie(COOKIE_NAME, selectedKeySignature);
    } else {
      // nullの場合はCookieを削除
      deleteCookie(COOKIE_NAME);
    }
  }, [selectedKeySignature]);

  const setSelectedKeySignature = (key: KeySignatureType | null) => {
    setSelectedKeySignatureState(key);
  };

  return (
    <KeySignatureContext.Provider value={{ selectedKeySignature, setSelectedKeySignature }}>
      {children}
    </KeySignatureContext.Provider>
  );
};

export const useKeySignature = () => {
  const context = useContext(KeySignatureContext);
  if (context === undefined) {
    throw new Error("useKeySignature must be used within a KeySignatureProvider");
  }
  return context;
};

