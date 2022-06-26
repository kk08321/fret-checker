/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react"
import { useState } from 'react';

import Bar from "./Bar";

function SheetPage() {

  const [touchCoordinates, setTouchCoordinates] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const setCoordinatesByTouchEvent = e => {
    setTouchCoordinates({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  return (
    <div
      css={css`width: 100%; height: 100%;`}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={() => setTouchCoordinates({ x: 0, y: -100 })}
    >
      <div css={sheetWrapper}>
        <Bar note="23" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="22" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="21" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="20" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="19" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="18" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="17" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="16" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="15" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackLongBarCss} />
        <Bar note="14" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="13" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackLongBarCss} />
        <Bar note="12" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="11" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackLongBarCss} />
        <Bar note="10" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="9" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackLongBarCss} />
        <Bar note="8" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="7" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackLongBarCss} />
        <Bar note="6" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="5" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="4" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="3" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="2" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
        <Bar note="1" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={blackBarWrapperCss} barCss={blackShortBarCss} />
        <Bar note="0" onSelected={setSelectedNote} coordinates={touchCoordinates} wrapperCss={whiteBarWrapperCss} barCss={whiteBarCss} />
      </div>

      <div css={controlWrapper}>
        {selectedNote}
      </div>

    </div>
  );
}

const sheetWrapper = css`
  height: 68%;
  padding: 2% 0;
  touch-action: none;
`

const controlWrapper = css`
  position: relative;
  z-index: 101;
  height: 30%;
  background-color: aqua;
`

const barWrapperCss = css`
  background-color: transparent;
  width: 100%;
  height: 4.16666%;
  position: relative;
`

const blackBarWrapperCss = css`
  ${barWrapperCss};
  z-index: 100;
`

const whiteBarWrapperCss = css`
  ${barWrapperCss};
  z-index: auto;
`

const barCss = css`
  width: 100%;
  height: 20%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
`

const blackLongBarCss = css`
  ${barCss};
  background-color: black;
`

const blackShortBarCss = css`
  ${barCss};
  background-color: black;
  width: 25%;
  left: 70%;
`

const whiteBarCss = css`
  ${barCss};
  height: 180%;
  background-color: transparent;
`

export default SheetPage;
