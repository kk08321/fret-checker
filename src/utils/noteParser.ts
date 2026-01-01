// 音符文字列をパースして音名と候補配列に変換するユーティリティ

export interface ParsedNote {
  noteName: string; // 例: "E4", "F#4", "E♭4"
  fingerings: string[]; // 例: ["1弦0F", "2弦5F", "3弦9F"]
  isUnplayable: boolean; // 押弦不可の場合true
}

/**
 * convertNoteToGuitarPositionsで生成された文字列をパースする
 * 例: "ド E4 1弦0F or 2弦5F or 3弦9F" -> { noteName: "E4", fingerings: ["1弦0F", "2弦5F", "3弦9F"], isUnplayable: false }
 * 例: "レ♭ E♭4 (押弦不可)" -> { noteName: "E♭4", fingerings: [], isUnplayable: true }
 */
export const parseNoteString = (noteString: string): ParsedNote => {
  // 押弦不可の場合
  if (noteString.includes('(押弦不可)')) {
    // 英語音名+オクターブを抽出（# はASCII、♭はUnicode）
    // 例: "レ♭ E♭4 (押弦不可)" -> "E♭4"
    const match = noteString.match(/([A-G][#♭]?\d+)/);
    const noteName = match ? match[1] : '';
    return {
      noteName,
      fingerings: [],
      isUnplayable: true,
    };
  }

  // 通常の場合
  // 英語音名+オクターブを抽出（# はASCII、♭はUnicode）
  // 例: "ド E4 1弦0F or 2弦5F or 3弦9F" -> "E4"
  const noteNameMatch = noteString.match(/([A-G][#♭]?\d+)/);
  const noteName = noteNameMatch ? noteNameMatch[1] : '';

  // 英語音名+オクターブの後の部分（候補文字列）を抽出
  // 例: "ド E4 1弦0F or 2弦5F or 3弦9F" -> "1弦0F or 2弦5F or 3弦9F"
  if (noteNameMatch && noteNameMatch.index !== undefined) {
    const afterNoteName = noteString.substring(noteNameMatch.index + noteNameMatch[1].length).trim();
    const fingerings = afterNoteName
      .split(/\s+or\s+/)
      .map(f => f.trim())
      .filter(f => f.length > 0);

    return {
      noteName,
      fingerings,
      isUnplayable: false,
    };
  }

  // パースに失敗した場合
  return {
    noteName: '',
    fingerings: [],
    isUnplayable: false,
  };
};

