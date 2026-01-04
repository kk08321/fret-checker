/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { controlWrapper, messageWrapper } from "../styles/sheetPageStyles";
import { AccidentalIcon } from "./AccidentalIcon";
import { useAccidentalToggle } from "../hooks/useAccidentalToggle";
import { ParsedNote } from "../types";

// 運指候補文字列を解析する関数
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

  // カスタムフックを使用して臨時記号ボタンのトグル処理を簡潔に
  const sharpToggle = useAccidentalToggle({
    isActive: isSharpMode,
    onToggle: (enabled) => onSharpModeStart?.(enabled),
    recordDragStart,
  });

  const flatToggle = useAccidentalToggle({
    isActive: isFlatMode,
    onToggle: (enabled) => onFlatModeStart?.(enabled),
    recordDragStart,
  });

  const naturalToggle = useAccidentalToggle({
    isActive: isNaturalMode,
    onToggle: (enabled) => onNaturalModeStart?.(enabled),
    recordDragStart,
  });

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
            ref={sharpToggle.iconRef}
            onClick={sharpToggle.handleToggle}
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
            ref={flatToggle.iconRef}
            onClick={flatToggle.handleToggle}
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
            ref={naturalToggle.iconRef}
            onClick={naturalToggle.handleToggle}
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
          padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
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

