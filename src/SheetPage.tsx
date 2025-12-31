/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";

import Bar from "./Bar";

interface Coordinates {
  x: number;
  y: number;
}

function SheetPage() {
  const [touchCoordinates, setTouchCoordinates] = useState<Coordinates | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const controlWrapperRef = useRef<HTMLDivElement>(null);

  const [sheetWrapperHeight, setSheetWrapperHeight] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);

  const setCoordinatesByTouchEvent = (e: React.TouchEvent<HTMLDivElement>) => {
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
  }, [selectedNote]);

  // 音符番号をMIDIノート番号に変換
  const noteNumberToMidi = (noteNum: number): number => {
    // 音階のオフセット（ドレミファソラシドの順）
    const scaleOffsets = [0, 1, 3, 5, 7, 8, 10]; // E, F, G, A, B, C, D
    
    // 音符番号からオクターブと音階を計算
    const octaveOffset = Math.floor(noteNum / 7);
    const scaleIndex = noteNum % 7;
    
    // E2 (MIDI 40)を基準として計算
    // E2は2オクターブ目のミなので、基準点は40
    // 音符番号0がE2に対応するため、Eのオフセット(4)を考慮
    const baseMidi = 40; // E2
    const baseScaleIndex = 0; // E (ミ)のインデックス
    
    // 現在の音階インデックスから基準音階までの差を計算
    const scaleOffset = scaleOffsets[scaleIndex] - scaleOffsets[baseScaleIndex];

    console.log(scaleIndex);
    console.log(baseScaleIndex);
    
    // MIDIノート番号を計算
    return baseMidi + octaveOffset * 12 + scaleOffset;
  };

  // MIDIノート番号から音名と音階名を取得
  const midiToNoteName = (midi: number): { noteName: string; octave: number; japaneseName: string } => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const japaneseNames = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ファ', 'ファ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return {
      noteName: noteNames[noteIndex],
      octave: octave,
      japaneseName: japaneseNames[noteIndex],
    };
  };

  // ギターの標準チューニング（開放弦のMIDIノート番号）
  const guitarOpenStrings = [
    64, // 1弦 E4
    59, // 2弦 B3
    55, // 3弦 G3
    50, // 4弦 D3
    45, // 5弦 A2
    40, // 6弦 E2
  ];

  // MIDIノート番号からギター押弦箇所を取得
  const getGuitarPositions = (midi: number): Array<{ string: number; fret: number }> => {
    const positions: Array<{ string: number; fret: number }> = [];
    
    for (let i = 0; i < guitarOpenStrings.length; i++) {
      const openStringMidi = guitarOpenStrings[i];
      const fret = midi - openStringMidi;
      
      // フレットが0以上24以下（ギターのフレット範囲）の場合に追加
      if (fret >= 0 && fret <= 24) {
        positions.push({ string: i + 1, fret: fret });
      }
    }
    
    return positions;
  };

  // 音符番号をギター押弦箇所の文字列に変換
  const convertNoteToGuitarPositions = (noteNumStr: string): string => {
    const noteNum = parseInt(noteNumStr, 10);
    if (isNaN(noteNum)) {
      return noteNumStr;
    }

    const midi = noteNumberToMidi(noteNum);
    const { japaneseName, noteName, octave } = midiToNoteName(midi);
    const positions = getGuitarPositions(midi);

    if (positions.length === 0) {
      return `${japaneseName} ${noteName}${octave} (押弦不可)`;
    }

    const positionStrings = positions.map(pos => `${pos.string}弦${pos.fret}F`);
    return `${japaneseName} ${noteName}${octave} ${positionStrings.join(' or ')}`;
  };

  const onEnter = () => {
    let notesCopy: string[] = [];
    if (notes.length < 6) {
      notesCopy = [...notes];
    }
    if (selectedNote !== null) {
      const guitarPosition = convertNoteToGuitarPositions(selectedNote);
      notesCopy.push(guitarPosition);
    }
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
