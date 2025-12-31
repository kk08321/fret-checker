// MIDI関連のユーティリティ関数

// 音符番号をMIDIノート番号に変換
export const noteNumberToMidi = (noteNum: number): number => {
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
  
  // MIDIノート番号を計算
  return baseMidi + octaveOffset * 12 + scaleOffset;
};

// MIDIノート番号から音名と音階名を取得
export const midiToNoteName = (midi: number): { noteName: string; octave: number; japaneseName: string } => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const japaneseNames = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ﾌｧ', 'ﾌｧ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return {
    noteName: noteNames[noteIndex],
    octave: octave,
    japaneseName: japaneseNames[noteIndex],
  };
};

// ギターの標準チューニング（開放弦のMIDIノート番号）
export const guitarOpenStrings = [
  64, // 1弦 E4
  59, // 2弦 B3
  55, // 3弦 G3
  50, // 4弦 D3
  45, // 5弦 A2
  40, // 6弦 E2
];

// MIDIノート番号からギター押弦箇所を取得
export const getGuitarPositions = (midi: number): Array<{ string: number; fret: number }> => {
  const positions: Array<{ string: number; fret: number }> = [];
  
  for (let i = 0; i < guitarOpenStrings.length; i++) {
    const openStringMidi = guitarOpenStrings[i];
    const fret = midi - openStringMidi;
    
    // フレットが0以上19以下（クラシックギターのフレット範囲）の場合に追加
    if (fret >= 0 && fret <= 19) {
      positions.push({ string: i + 1, fret: fret });
    }
  }
  
  return positions;
};

// 音符番号をギター押弦箇所の文字列に変換
export const convertNoteToGuitarPositions = (noteNumStr: string): string => {
  // シャープ記号とフラット記号が付いているかチェック
  const isSharp = noteNumStr.endsWith('#');
  const isFlat = noteNumStr.endsWith('b');
  const noteNumWithoutAccidental = isSharp || isFlat ? noteNumStr.slice(0, -1) : noteNumStr;
  const noteNum = parseInt(noteNumWithoutAccidental, 10);
  if (isNaN(noteNum)) {
    return noteNumStr;
  }

  const baseMidi = noteNumberToMidi(noteNum);
  // 押弦位置の計算にはシャープ/フラット後のMIDIノート番号を使用
  const midi = isSharp ? baseMidi + 1 : (isFlat ? baseMidi - 1 : baseMidi);
  
  // 表示名を取得
  let displayJapaneseName: string;
  let displayNoteName: string;
  let octave: number;
  
  if (isSharp) {
    // シャープの場合
    const { japaneseName, noteName, octave: oct } = midiToNoteName(baseMidi);
    displayJapaneseName = `${japaneseName}♯`;
    displayNoteName = `${noteName}#`;
    octave = oct;
  } else if (isFlat) {
    // フラットの場合：元のMIDIノート番号から音名を取得してフラット記号を付ける
    const { japaneseName, noteName, octave: oct } = midiToNoteName(baseMidi);
    // フラット後のMIDIノート番号から音名を取得（変換用）
    const flatNoteInfo = midiToNoteName(midi);
    
    // フラット後の音名がシャープ記号を含む場合（例：D# → E♭）は変換する
    if (flatNoteInfo.noteName.includes('#')) {
      // シャープ表記をフラット表記に変換
      const flatNoteNames: { [key: string]: string } = {
        'C#': 'D♭', 'D#': 'E♭', 'F#': 'G♭', 'G#': 'A♭', 'A#': 'B♭'
      };
      const flatJapaneseNames: { [key: string]: string } = {
        'ド#': 'レ♭', 'レ#': 'ミ♭', 'ﾌｧ#': 'ソ♭', 'ソ#': 'ラ♭', 'ラ#': 'シ♭'
      };
      displayNoteName = flatNoteNames[flatNoteInfo.noteName] || noteName;
      displayJapaneseName = flatJapaneseNames[flatNoteInfo.japaneseName] || japaneseName;
    } else {
      // 元の音名にフラット記号を付ける（例：F → F♭、E → E♭）
      displayNoteName = `${noteName}♭`;
      displayJapaneseName = `${japaneseName}♭`;
    }
    octave = oct;
  } else {
    // 通常の場合
    const { japaneseName, noteName, octave: oct } = midiToNoteName(baseMidi);
    displayJapaneseName = japaneseName;
    displayNoteName = noteName;
    octave = oct;
  }
  
  const positions = getGuitarPositions(midi);

  if (positions.length === 0) {
    return `${displayJapaneseName} ${displayNoteName}${octave} (押弦不可)`;
  }

  const positionStrings = positions.map(pos => `${pos.string}弦${pos.fret}F`);
  return `${displayJapaneseName} ${displayNoteName}${octave} ${positionStrings.join(' or ')}`;
};

