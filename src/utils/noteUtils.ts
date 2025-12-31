// 音符関連のユーティリティ関数

/**
 * 音符番号から臨時記号を除去して数値に変換
 */
export const parseNoteNumber = (noteStr: string): number | null => {
  const cleaned = noteStr.replace('#', '').replace('b', '').replace('n', '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
};

/**
 * 連続する音符のグループを検出し、各音符のオフセットを計算
 */
export const calculateNoteOffset = (noteNum: number, inputtedNoteNumbers: string[]): number => {
  if (inputtedNoteNumbers.length === 0) return 0;
  
  // 入力された音符を数値に変換してソート
  const inputtedNums = inputtedNoteNumbers
    .map(parseNoteNumber)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);
  
  // 現在の音符が入力されているかチェック
  if (!inputtedNums.includes(noteNum)) return 0;
  
  // 連続するグループを見つける
  const groups: number[][] = [];
  let currentGroup: number[] = [inputtedNums[0]];
  
  for (let i = 1; i < inputtedNums.length; i++) {
    if (inputtedNums[i] === inputtedNums[i - 1] + 1) {
      currentGroup.push(inputtedNums[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [inputtedNums[i]];
    }
  }
  groups.push(currentGroup);
  
  // 現在の音符が属するグループを見つける
  const group = groups.find(g => g.includes(noteNum));
  if (!group || group.length === 1) return 0;
  
  // グループ内での位置を取得（0から始まるインデックス）
  const indexInGroup = group.indexOf(noteNum);
  
  // インデックスが奇数の場合（2番目、4番目、6番目...）は左にずらす
  return indexInGroup % 2 === 1 ? -35 : 0;
};

