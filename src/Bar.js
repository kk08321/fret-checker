/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useEffect } from 'react';

const getHighlighted = (targetRef, coordinates) => {

  const clientRect = targetRef.current?.getBoundingClientRect();

  if (coordinates != null &&
    clientRect.y < coordinates.y &&
    clientRect.y + clientRect.height > coordinates.y) {

    return true;

  } else {

    return false;

  }
}

function Bar(props) {

  const targetRef = useRef(null);

  let highlighted = getHighlighted(targetRef, props.coordinates);

  useEffect(
    () => {
      if (highlighted) props.onSelected(props.note);
    }
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