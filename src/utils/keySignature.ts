// 調号の定義

// note番号から音名を取得（E, F, G, A, B, C, D）
// note番号は、SheetPageの24本の線に対応（23が上、0が下）
// scaleOffsets = [0, 1, 3, 5, 7, 8, 10] は [E, F, G, A, B, C, D] に対応
export const getNoteNameFromNoteNumber = (noteNum: number): string => {
  const noteNames = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  const scaleIndex = noteNum % 7;
  return noteNames[scaleIndex];
};

// 音名からnote番号の配列を取得（0-23の範囲で）
export const getNoteNumbersByNoteName = (noteName: string): number[] => {
  const noteNames = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  const scaleIndex = noteNames.indexOf(noteName);
  if (scaleIndex === -1) return [];
  
  const noteNumbers: number[] = [];
  for (let i = 0; i < 24; i++) {
    if (i % 7 === scaleIndex) {
      noteNumbers.push(i);
    }
  }
  return noteNumbers;
};

export type KeySignatureType = 
  | 'G major' 
  | 'D major' 
  | 'A major' 
  | 'E major' 
  | 'B major' 
  | 'F# major'
  | 'D minor'
  | 'G minor'
  | 'C minor'
  | 'F minor'
  | 'Bb minor'
  | 'Eb minor';

export interface KeySignature {
  type: KeySignatureType;
  displayName: string;
  sharps: number[]; // シャープが付くnote番号（0-23）の配列（表示順序通り、音名ベースで判定）
  flats: number[]; // フラットが付くnote番号（0-23）の配列（表示順序通り、音名ベースで判定）
}

// 調号のシャープ/フラットが適用される音名のセットを取得
export const getKeySignatureNoteNames = (keySignature: KeySignature): { sharpNames: Set<string>; flatNames: Set<string> } => {
  const sharpNames = new Set<string>();
  const flatNames = new Set<string>();
  
  keySignature.sharps.forEach(noteNum => {
    const noteName = getNoteNameFromNoteNumber(noteNum);
    sharpNames.add(noteName);
  });
  
  keySignature.flats.forEach(noteNum => {
    const noteName = getNoteNameFromNoteNumber(noteNum);
    flatNames.add(noteName);
  });
  
  return { sharpNames, flatNames };
};

// 調号の定義
// シャープ/フラットが付くnote番号（0-23）を直接指定
// 表示順序は配列の順番に従う
// note番号は、SheetPageの24本の線に対応（23が上、0が下）
export const KEY_SIGNATURES: Record<KeySignatureType, KeySignature> = {
  'G major': {
    type: 'G major',
    displayName: 'G major(#*1)',
    sharps: [15], // F#（調整が必要な場合は変更してください）
    flats: [],
  },
  'D major': {
    type: 'D major',
    displayName: 'D major(#*2)',
    sharps: [15, 12], // F#, C#
    flats: [],
  },
  'A major': {
    type: 'A major',
    displayName: 'A major(#*3)',
    sharps: [15, 12, 16], // F#, C#, G#
    flats: [],
  },
  'E major': {
    type: 'E major',
    displayName: 'E major(#*4)',
    sharps: [15, 12, 16, 13], // F#, C#, G#, D#
    flats: [],
  },
  'B major': {
    type: 'B major',
    displayName: 'B major(#*5)',
    sharps: [15, 12, 16, 13, 11], // F#, C#, G#, D#, A#
    flats: [],
  },
  'F# major': {
    type: 'F# major',
    displayName: 'F♯ major(#*6)',
    sharps: [15, 12, 16, 13, 11, 14], // F#, C#, G#, D#, A#, E#
    flats: [],
  },
  'D minor': {
    type: 'D minor',
    displayName: 'D minor(♭*1)',
    sharps: [],
    flats: [11], // Bb
  },
  'G minor': {
    type: 'G minor',
    displayName: 'G minor(♭*2)',
    sharps: [],
    flats: [11, 14], // Bb, Eb
  },
  'C minor': {
    type: 'C minor',
    displayName: 'C minor(♭*3)',
    sharps: [],
    flats: [11, 14, 10], // Bb, Eb, Ab
  },
  'F minor': {
    type: 'F minor',
    displayName: 'F minor(♭*4)',
    sharps: [],
    flats: [11, 14, 10, 13], // Bb, Eb, Ab, Db
  },
  'Bb minor': {
    type: 'Bb minor',
    displayName: 'B♭ minor(♭*5)',
    sharps: [],
    flats: [11, 14, 10, 13, 9], // Bb, Eb, Ab, Db, Gb
  },
  'Eb minor': {
    type: 'Eb minor',
    displayName: 'E♭ minor(♭*6)',
    sharps: [],
    flats: [11, 14, 10, 13, 9, 12], // Bb, Eb, Ab, Db, Gb, Cb
  },
};

export const KEY_SIGNATURE_LIST: KeySignature[] = [
  KEY_SIGNATURES['G major'],
  KEY_SIGNATURES['D major'],
  KEY_SIGNATURES['A major'],
  KEY_SIGNATURES['E major'],
  KEY_SIGNATURES['B major'],
  KEY_SIGNATURES['F# major'],
  KEY_SIGNATURES['D minor'],
  KEY_SIGNATURES['G minor'],
  KEY_SIGNATURES['C minor'],
  KEY_SIGNATURES['F minor'],
  KEY_SIGNATURES['Bb minor'],
  KEY_SIGNATURES['Eb minor'],
];

