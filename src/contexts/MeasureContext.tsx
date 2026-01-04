import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { NoteValue, MeasureData } from "../types";
import { useDataPersistence } from "./DataPersistenceContext";

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
  clearAllMeasures: () => void; // 全ページをクリア（localStorageも削除）
}

const MeasureContext = createContext<MeasureContextType | undefined>(undefined);

// localStorageのキー名
const STORAGE_KEY_MEASURES = "fret-checker-measures";
const STORAGE_KEY_CURRENT_MEASURE_INDEX = "fret-checker-current-measure-index";

/**
 * localStorageからmeasuresを読み込む
 */
const loadMeasuresFromStorage = (): MeasureData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MEASURES);
    if (saved) {
      const parsed = JSON.parse(saved);
      // バリデーション: 配列で、各要素がMeasureDataの形式であることを確認
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((measure: any) => ({
          notes: Array.isArray(measure.notes) ? measure.notes : [],
          noteValue: measure.noteValue || 'quarter',
          isDotted: measure.isDotted || false,
          isTriplet: measure.isTriplet || false,
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load measures from localStorage:', error);
  }
  // デフォルト値: 空のページを1つ
  return [{ notes: [], noteValue: 'quarter', isDotted: false, isTriplet: false }];
};

/**
 * localStorageからcurrentMeasureIndexを読み込む
 */
const loadCurrentMeasureIndexFromStorage = (measuresLength: number): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_MEASURE_INDEX);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      // バリデーション: 有効なインデックス範囲内か確認
      if (!isNaN(index) && index >= 0 && index < measuresLength) {
        return index;
      }
    }
  } catch (error) {
    console.error('Failed to load currentMeasureIndex from localStorage:', error);
  }
  return 0;
};

/**
 * localStorageにmeasuresを保存
 */
const saveMeasuresToStorage = (measures: MeasureData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MEASURES, JSON.stringify(measures));
  } catch (error) {
    console.error('Failed to save measures to localStorage:', error);
  }
};

/**
 * localStorageにcurrentMeasureIndexを保存
 */
const saveCurrentMeasureIndexToStorage = (index: number) => {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_MEASURE_INDEX, index.toString());
  } catch (error) {
    console.error('Failed to save currentMeasureIndex to localStorage:', error);
  }
};

/**
 * localStorageからmeasuresとcurrentMeasureIndexを削除
 */
const clearMeasuresFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_MEASURES);
    localStorage.removeItem(STORAGE_KEY_CURRENT_MEASURE_INDEX);
  } catch (error) {
    console.error('Failed to clear measures from localStorage:', error);
  }
};

/**
 * MeasureProviderコンポーネント
 * ページ情報をContextで管理し、SheetPageとFretboardPage間で共有する
 */
export const MeasureProvider = ({ children }: { children: ReactNode }) => {
  // データ保存設定を取得
  const { dataPersistence } = useDataPersistence();
  
  // 全ページの配列（各ページは音符の配列と音価を含む）
  // 初期化時にlocalStorageから読み込む（データ保存が有効な場合のみ）
  // currentMeasureIndexの初期化にも使用するため、先に読み込む
  const defaultMeasure: MeasureData = { notes: [], noteValue: 'quarter', isDotted: false, isTriplet: false };
  const initialMeasures = dataPersistence === "enabled" ? loadMeasuresFromStorage() : [defaultMeasure];
  const initialCurrentMeasureIndex = dataPersistence === "enabled" ? loadCurrentMeasureIndexFromStorage(initialMeasures.length) : 0;
  const [measures, setMeasures] = useState<MeasureData[]>(initialMeasures);
  // 現在編集中のページのインデックス
  // 初期化時にlocalStorageから読み込む（measuresの長さを考慮）
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(initialCurrentMeasureIndex);
  // ページ読み込み中フラグ（無限ループを防ぐため）
  const isLoadingMeasureRef = useRef(false);
  // currentMeasureIndexの最新値を保持するref（updateCurrentMeasureで使用）
  const currentMeasureIndexRef = useRef(initialCurrentMeasureIndex);
  // 初期化フラグ（初回のlocalStorage保存を防ぐため）
  const isInitialMountRef = useRef(true);

  // currentMeasureIndexの変更をrefに反映
  // updateCurrentMeasure内で最新のインデックスを参照するため
  useEffect(() => {
    currentMeasureIndexRef.current = currentMeasureIndex;
    // インデックス変更後は、isLoadingMeasureRefをfalseに戻す
    // これにより、次の更新からupdateCurrentMeasureが正常に動作する
    isLoadingMeasureRef.current = false;
    
    // 初期化時は保存しない、データ保存が有効な場合のみ保存
    if (!isInitialMountRef.current && dataPersistence === "enabled") {
      saveCurrentMeasureIndexToStorage(currentMeasureIndex);
    }
  }, [currentMeasureIndex, dataPersistence]);

  // measuresが変更されたときにlocalStorageに保存
  useEffect(() => {
    // 初期化時は保存しない、データ保存が有効な場合のみ保存
    if (!isInitialMountRef.current && dataPersistence === "enabled") {
      saveMeasuresToStorage(measures);
    } else if (isInitialMountRef.current) {
      // 初回マウント後はフラグをfalseに
      isInitialMountRef.current = false;
    }
  }, [measures, dataPersistence]);

  // データ保存設定が無効になったときにlocalStorageをクリア
  useEffect(() => {
    if (dataPersistence === "disabled") {
      clearMeasuresFromStorage();
    }
  }, [dataPersistence]);

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

  /**
   * 全ページをクリア（localStorageも削除）
   * 設定画面から呼び出される
   */
  const clearAllMeasures = () => {
    clearMeasuresFromStorage();
    setMeasures([{ notes: [], noteValue: 'quarter', isDotted: false, isTriplet: false }]);
    setCurrentMeasureIndex(0);
    isLoadingMeasureRef.current = false;
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
        clearAllMeasures,
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

