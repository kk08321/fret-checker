/**
 * アプリケーション全体で使用する定数
 */

/**
 * フレットボード関連の定数
 */
export const NUM_FRETS = 20;
export const BASE_FRET_HEIGHT = 75;
export const FRETBOARD_STRING_COUNT = 6;

/**
 * フレットボードの色設定
 */
export const FRET_COLORS = {
  GREEN: { r: 34, g: 197, b: 94 },
  YELLOW: { r: 255, g: 220, b: 0 },
  COLOR_RATIO: 0.6,
  WHITE_RATIO: 0.4,
  POWER_EXPONENT: 0.45,
} as const;

/**
 * フレットボードのレイアウト定数
 */
export const FRETBOARD_LAYOUT = {
  HEADER_WIDTH: 30,
  HEADER_MARGIN: 5,
  BORDER_WIDTH: 3,
  STRING_CENTER_OFFSET: 14,
  STRING_SPACING: 28,
  BASE_OFFSET: 30 + 5 + 3 + 14, // 52px
} as const;

/**
 * フレットボードのパールインレイ位置
 */
export const PEARL_INLAY_POSITIONS = [
  { fret: 5, count: 1 },
  { fret: 7, count: 1 },
  { fret: 12, count: 2, offset: 30 },
] as const;

/**
 * シートページ関連の定数
 */
export const SHEET_PAGE = {
  TOTAL_LINES: 24,
  STAFF_LINES: 5,
  STAFF_START_INDEX: 8,
  MAX_NOTES: 6,
  MEASURE_BAR_HEIGHT: 50,
  PLAY_BUTTON_SIZE: 50,
  PLAY_BUTTON_TOP: 55,
  PLAY_BUTTON_LEFT: 10,
  PLAY_BUTTON_AREA: 70,
} as const;

/**
 * タッチ操作の閾値
 */
export const TOUCH_THRESHOLD = {
  TOGGLE_DISTANCE: 10, // トグルと判定する移動距離（px）
} as const;

/**
 * 再生関連の定数
 */
export const PLAYBACK = {
  MIN_BPM: 40,
  MAX_BPM: 220,
  DEFAULT_BPM: 120,
  METRONOME_FREQUENCY: 1000, // Hz
  METRONOME_DURATION: 0.05, // 秒
  METRONOME_GAIN_START: 0.3,
  METRONOME_GAIN_END: 0.01,
} as const;

/**
 * Canvas描画関連の定数
 */
export const CANVAS = {
  BASE_MEASURE_WIDTH: 100,
  LEFT_MARGIN: 10,
  RIGHT_MARGIN: 20,
  HEIGHT: 140,
  SCALE_FACTOR: 0.7,
  TOP_MARGIN: 7,
  NOTE_SIZE: 15.4,
  LINE_WIDTH: 1,
} as const;

/**
 * 音価に応じたページ間の間隔
 */
export const MEASURE_SPACING: Record<string, number> = {
  whole: 150,
  half: 120,
  quarter: 100,
  eighth: 80,
  sixteenth: 60,
} as const;

