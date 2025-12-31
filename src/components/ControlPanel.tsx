/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useEffect } from "react";
import { controlWrapper, iconContainer, icon, messageWrapper, fretLabel } from "../styles/sheetPageStyles";

interface ControlPanelProps {
  notes: string[];
  controlWrapperRef: React.RefObject<HTMLDivElement>;
  onClearSelection?: () => void;
  onUndo?: () => void;
  onSharpModeStart?: (enabled: boolean) => void;
  isSharpMode?: boolean;
  onFlatModeStart?: (enabled: boolean) => void;
  isFlatMode?: boolean;
}

const clearIconButton = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #888;
  margin: 10px auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
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

const sharpIconButton = css`
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

const sharpIconButtonActive = css`
  background-color: #4a90e2;
  box-shadow: 0 0 15px rgba(74, 144, 226, 0.6);
  transform: scale(1.1);
  border: 2px solid #2e5c8a;
`;

const flatIconButton = css`
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

const flatIconButtonActive = css`
  background-color: #4a90e2;
  box-shadow: 0 0 15px rgba(74, 144, 226, 0.6);
  transform: scale(1.1);
  border: 2px solid #2e5c8a;
`;

const undoIconButton = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #888;
  margin: 10px auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
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

function ControlPanel({ notes, controlWrapperRef, onClearSelection, onUndo, onSharpModeStart, isSharpMode = false, onFlatModeStart, isFlatMode = false }: ControlPanelProps) {
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

  return (
    <div css={controlWrapper} ref={controlWrapperRef}>
      <div css={iconContainer}>
        <div 
          ref={sharpIconRef}
          css={[
            sharpIconButton, 
            isSharpMode && sharpIconButtonActive,
            css`
              touch-action: none;
            `
          ]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 136 464"
            css={css`
              width: 28px;
              height: 28px;
            `}
            style={{
              filter: 'brightness(0) invert(1)'
            }}
          >
            <image
              href="/images/sharp.png"
              x="0"
              y="0"
              width="136"
              height="464"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
        </div>
      </div>
      <div css={iconContainer}>
        <div 
          ref={flatIconRef}
          css={[
            flatIconButton, 
            isFlatMode && flatIconButtonActive,
            css`
              touch-action: none;
            `
          ]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 136 464"
            css={css`
              width: 28px;
              height: 28px;
            `}
            style={{
              filter: 'brightness(0) invert(1)'
            }}
          >
            <image
              href="/images/flat.png"
              x="0"
              y="0"
              width="136"
              height="464"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
        </div>
      </div>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={iconContainer} onClick={handleUndoClick}>
        <div css={undoIconButton}>
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
        <div css={clearIconButton}>
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
      <div css={messageWrapper}>
        <p css={fretLabel}>{notes.length >= 1 && notes[0]}</p>
        <p css={fretLabel}>{notes.length >= 2 && notes[1]}</p>
        <p css={fretLabel}>{notes.length >= 3 && notes[2]}</p>
        <p css={fretLabel}>{notes.length >= 4 && notes[3]}</p>
        <p css={fretLabel}>{notes.length >= 5 && notes[4]}</p>
        <p css={fretLabel}>{notes.length >= 6 && notes[5]}</p>
      </div>
    </div>
  );
}

export default ControlPanel;

