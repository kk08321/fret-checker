/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";

import Bar from "./Bar";

function SheetPage() {
  const [touchCoordinates, setTouchCoordinates] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const pageWrapperRef = useRef(null);
  const controlWrapperRef = useRef(null);

  const [sheetWrapperHeight, setSheetWrapperHeight] = useState(0);
  const [notes, setNotes] = useState([]);

  const setCoordinatesByTouchEvent = (e) => {
    setTouchCoordinates({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // 楽譜部分の高さを動的に設定
  useEffect(() => {
    if (pageWrapperRef.current && controlWrapperRef.current) {
      setSheetWrapperHeight(
        pageWrapperRef.current.getBoundingClientRect().height -
          controlWrapperRef.current.getBoundingClientRect().height
      );
    }
  }, [controlWrapperRef, pageWrapperRef, selectedNote]);

  const onEnter = () => {
    let notesCopy = [];
    if (notes.length < 6) {
      notesCopy = notes;
    }
    notesCopy.push(selectedNote);
    setNotes(notesCopy);
    setTouchCoordinates({ x: 0, y: -100 });
  };

  return (
    <div
      ref={pageWrapperRef}
      css={css`
        width: 100%;
        height: 100%;
      `}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={onEnter}
    >
      <div
        css={[
          sheetWrapper,
          css`
            height: ${sheetWrapperHeight}px;
          `,
        ]}
      >
        <Bar
          note="23"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="22"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="21"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="20"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="19"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="18"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="17"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="16"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="15"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackLongBarCss}
        />
        <Bar
          note="14"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="13"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackLongBarCss}
        />
        <Bar
          note="12"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="11"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackLongBarCss}
        />
        <Bar
          note="10"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="9"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackLongBarCss}
        />
        <Bar
          note="8"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="7"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackLongBarCss}
        />
        <Bar
          note="6"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="5"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="4"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="3"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="2"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
        <Bar
          note="1"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={blackBarWrapperCss}
          barCss={blackShortBarCss}
        />
        <Bar
          note="0"
          onSelected={setSelectedNote}
          coordinates={touchCoordinates}
          wrapperCss={whiteBarWrapperCss}
          barCss={whiteBarCss}
        />
      </div>

      <div css={controlWrapper} ref={controlWrapperRef}>
        <div css={iconContainer}>
          <div css={icon}></div>
        </div>
        <div css={iconContainer}>
          <div css={icon}></div>
        </div>
        <div css={iconContainer}>
          <div css={icon}></div>
        </div>
        <div css={iconContainer}>
          <div css={icon}></div>
        </div>
        <div css={iconContainer}>
          <div css={icon}></div>
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
    </div>
  );
}

const sheetWrapper = css`
  padding: 2% 0;
  touch-action: none;
`;

const iconContainer = css`
  width: 20%;
  float: left;
`;

const icon = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #bbb;
  margin: 10px auto;
`;

const messageWrapper = css`
  p {
    margin: 0;
  }
  padding-bottom: 5px;
`;

const controlWrapper = css`
  border-top: 2px solid #444;
  position: relative;
  z-index: 101;
  background-color: #eee;
`;

const barWrapperCss = css`
  background-color: transparent;
  width: 100%;
  height: 4.16666%;
  position: relative;
`;

const blackBarWrapperCss = css`
  ${barWrapperCss};
  z-index: 100;
`;

const whiteBarWrapperCss = css`
  ${barWrapperCss};
  z-index: auto;
`;

const barCss = css`
  width: 100%;
  height: 20%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
`;

const blackLongBarCss = css`
  ${barCss};
  background-color: black;
`;

const blackShortBarCss = css`
  ${barCss};
  background-color: black;
  width: 25%;
  left: 70%;
`;

const whiteBarCss = css`
  ${barCss};
  height: 180%;
  background-color: transparent;
`;

const fretLabel = css`
  height: 1.5em;
  clear: both;
  float: none;
`;

export default SheetPage;
