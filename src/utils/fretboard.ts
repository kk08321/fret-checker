// フレットボード関連の計算ユーティリティ

// 12平均律に基づくフレット間隔の計算
// フレットnからn+1までの距離は 2^(-n/12) - 2^(-(n+1)/12) に比例
export const getFretHeight = (fret: number, baseHeight: number = 90): number => {
  if (fret === 0) {
    // 開放フレット（0フレット）の高さは基準の半分
    return baseHeight / 2;
  }
  
  // フレットn-1からnまでの距離を計算
  // 2^(-(n-1)/12) - 2^(-n/12)
  const ratio = Math.pow(2, -(fret - 1) / 12) - Math.pow(2, -fret / 12);
  
  // 1フレット目の比率（開放から1フレットまで）
  const firstFretRatio = 1 - Math.pow(2, -1 / 12);
  
  // 1フレット目を基準に正規化
  return baseHeight * (ratio / firstFretRatio);
};

// 各フレットの高さを事前計算
export const calculateFretHeights = (numFrets: number = 20, baseHeight: number = 75): number[] => {
  return Array.from({ length: numFrets }, (_, i) => getFretHeight(i, baseHeight));
};

