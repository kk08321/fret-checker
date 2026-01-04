/**
 * 共通型定義
 */

/**
 * 音価の型定義
 */
export type NoteValue = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

/**
 * チューニングタイプ
 */
export type TuningType = "normal" | "dropD";

/**
 * 座標情報
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * ページ情報の型定義
 */
export interface MeasureData {
  notes: string[]; // 音符の配列
  noteValue: NoteValue; // ページの音価（デフォルトは'quarter'）
  isDotted?: boolean; // 付点音符フラグ（音価×1.5）
  isTriplet?: boolean; // 三連符フラグ
}

/**
 * ギター押弦位置
 */
export interface GuitarPosition {
  string: number;
  fret: number;
}

/**
 * 音符番号から解析された情報
 */
export interface ParsedNote {
  noteName: string; // 例: "E4"
  positions: string[]; // 例: ["1弦0F", "2弦5F", "3弦9F"]
}

