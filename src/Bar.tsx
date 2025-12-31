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
          <div css={getNoteEllipseStyle(props.horizontalOffset)}>
            {props.noteNumber}
          </div>
        </>
      )}
    </div>
  );
}

const selected = css`
  background-color: #FBB;
`

const getSharpStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px - 60px - 8px + ${offset}px);
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 65px;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getFlatStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px - 60px - 8px + ${offset}px);
  top: 50%;
  transform: translateY(-50%) translateY(-12px);
  width: 60px;
  height: 65px;
  z-index: 201;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getNoteEllipseStyle = (offset: number = 0) => css`
  position: absolute;
  left: calc(70% - 25px + ${offset}px);
  top: 50%;
  transform: translateY(-50%);
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
`;

export default Bar;
