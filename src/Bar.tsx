/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";
import { useRef, useEffect } from 'react';

interface Coordinates {
  x: number;
  y: number;
}

interface BarProps {
  note: string;
  onSelected: (note: string) => void;
  coordinates: Coordinates | null;
  wrapperCss: SerializedStyles;
  barCss: SerializedStyles;
  isInputted: boolean;
  noteNumber: number | null;
  horizontalOffset?: number;
  isSharp?: boolean;
  isFlat?: boolean;
  isNatural?: boolean;
  showKeySignatureSharp?: boolean;
  showKeySignatureFlat?: boolean;
  keySignatureIndex?: number; // 調号記号の左からの順番（0始まり）
}

const getHighlighted = (targetRef: React.RefObject<HTMLDivElement>, coordinates: Coordinates | null): boolean => {
  const clientRect = targetRef.current?.getBoundingClientRect();

  if (coordinates != null &&
    clientRect &&
    clientRect.y < coordinates.y &&
    clientRect.y + clientRect.height > coordinates.y) {
    return true;
  } else {
    return false;
  }
}

function Bar(props: BarProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  const highlighted = getHighlighted(targetRef, props.coordinates);

  useEffect(
    () => {
      if (highlighted) props.onSelected(props.note);
    },
    [highlighted, props.onSelected, props.note]
  )

  return (
    <div css={props.wrapperCss} ref={targetRef}>
      <div css={[props.barCss, highlighted ? selected : null]}></div>
      {/* 調号記号の表示 */}
      {props.showKeySignatureSharp && (
        <div css={getKeySignatureSharpStyle(props.keySignatureIndex ?? 0)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 136 464"
            css={css`
              width: 100%;
              height: 100%;
            `}
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
      )}
      {props.showKeySignatureFlat && (
        <div css={getKeySignatureFlatStyle(props.keySignatureIndex ?? 0)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 136 464"
            css={css`
              width: 100%;
              height: 100%;
            `}
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
      )}
      {props.isInputted && props.noteNumber !== null && (
        <>
          {props.isSharp && (
            <div css={getSharpStyle(props.horizontalOffset)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 136 464"
                css={css`
                  width: 100%;
                  height: 100%;
                `}
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
          )}
          {props.isFlat && (
            <div css={getFlatStyle(props.horizontalOffset)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 136 464"
                css={css`
                  width: 100%;
                  height: 100%;
                `}
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
          )}
          {props.isNatural && (
            <div css={getNaturalStyle(props.horizontalOffset)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 136 464"
                css={css`
                  width: 100%;
                  height: 100%;
                `}
              >
                <image
                  href="/images/natural.png"
                  x="0"
                  y="0"
                  width="136"
                  height="464"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>
          )}
          <div css={getNoteEllipseStyle(props.horizontalOffset)}>
            {props.noteNumber}
          </div>
        </>
      )}
    </div>
  );
}

const selected = css`
  background-color: #F99;
`

const getSharpStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px - 60px - 8px + ${offset}px);
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  width: 60px;
  height: 65px;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

const getFlatStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px - 60px - 8px + ${offset}px);
  top: 50%;
  transform: translateY(calc(-50% - 12px));
  -webkit-transform: translateY(calc(-50% - 12px));
  width: 60px;
  height: 65px;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

const getNaturalStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px - 60px - 8px + ${offset}px);
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  width: 60px;
  height: 65px;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

const getNoteEllipseStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px + ${offset}px);
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  width: 50px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EEE 0%, #999 50%, #BBB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 
    0 3px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  z-index: 200;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  margin: 0;
  padding: 0;
`;

// 調号のシャープ記号のスタイル
// ト音記号の右側、固定位置に表示
const getKeySignatureSharpStyle = (index: number = 0) => css`
  position: absolute;
  left: calc(85px + ${index * 10}px);
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  width: 60px;
  height: 65px;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

// 調号のフラット記号のスタイル
// ト音記号の右側、固定位置に表示
const getKeySignatureFlatStyle = (index: number = 0) => css`
  position: absolute;
  left: calc(85px + ${index * 10}px);
  top: 50%;
  transform: translateY(calc(-50% - 12px));
  -webkit-transform: translateY(calc(-50% - 12px));
  width: 60px;
  height: 65px;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

export default Bar;
