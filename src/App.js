/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react"
import { useState } from 'react';

import Bar from "./Bar";

function App() {

  const [touchCoordinates, setTouchCoordinates] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const setCoordinatesByTouchEvent = e => {
    setTouchCoordinates({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  return (
    <div
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
  height: 70vh;
  touch-action: none;
`

const controlWrapper = css`
  height: 30vh;
  background-color: aqua;
`

const blackBarWrapperCss = css`
  background-color: transparent;
  width: 100%;
  height: 4.16666%;
  position: relative;
  z-index: 100;
`

const blackShortBarCss = css`
  background-color: black;
  width: 25%;
  height: 20%;
  position: relative;
  top: 50%;
  left: 60%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
`

const blackLongBarCss = css`
  background-color: black;
  width: 100%;
  height: 20%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
`

const whiteBarWrapperCss = css`
  background-color: bisque;
  width: 100%;
  height: 4.16666%;
  z-index: auto;
`

const whiteBarCss = css`
  background-color: white;
  width: 100%;
  height: 180%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
`

export default App;
