import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { NoteValue, MeasureData } from "../types";

// 型定義を再エクスポート（後方互換性のため）
export type { NoteValue, MeasureData };

/**
 * MeasureContextの型定義
 * ページ情報の管理と操作に関する関数を提供
 */
interface MeasureContextType {
  measures: MeasureData[]; // 全ページの配列
  currentMeasureIndex: number; // 現在編集中のページのインデックス
  setCurrentMeasureIndex: (index: number) => void;
  saveCurrentMeasureAndCreateNew: () => void; // 現在のページを保存して新規ページを作成
  deleteCurrentMeasure: () => void; // 現在のページを削除
  navigateToMeasure: (direction: 'prev' | 'next') => void; // 前後のページに移動
  updateCurrentMeasure: (notes: string[]) => void; // 現在のページの内容を更新
  updateCurrentMeasureNoteValue: (noteValue: NoteValue) => void; // 現在のページの音価を更新
  updateCurrentMeasureDotted: (isDotted: boolean) => void; // 現在のページの付点音符フラグを更新
  updateCurrentMeasureTriplet: (isTriplet: boolean) => void; // 現在のページの三連符フラグを更新
}

const MeasureContext = createContext<MeasureContextType | undefined>(undefined);

/**
 * MeasureProviderコンポーネント
 * ページ情報をContextで管理し、SheetPageとFretboardPage間で共有する
 */
export const MeasureProvider = ({ children }: { children: ReactNode }) => {
  // 全ページの配列（各ページは音符の配列と音価を含む）
  const [measures, setMeasures] = useState<MeasureData[]>([{ notes: [], noteValue: 'quarter', isDotted: false, isTriplet: false }]);
  // 現在編集中のページのインデックス
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  // ページ読み込み中フラグ（無限ループを防ぐため）
  const isLoadingMeasureRef = useRef(false);
  // currentMeasureIndexの最新値を保持するref（updateCurrentMeasureで使用）
  const currentMeasureIndexRef = useRef(0);

  // currentMeasureIndexの変更をrefに反映
  // updateCurrentMeasure内で最新のインデックスを参照するため
  useEffect(() => {
    currentMeasureIndexRef.current = currentMeasureIndex;
    // インデックス変更後は、isLoadingMeasureRefをfalseに戻す
    // これにより、次の更新からupdateCurrentMeasureが正常に動作する
    isLoadingMeasureRef.current = false;
  }, [currentMeasureIndex]);

  /**
   * 現在のページの内容を更新
   * 外部（useSheetPage等）から呼び出される
   * @param notes 更新する音符の配列
   */
  const updateCurrentMeasure = (notes: string[]) => {
    // ページ読み込み中の場合は更新をスキップ（無限ループを防ぐ）
    if (!isLoadingMeasureRef.current) {
      setMeasures(prevMeasures => {
        const newMeasures = [...prevMeasures];
        const currentIndex = currentMeasureIndexRef.current;
        if (newMeasures[currentIndex] !== undefined) {
          newMeasures[currentIndex] = {
            ...newMeasures[currentIndex],
            notes: [...notes],
          };
        }
        return newMeasures;
      });
    }
  };

  /**
   * 現在のページの音価を更新
   * @param noteValue 更新する音価
   */
  const updateCurrentMeasureNoteValue = (noteValue: NoteValue) => {
    setMeasures(prevMeasures => {
      const newMeasures = [...prevMeasures];
      const currentIndex = currentMeasureIndexRef.current;
      if (newMeasures[currentIndex] !== undefined) {
        newMeasures[currentIndex] = {
          ...newMeasures[currentIndex],
          noteValue,
        };
      }
      return newMeasures;
    });
  };

  /**
   * 現在のページの付点音符フラグを更新
   * @param isDotted 付点音符フラグ
   */
  const updateCurrentMeasureDotted = (isDotted: boolean) => {
    setMeasures(prevMeasures => {
      const newMeasures = [...prevMeasures];
      const currentIndex = currentMeasureIndexRef.current;
      if (newMeasures[currentIndex] !== undefined) {
        newMeasures[currentIndex] = {
          ...newMeasures[currentIndex],
          isDotted,
        };
      }
      return newMeasures;
    });
  };

  /**
   * 現在のページの三連符フラグを更新
   * @param isTriplet 三連符フラグ
   */
  const updateCurrentMeasureTriplet = (isTriplet: boolean) => {
    setMeasures(prevMeasures => {
      const newMeasures = [...prevMeasures];
      const currentIndex = currentMeasureIndexRef.current;
      if (newMeasures[currentIndex] !== undefined) {
        newMeasures[currentIndex] = {
          ...newMeasures[currentIndex],
          isTriplet,
        };
      }
      return newMeasures;
    });
  };

  /**
   * 現在のページを保存して新規ページを作成
   * 空のページを配列の末尾に追加し、そのページに移動する
   */
  const saveCurrentMeasureAndCreateNew = () => {
    const newMeasures = [...measures];
    newMeasures.push({ notes: [], noteValue: 'quarter', isDotted: false, isTriplet: false }); // 新規ページ（空の配列とデフォルト音価）を追加
    setMeasures(newMeasures);
    isLoadingMeasureRef.current = true;
    setCurrentMeasureIndex(newMeasures.length - 1); // 新規ページに移動
    // useEffectでisLoadingMeasureRef.currentがfalseに戻される
  };

  /**
   * 現在のページを削除
   * ページが1つだけの場合は削除しない（空のページを1つ残す）
   * 削除後は適切なページに移動する
   */
  const deleteCurrentMeasure = () => {
    isLoadingMeasureRef.current = true;
    const currentIndex = currentMeasureIndexRef.current;
    
    // 関数型更新を使用して最新のmeasuresを確実に参照
    setMeasures(prevMeasures => {
      // ページが1つだけの場合は削除しない（空のページを1つ残す）
      if (prevMeasures.length <= 1) {
        isLoadingMeasureRef.current = false;
        return prevMeasures;
      }

      const newMeasures = [...prevMeasures];
      newMeasures.splice(currentIndex, 1); // 現在のページを削除
      
      // 削除後のインデックスを決定
      let newIndex: number;
      if (currentIndex === prevMeasures.length - 1) {
        // 最後のページを削除した場合は、新しい最後のページに移動
        newIndex = newMeasures.length - 1;
      } else if (currentIndex === 0) {
        // 最初のページを削除した場合は、削除後もインデックス0に移動
        // （元の2ページ目が新しい1ページ目になる）
        newIndex = 0;
      } else {
        // 中間のページを削除した場合は、同じインデックスに移動
        // （削除により、そのインデックスの内容は次のページの内容になる）
        newIndex = currentIndex;
      }
      
      // インデックスを更新（React 18では自動的にバッチ処理される）
      // コールバック内で呼び出すことで、measuresとcurrentMeasureIndexが同期して更新される
      setCurrentMeasureIndex(newIndex);
      
      return newMeasures;
    });
  };

  /**
   * 前後のページに移動
   * 現在のページの内容を更新する必要がある場合は、呼び出し側（useSheetPage等）で処理
   * @param direction 移動方向（'prev' または 'next'）
   */
  const navigateToMeasure = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentMeasureIndex > 0) {
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex - 1;
      setCurrentMeasureIndex(targetIndex);
      // useEffectでisLoadingMeasureRef.currentがfalseに戻される
    } else if (direction === 'next' && currentMeasureIndex < measures.length - 1) {
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex + 1;
      setCurrentMeasureIndex(targetIndex);
      // useEffectでisLoadingMeasureRef.currentがfalseに戻される
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
        updateCurrentMeasureNoteValue,
        updateCurrentMeasureDotted,
        updateCurrentMeasureTriplet,
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

