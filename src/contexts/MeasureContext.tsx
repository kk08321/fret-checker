import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

/**
 * MeasureContextの型定義
 * 小節情報の管理と操作に関する関数を提供
 */
interface MeasureContextType {
  measures: string[][]; // 全小節の配列（各小節は音符の配列）
  currentMeasureIndex: number; // 現在編集中の小節のインデックス
  setCurrentMeasureIndex: (index: number) => void;
  saveCurrentMeasureAndCreateNew: () => void; // 現在の小節を保存して新規小節を作成
  deleteCurrentMeasure: () => void; // 現在の小節を削除
  navigateToMeasure: (direction: 'prev' | 'next') => void; // 前後の小節に移動
  updateCurrentMeasure: (notes: string[]) => void; // 現在の小節の内容を更新
}

const MeasureContext = createContext<MeasureContextType | undefined>(undefined);

/**
 * MeasureProviderコンポーネント
 * 小節情報をContextで管理し、SheetPageとFretboardPage間で共有する
 */
export const MeasureProvider = ({ children }: { children: ReactNode }) => {
  // 全小節の配列（各小節は音符の配列）
  const [measures, setMeasures] = useState<string[][]>([[]]);
  // 現在編集中の小節のインデックス
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  // 小節読み込み中フラグ（無限ループを防ぐため）
  const isLoadingMeasureRef = useRef(false);
  // currentMeasureIndexの最新値を保持するref（updateCurrentMeasureで使用）
  const currentMeasureIndexRef = useRef(0);

  // currentMeasureIndexの変更をrefに反映
  // updateCurrentMeasure内で最新のインデックスを参照するため
  useEffect(() => {
    currentMeasureIndexRef.current = currentMeasureIndex;
  }, [currentMeasureIndex]);

  /**
   * 現在の小節の内容を更新
   * 外部（useSheetPage等）から呼び出される
   * @param notes 更新する音符の配列
   */
  const updateCurrentMeasure = (notes: string[]) => {
    // 小節読み込み中の場合は更新をスキップ（無限ループを防ぐ）
    if (!isLoadingMeasureRef.current) {
      setMeasures(prevMeasures => {
        const newMeasures = [...prevMeasures];
        const currentIndex = currentMeasureIndexRef.current;
        if (newMeasures[currentIndex] !== undefined) {
          newMeasures[currentIndex] = [...notes];
        }
        return newMeasures;
      });
    }
  };

  /**
   * 現在の小節を保存して新規小節を作成
   * 空の小節を配列の末尾に追加し、その小節に移動する
   */
  const saveCurrentMeasureAndCreateNew = () => {
    const newMeasures = [...measures];
    newMeasures.push([]); // 新規小節（空の配列）を追加
    setMeasures(newMeasures);
    isLoadingMeasureRef.current = true;
    setCurrentMeasureIndex(newMeasures.length - 1); // 新規小節に移動
    isLoadingMeasureRef.current = false;
  };

  /**
   * 現在の小節を削除
   * 小節が1つだけの場合は削除しない（空の小節を1つ残す）
   * 削除後は適切な小節に移動する
   */
  const deleteCurrentMeasure = () => {
    // 小節が1つだけの場合は削除しない（空の小節を1つ残す）
    if (measures.length <= 1) {
      return;
    }

    isLoadingMeasureRef.current = true;
    const newMeasures = [...measures];
    newMeasures.splice(currentMeasureIndex, 1); // 現在の小節を削除
    
    // 削除後のインデックスを決定
    let newIndex: number;
    if (currentMeasureIndex === measures.length - 1) {
      // 最後の小節を削除した場合は、新しい最後の小節に移動
      newIndex = newMeasures.length - 1;
    } else {
      // それ以外の場合は、前の小節に移動（インデックスを1つ減らす）
      newIndex = currentMeasureIndex - 1;
      if (newIndex < 0) {
        newIndex = 0;
      }
    }
    
    setMeasures(newMeasures);
    setCurrentMeasureIndex(newIndex);
    isLoadingMeasureRef.current = false;
  };

  /**
   * 前後の小節に移動
   * 現在の小節の内容を更新する必要がある場合は、呼び出し側（useSheetPage等）で処理
   * @param direction 移動方向（'prev' または 'next'）
   */
  const navigateToMeasure = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentMeasureIndex > 0) {
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex - 1;
      setCurrentMeasureIndex(targetIndex);
      isLoadingMeasureRef.current = false;
    } else if (direction === 'next' && currentMeasureIndex < measures.length - 1) {
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex + 1;
      setCurrentMeasureIndex(targetIndex);
      isLoadingMeasureRef.current = false;
    }
  };

  return (
    <MeasureContext.Provider
      value={{
        measures,
        currentMeasureIndex,
        setCurrentMeasureIndex,
        saveCurrentMeasureAndCreateNew,
        deleteCurrentMeasure,
        navigateToMeasure,
        updateCurrentMeasure,
      }}
    >
      {children}
    </MeasureContext.Provider>
  );
};

export const useMeasure = () => {
  const context = useContext(MeasureContext);
  if (context === undefined) {
    throw new Error("useMeasure must be used within a MeasureProvider");
  }
  return context;
};

