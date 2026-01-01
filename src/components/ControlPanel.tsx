/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useEffect } from "react";
import { controlWrapper, messageWrapper, fretLabel } from "../styles/sheetPageStyles";
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

// プレートコンテナ（5ボタンを包む単一のプレート）
const plateContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  padding: 8px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 4px auto;
  max-width: fit-content;
  box-sizing: border-box;
  gap: 4px;
`;

// 共通のアイコンボタンスタイル（プレート内用）
const iconButtonBase = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  box-shadow: none;
  
  svg {
    width: 28px;
    height: 28px;
    color: rgba(0, 0, 0, 0.7);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// ボタンの基本スタイル（影なし、背景透明）
const buttonBase = css`
  background: transparent;
  border: none;
  box-shadow: none;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
`;

// 各ボタンの個別スタイル
const sharpButton = css`
  ${buttonBase};
  margin-right: 2px;
`;

const flatButton = css`
  ${buttonBase};
  margin-right: 2px;
`;

const naturalButton = css`
  ${buttonBase};
`;

const undoButton = css`
  ${buttonBase};
`;

const clearButton = css`
  ${buttonBase};
  
  svg {
    color: rgba(236, 100, 100, 0.8);
  }
  
  &:hover {
    background: rgba(236, 100, 100, 0.08);
  }
  
  &:active {
    background: rgba(236, 100, 100, 0.12);
  }
`;

// 選択状態のスタイル（トグルボタン用）
const iconButtonActive = css`
  background: rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1) !important;
  }
`;

// グループ区切り線
const groupDivider = css`
  width: 1px;
  height: 36px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 4px;
  flex-shrink: 0;
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

  // ボタングループのコンテナスタイル
  const buttonsWrapper = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 4px 0;
    box-sizing: border-box;
    flex-wrap: nowrap;
  `;

  return (
    <div css={controlWrapper} ref={controlWrapperRef}>
      <div css={buttonsWrapper}>
        {/* プレートコンテナ（5ボタンを包む単一のプレート） */}
        <div css={plateContainer}>
          {/* 左グループ: ♯, ♭, ♮ */}
          <div 
            ref={sharpIconRef}
            css={[
              iconButtonBase,
              sharpButton,
              isSharpMode && iconButtonActive,
              css`
                touch-action: none;
                min-width: 44px;
                min-height: 44px;
              `
            ]}
          >
            <AccidentalIcon 
              type="sharp" 
              size={28}
              filter="brightness(0)"
            />
          </div>
          <div 
            ref={flatIconRef}
            css={[
              iconButtonBase,
              flatButton,
              isFlatMode && iconButtonActive,
              css`
                touch-action: none;
                min-width: 44px;
                min-height: 44px;
              `
            ]}
          >
            <AccidentalIcon 
              type="flat" 
              size={28}
              filter="brightness(0)"
            />
          </div>
          <div 
            ref={naturalIconRef}
            css={[
              iconButtonBase,
              naturalButton,
              isNaturalMode && iconButtonActive,
              css`
                touch-action: none;
                min-width: 44px;
                min-height: 44px;
              `
            ]}
          >
            <AccidentalIcon 
              type="natural" 
              size={28}
              filter="brightness(0)"
            />
          </div>

          {/* グループ区切り線（♮と↩︎の間） */}
          <div css={groupDivider} />

          {/* 中グループ: ↩ (Undo) */}
          <div 
            onClick={handleUndoClick}
            css={[
              iconButtonBase, 
              undoButton,
              css`
                min-width: 44px;
                min-height: 44px;
              `
            ]}
          >
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

          {/* グループ区切り線（↩︎と✕の間） */}
          <div css={groupDivider} />

          {/* 右グループ: ✕ (Clear) */}
          <div 
            onClick={handleClearClick}
            css={[
              iconButtonBase, 
              clearButton,
              css`
                min-width: 44px;
                min-height: 44px;
              `
            ]}
          >
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

