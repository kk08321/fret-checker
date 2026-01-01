import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie, setCookie } from "../utils/cookie";

export type AudioPlaybackMode = "disabled" | "enabled";

interface AudioSettingsContextType {
  audioPlayback: AudioPlaybackMode;
  setAudioPlayback: (mode: AudioPlaybackMode) => void;
}

const AudioSettingsContext = createContext<AudioSettingsContextType | undefined>(undefined);

const COOKIE_NAME = "fret-checker-audio-playback";

export const AudioSettingsProvider = ({ children }: { children: ReactNode }) => {
  // Cookieから初期値を読み込む
  const [audioPlayback, setAudioPlaybackState] = useState<AudioPlaybackMode>(() => {
    const saved = getCookie(COOKIE_NAME);
    return (saved === "disabled" || saved === "enabled") ? saved : "disabled";
  });

  // 値が変更されたときにCookieに保存
  useEffect(() => {
    setCookie(COOKIE_NAME, audioPlayback);
  }, [audioPlayback]);

  const setAudioPlayback = (mode: AudioPlaybackMode) => {
    setAudioPlaybackState(mode);
  };

  return (
    <AudioSettingsContext.Provider value={{ audioPlayback, setAudioPlayback }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error("useAudioSettings must be used within an AudioSettingsProvider");
  }
  return context;
};

