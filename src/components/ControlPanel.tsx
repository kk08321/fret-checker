/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useEffect } from "react";
import { controlWrapper, messageWrapper } from "../styles/sheetPageStyles";
import { AccidentalIcon } from "./AccidentalIcon";

// 運指候補文字列を解析する関数
interface ParsedNote {
  noteName: string; // 例: "E4"
  positions: string[]; // 例: ["1弦0F", "2弦5F", "3弦9F"]
}

const parseNoteString = (noteStr: string): ParsedNote | null => {
  // 形式: "ド E4 1弦0F or 2弦5F or 3弦9F" または "ド E4 (押弦不可)"
  // または "ド E♭4 1弦0F or 2弦5F or 3弦9F" など（フラット記号は♭で表示される）
  // 音名とオクターブを抽出（日本語名と押弦位置の間）
  // #（シャープ）と♭（フラット）の両方を認識
  const noteNameMatch = noteStr.match(/\s([A-G][#♭]?\d+)\s/);
  if (!noteNameMatch) return null;
  
  const noteName = noteNameMatch[1];
  
  // 押弦位置を抽出（"X弦YF"のパターンを全て抽出）
  const positionMatches = noteStr.matchAll(/(\d+)弦(\d+)F/g);
  const positions: string[] = [];
  for (const match of positionMatches) {
    positions.push(`${match[1]}弦${match[2]}F`);
  }
  
  return { noteName, positions };
};

/**
 * フレット番号からパステルカラーのヒートマップ色を計算
 * FretboardPageのgetFretColorをベースに、パステルカラー版に変換
 * 開放（0）: パステルグリーン
 * 19フレット: パステルイエロー
 */
const getPastelFretColor = (fret: number): string => {
  const NUM_FRETS = 20;
  // 0から19の範囲で0.0（緑）から1.0（黄）に正規化
  const linearRatio = fret / (NUM_FRETS - 1);
  
  // 序盤で黄色成分が早く増えるように、2.5乗関数を使用
  const ratio = Math.pow(linearRatio, 0.45);
  
  // 元の色（FretboardPageと同じ）
  const greenR = 34;
  const greenG = 197;
  const greenB = 94;
  const yellowR = 255;
  const yellowG = 220;
  const yellowB = 0;
  
  // 非線形補間
  const r = Math.round(greenR + (yellowR - greenR) * ratio);
  const g = Math.round(greenG + (yellowG - greenG) * ratio);
  const b = Math.round(greenB + (yellowB - greenB) * ratio);
  
  // パステルカラーにするため、白（255, 255, 255）と60:40の比率で混ぜる
  const whiteRatio = 0.4;
  const colorRatio = 0.6;
  const pastelR = Math.round(r * colorRatio + 255 * whiteRatio);
  const pastelG = Math.round(g * colorRatio + 255 * whiteRatio);
  const pastelB = Math.round(b * colorRatio + 255 * whiteRatio);
  
  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
};

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
  recordDragStart?: (x: number, y: number) => void;
}

// プレートコンテナ（5ボタンを包む単一のプレート）
const plateContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  padding: 5px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 4px auto;
  max-width: fit-content;
  box-sizing: border-box;
  gap: 8px;
`;

// 共通のアイコンボタンスタイル（プレート内用）
const iconButtonBase = css`
  width: 42px;
  height: 42px;
  border-radius: 21px;
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
    width: 24px;
    height: 24px;
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
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 6px;
  flex-shrink: 0;
`;

function ControlPanel({ notes, controlWrapperRef, onClearSelection, onUndo, onSharpModeStart, isSharpMode = false, onFlatModeStart, isFlatMode = false, onNaturalModeStart, isNaturalMode = false, recordDragStart }: ControlPanelProps) {
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

  // タッチ操作の開始位置を記録（各ボタンごとに独立）
  const touchStartPosRef = useRef<{ sharp: { x: number; y: number } | null; flat: { x: number; y: number } | null; natural: { x: number; y: number } | null }>({
    sharp: null,
    flat: null,
    natural: null,
  });
  // D&D操作かどうかを追跡（各ボタンごと）
  const isDragOperationRef = useRef<{ sharp: boolean; flat: boolean; natural: boolean }>({
    sharp: false,
    flat: false,
    natural: false,
  });
  // タッチイベントで処理したかどうかを追跡（onClickとの重複を防ぐため）
  const touchHandledRef = useRef<{ sharp: boolean; flat: boolean; natural: boolean }>({
    sharp: false,
    flat: false,
    natural: false,
  });
  // 現在のモード状態をrefで保持（useEffectのクロージャ問題を回避）
  const modeStateRef = useRef<{ sharp: boolean; flat: boolean; natural: boolean }>({
    sharp: isSharpMode,
    flat: isFlatMode,
    natural: isNaturalMode,
  });
  
  // モード状態が変更されたらrefを更新
  useEffect(() => {
    modeStateRef.current.sharp = isSharpMode;
  }, [isSharpMode]);
  
  useEffect(() => {
    modeStateRef.current.flat = isFlatMode;
  }, [isFlatMode]);
  
  useEffect(() => {
    modeStateRef.current.natural = isNaturalMode;
  }, [isNaturalMode]);
  
  const TOGGLE_THRESHOLD = 10; // トグルと判定する移動距離の閾値（px）

  // シャープボタンのトグルハンドラー
  const handleSharpToggle = (e: React.MouseEvent | React.TouchEvent) => {
    // タッチイベントで既に処理済みの場合は無視
    if (touchHandledRef.current.sharp) {
      touchHandledRef.current.sharp = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // 現在のモードをトグル
    onSharpModeStart?.(!isSharpMode);
  };

  // フラットボタンのトグルハンドラー
  const handleFlatToggle = (e: React.MouseEvent | React.TouchEvent) => {
    // タッチイベントで既に処理済みの場合は無視
    if (touchHandledRef.current.flat) {
      touchHandledRef.current.flat = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // 現在のモードをトグル
    onFlatModeStart?.(!isFlatMode);
  };

  // ナチュラルボタンのトグルハンドラー
  const handleNaturalToggle = (e: React.MouseEvent | React.TouchEvent) => {
    // タッチイベントで既に処理済みの場合は無視
    if (touchHandledRef.current.natural) {
      touchHandledRef.current.natural = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // 現在のモードをトグル
    onNaturalModeStart?.(!isNaturalMode);
  };

  // タッチイベントハンドラー（D&Dとトグルを区別）
  useEffect(() => {
    const sharpIconElement = sharpIconRef.current;
    if (!sharpIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      // 開始位置を記録
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      if (!touchStartPosRef.current) {
        touchStartPosRef.current = { sharp: null, flat: null, natural: null };
      }
      touchStartPosRef.current.sharp = {
        x: startX,
        y: startY,
      };
      // D&D操作の開始位置を記録
      recordDragStart?.(startX, startY);
      // D&D操作フラグをリセット
      isDragOperationRef.current.sharp = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current || !touchStartPosRef.current.sharp) return;
      
      e.preventDefault(); // スクロールを防ぐため
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(currentX - touchStartPosRef.current.sharp.x, 2) +
        Math.pow(currentY - touchStartPosRef.current.sharp.y, 2)
      );

      // 移動距離が閾値を超えた場合、D&D操作として扱う
      if (distance > TOGGLE_THRESHOLD && !isDragOperationRef.current.sharp) {
        isDragOperationRef.current.sharp = true;
        // D&D操作の開始としてモードを有効化（現在の挙動を維持）
        onSharpModeStart?.(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      
      // touchStartPosRefがnullまたはsharpがnullの場合は、touchstartが呼ばれていない可能性がある
      // その場合は直接トグル処理を行う
      if (!touchStartPosRef.current || !touchStartPosRef.current.sharp) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.sharp = true;
        onSharpModeStart?.(!modeStateRef.current.sharp);
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(endX - touchStartPosRef.current.sharp.x, 2) +
        Math.pow(endY - touchStartPosRef.current.sharp.y, 2)
      );

      // 移動距離が閾値以下の場合はトグル操作として扱う
      if (distance <= TOGGLE_THRESHOLD && !isDragOperationRef.current.sharp) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.sharp = true; // タッチイベントで処理済みをマーク
        onSharpModeStart?.(!modeStateRef.current.sharp);
      }
      // 移動距離が閾値より大きい場合はD&D操作として扱う（既にモードが有効化されているので何もしない）
      // D&D操作の場合はstopPropagation()を呼ばない（親要素のonEnterを呼ばせるため）

      // クリーンアップ
      touchStartPosRef.current.sharp = null;
      isDragOperationRef.current.sharp = false;
    };

    sharpIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    sharpIconElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    sharpIconElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      sharpIconElement.removeEventListener('touchstart', handleTouchStart);
      sharpIconElement.removeEventListener('touchmove', handleTouchMove);
      sharpIconElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSharpModeStart, recordDragStart]);

  useEffect(() => {
    const flatIconElement = flatIconRef.current;
    if (!flatIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      // 開始位置を記録
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      if (!touchStartPosRef.current) {
        touchStartPosRef.current = { sharp: null, flat: null, natural: null };
      }
      touchStartPosRef.current.flat = {
        x: startX,
        y: startY,
      };
      // D&D操作の開始位置を記録
      recordDragStart?.(startX, startY);
      // D&D操作フラグをリセット
      isDragOperationRef.current.flat = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current || !touchStartPosRef.current.flat) return;
      
      e.preventDefault(); // スクロールを防ぐため
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(currentX - touchStartPosRef.current.flat.x, 2) +
        Math.pow(currentY - touchStartPosRef.current.flat.y, 2)
      );

      // 移動距離が閾値を超えた場合、D&D操作として扱う
      if (distance > TOGGLE_THRESHOLD && !isDragOperationRef.current.flat) {
        isDragOperationRef.current.flat = true;
        // D&D操作の開始としてモードを有効化（現在の挙動を維持）
        onFlatModeStart?.(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      
      if (!touchStartPosRef.current || !touchStartPosRef.current.flat) {
        // touchStartPosRefがnullまたはflatがnullの場合は、touchstartが呼ばれていない可能性がある
        // その場合は直接トグル処理を行う
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.flat = true;
        onFlatModeStart?.(!modeStateRef.current.flat);
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(endX - touchStartPosRef.current.flat.x, 2) +
        Math.pow(endY - touchStartPosRef.current.flat.y, 2)
      );

      // 移動距離が閾値以下の場合はトグル操作として扱う
      if (distance <= TOGGLE_THRESHOLD && !isDragOperationRef.current.flat) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.flat = true; // タッチイベントで処理済みをマーク
        onFlatModeStart?.(!modeStateRef.current.flat);
      }
      // 移動距離が閾値より大きい場合はD&D操作として扱う（既にモードが有効化されているので何もしない）
      // D&D操作の場合はstopPropagation()を呼ばない（親要素のonEnterを呼ばせるため）

      touchStartPosRef.current.flat = null;
      isDragOperationRef.current.flat = false;
    };

    flatIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    flatIconElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    flatIconElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      flatIconElement.removeEventListener('touchstart', handleTouchStart);
      flatIconElement.removeEventListener('touchmove', handleTouchMove);
      flatIconElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onFlatModeStart, recordDragStart]);

  useEffect(() => {
    const naturalIconElement = naturalIconRef.current;
    if (!naturalIconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      // 開始位置を記録
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      if (!touchStartPosRef.current) {
        touchStartPosRef.current = { sharp: null, flat: null, natural: null };
      }
      touchStartPosRef.current.natural = {
        x: startX,
        y: startY,
      };
      // D&D操作の開始位置を記録
      recordDragStart?.(startX, startY);
      // D&D操作フラグをリセット
      isDragOperationRef.current.natural = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current || !touchStartPosRef.current.natural) return;
      
      e.preventDefault(); // スクロールを防ぐため
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(currentX - touchStartPosRef.current.natural.x, 2) +
        Math.pow(currentY - touchStartPosRef.current.natural.y, 2)
      );

      // 移動距離が閾値を超えた場合、D&D操作として扱う
      if (distance > TOGGLE_THRESHOLD && !isDragOperationRef.current.natural) {
        isDragOperationRef.current.natural = true;
        // D&D操作の開始としてモードを有効化（現在の挙動を維持）
        onNaturalModeStart?.(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      
      if (!touchStartPosRef.current || !touchStartPosRef.current.natural) {
        // touchStartPosRefがnullまたはnaturalがnullの場合は、touchstartが呼ばれていない可能性がある
        // その場合は直接トグル処理を行う
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.natural = true;
        onNaturalModeStart?.(!modeStateRef.current.natural);
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(endX - touchStartPosRef.current.natural.x, 2) +
        Math.pow(endY - touchStartPosRef.current.natural.y, 2)
      );

      // 移動距離が閾値以下の場合はトグル操作として扱う
      if (distance <= TOGGLE_THRESHOLD && !isDragOperationRef.current.natural) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current.natural = true; // タッチイベントで処理済みをマーク
        onNaturalModeStart?.(!modeStateRef.current.natural);
      }
      // 移動距離が閾値より大きい場合はD&D操作として扱う（既にモードが有効化されているので何もしない）
      // D&D操作の場合はstopPropagation()を呼ばない（親要素のonEnterを呼ばせるため）

      touchStartPosRef.current.natural = null;
      isDragOperationRef.current.natural = false;
    };

    naturalIconElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    naturalIconElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    naturalIconElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      naturalIconElement.removeEventListener('touchstart', handleTouchStart);
      naturalIconElement.removeEventListener('touchmove', handleTouchMove);
      naturalIconElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onNaturalModeStart, recordDragStart]);

  // ボタングループのコンテナスタイル
  const buttonsWrapper = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 2px 0;
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
            onClick={handleSharpToggle}
            css={[
              iconButtonBase,
              sharpButton,
              isSharpMode && iconButtonActive,
              css`
                touch-action: none;
                width: 42px;
                height: 42px;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
              `
            ]}
          >
            <AccidentalIcon 
              type="sharp" 
              size={24}
              filter="brightness(0)"
            />
          </div>
          <div 
            ref={flatIconRef}
            onClick={handleFlatToggle}
            css={[
              iconButtonBase,
              flatButton,
              isFlatMode && iconButtonActive,
              css`
                touch-action: none;
                width: 42px;
                height: 42px;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
              `
            ]}
          >
            <AccidentalIcon 
              type="flat" 
              size={24}
              filter="brightness(0)"
            />
          </div>
          <div 
            ref={naturalIconRef}
            onClick={handleNaturalToggle}
            css={[
              iconButtonBase,
              naturalButton,
              isNaturalMode && iconButtonActive,
              css`
                touch-action: none;
                width: 42px;
                height: 42px;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
              `
            ]}
          >
            <AccidentalIcon 
              type="natural" 
              size={24}
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
                min-width: 38px;
                min-height: 38px;
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
                min-width: 38px;
                min-height: 38px;
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
          box-sizing: border-box;
        `
      ]}>
        <div
          css={css`
            height: 12em;
            max-height: 12em;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
          `}
        >
          {notes.slice(0, 6).map((note, index) => {
          const parsed = parseNoteString(note);
          if (!parsed) return null;
          
          return (
            <div
              key={index}
              css={css`
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 1px 0;
                padding: 4px 8px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
                box-sizing: border-box;
                min-height: 1.5em;
              `}
            >
              {/* 番号バッジ */}
              <div
                css={css`
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  min-width: 20px;
                  height: 20px;
                  background: rgba(0, 0, 0, 0.08);
                  border-radius: 10px;
                  font-size: 11px;
                  font-weight: 600;
                  color: rgba(0, 0, 0, 0.7);
                  flex-shrink: 0;
                `}
              >
                {index + 1}
              </div>
              
              {/* 音名（太字） */}
              <span
                css={css`
                  font-weight: 700;
                  font-size: 14px;
                  line-height: 20px;
                  color: rgba(0, 0, 0, 0.85);
                  flex-shrink: 0;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  min-width: 36px;
                `}
              >
                {parsed.noteName}
              </span>
              
              {/* 押弦位置チップ */}
              {parsed.positions.length > 0 && (
                <div
                  css={css`
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    align-items: center;
                  `}
                >
                  {parsed.positions.map((pos, posIndex) => {
                    // 押弦位置の文字列からフレット番号を抽出（例: "1弦2F" -> 2）
                    const fretMatch = pos.match(/(\d+)F/);
                    const fret = fretMatch ? parseInt(fretMatch[1], 10) : 0;
                    const backgroundColor = getPastelFretColor(fret);
                    
                    return (
                      <span
                        key={posIndex}
                        css={css`
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          height: 20px;
                          padding: 0 6px;
                          background: ${backgroundColor};
                          border-radius: 4px;
                          font-size: 11px;
                          color: rgba(0, 0, 0, 0.7);
                          white-space: nowrap;
                          font-variant-numeric: tabular-nums;
                          letter-spacing: 0.02em;
                          box-sizing: border-box;
                        `}
                      >
                        {pos}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* 押弦不可の場合 */}
              {parsed.positions.length === 0 && (
                <span
                  css={css`
                    font-size: 11px;
                    line-height: 20px;
                    color: rgba(0, 0, 0, 0.5);
                    font-style: italic;
                    display: inline-flex;
                    align-items: center;
                  `}
                >
                  (押弦不可)
                </span>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;

