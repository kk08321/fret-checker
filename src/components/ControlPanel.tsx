/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useEffect } from "react";
import { controlWrapper, iconContainer, messageWrapper, fretLabel } from "../styles/sheetPageStyles";
import { AccidentalIcon } from "./AccidentalIcon";

interface ControlPanelProps {
  notes: string[];
  controlWrapperRef: React.RefObject<HTMLDivElement>;
  onClearSelection?: () => void;
  onUndo?: () => void;
  onSharpModeStart?: (enabled: boolean) => void;
  isSharpMode?: boolean;
  onFlatModeStart?: (enabled: boolean) => void;
  isFlatMode?: boolean;
  onNaturalModeStart?: (enabled: boolean) => void;
  isNaturalMode?: boolean;
}

// 共通のアイコンボタンスタイル
const iconButtonBase = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #888;
  margin: 10px auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
  
  &:active {
    background-color: #666;
    transform: scale(0.95);
  }
`;

const iconButtonActive = css`
  background-color: #4a90e2;
  box-shadow: 0 0 15px rgba(74, 144, 226, 0.6);
  transform: scale(1.1);
  border: 2px solid #2e5c8a;
`;

function ControlPanel({ notes, controlWrapperRef, onClearSelection, onUndo, onSharpModeStart, isSharpMode = false, onFlatModeStart, isFlatMode = false, onNaturalModeStart, isNaturalMode = false }: ControlPanelProps) {
  // Safariかどうかを判定（Chromeを除外）
  const isSafari = (
    /safari/i.test(navigator.userAgent) && 
    !/chrome/i.test(navigator.userAgent) && 
    !/chromium/i.test(navigator.userAgent) &&
    (navigator.vendor === "Apple Computer, Inc." || navigator.vendor === "")
  ) || (window as any).safari !== undefined;

  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClearSelection?.();
  };

  const handleUndoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUndo?.();
  };

  const sharpIconRef = useRef<HTMLDivElement>(null);
  const flatIconRef = useRef<HTMLDivElement>(null);
  const naturalIconRef = useRef<HTMLDivElement>(null);

  // タッチイベントハンドラー
  useEffect(() => {
    const sharpIconElement = sharpIconRef.current;
    if (!sharpIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      onSharpModeStart?.(true);
    };

    sharpIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      sharpIconElement.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onSharpModeStart]);

  useEffect(() => {
    const flatIconElement = flatIconRef.current;
    if (!flatIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      onFlatModeStart?.(true);
    };

    flatIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      flatIconElement.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onFlatModeStart]);

  useEffect(() => {
    const naturalIconElement = naturalIconRef.current;
    if (!naturalIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      onNaturalModeStart?.(true);
    };

    naturalIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      naturalIconElement.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onNaturalModeStart]);

  return (
    <div css={controlWrapper} ref={controlWrapperRef}>
      <div css={iconContainer}>
        <div 
          ref={sharpIconRef}
          css={[
            iconButtonBase, 
            isSharpMode && iconButtonActive,
            css`
              touch-action: none;
            `
          ]}
        >
          <AccidentalIcon 
            type="sharp" 
            size={28}
            filter="brightness(0) invert(1)"
          />
        </div>
      </div>
      <div css={iconContainer}>
        <div 
          ref={flatIconRef}
          css={[
            iconButtonBase, 
            isFlatMode && iconButtonActive,
            css`
              touch-action: none;
            `
          ]}
        >
          <AccidentalIcon 
            type="flat" 
            size={28}
            filter="brightness(0) invert(1)"
          />
        </div>
      </div>
      <div css={iconContainer}>
        <div 
          ref={naturalIconRef}
          css={[
            iconButtonBase, 
            isNaturalMode && iconButtonActive,
            css`
              touch-action: none;
            `
          ]}
        >
          <AccidentalIcon 
            type="natural" 
            size={28}
            filter="brightness(0) invert(1)"
          />
        </div>
      </div>
      <div css={iconContainer} onClick={handleUndoClick}>
        <div css={iconButtonBase}>
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </div>
      </div>
      <div css={iconContainer} onClick={handleClearClick}>
        <div css={iconButtonBase}>
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div css={[
        messageWrapper,
        css`
          padding-bottom: ${isSafari 
            ? `calc(170px + env(safe-area-inset-bottom, 0px))` 
            : `60px`};
        `
      ]}>
        <p css={fretLabel}>{notes.length >= 1 && `1. ${notes[0]}`}</p>
        <p css={fretLabel}>{notes.length >= 2 && `2. ${notes[1]}`}</p>
        <p css={fretLabel}>{notes.length >= 3 && `3. ${notes[2]}`}</p>
        <p css={fretLabel}>{notes.length >= 4 && `4. ${notes[3]}`}</p>
        <p css={fretLabel}>{notes.length >= 5 && `5. ${notes[4]}`}</p>
        <p css={fretLabel}>{notes.length >= 6 && `6. ${notes[5]}`}</p>
      </div>
    </div>
  );
}

export default ControlPanel;

