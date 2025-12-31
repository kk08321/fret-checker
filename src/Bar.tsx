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
    </div>
  );
}

const selected = css`
  background-color: #FF6666;
`

export default Bar;
