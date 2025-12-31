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
    
    // フレットが0以上24以下（ギターのフレット範囲）の場合に追加
    if (fret >= 0 && fret <= 24) {
      positions.push({ string: i + 1, fret: fret });
    }
  }
  
  return positions;
};

// 音符番号をギター押弦箇所の文字列に変換
export const convertNoteToGuitarPositions = (noteNumStr: string): string => {
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

