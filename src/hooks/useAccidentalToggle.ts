import { useRef, useEffect } from "react";
import { TOUCH_THRESHOLD } from "../constants";

interface UseAccidentalToggleOptions {
  isActive: boolean;
  onToggle: (enabled: boolean) => void;
  recordDragStart?: (x: number, y: number) => void;
}

/**
 * 臨時記号（シャープ、フラット、ナチュラル）のトグル操作を処理するカスタムフック
 * タッチイベントとマウスイベントの両方をサポートし、D&D操作とトグル操作を区別する
 */
export const useAccidentalToggle = ({
  isActive,
  onToggle,
  recordDragStart,
}: UseAccidentalToggleOptions) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDragOperationRef = useRef(false);
  const touchHandledRef = useRef(false);
  const modeStateRef = useRef(isActive);

  // モード状態が変更されたらrefを更新
  useEffect(() => {
    modeStateRef.current = isActive;
  }, [isActive]);

  // トグルハンドラー
  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    // タッチイベントで既に処理済みの場合は無視
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // 現在のモードをトグル
    onToggle(!isActive);
  };

  // タッチイベントハンドラー（D&Dとトグルを区別）
  useEffect(() => {
    const iconElement = iconRef.current;
    if (!iconElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      // 開始位置を記録
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      touchStartPosRef.current = { x: startX, y: startY };
      // D&D操作の開始位置を記録
      recordDragStart?.(startX, startY);
      // D&D操作フラグをリセット
      isDragOperationRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current) return;
      
      e.preventDefault(); // スクロールを防ぐため
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(currentX - touchStartPosRef.current.x, 2) +
        Math.pow(currentY - touchStartPosRef.current.y, 2)
      );

      // 移動距離が閾値を超えた場合、D&D操作として扱う
      if (distance > TOUCH_THRESHOLD.TOGGLE_DISTANCE && !isDragOperationRef.current) {
        isDragOperationRef.current = true;
        // D&D操作の開始としてモードを有効化（現在の挙動を維持）
        onToggle(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐため
      
      // touchStartPosRefがnullの場合は、touchstartが呼ばれていない可能性がある
      // その場合は直接トグル処理を行う
      if (!touchStartPosRef.current) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current = true;
        onToggle(!modeStateRef.current);
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distance = Math.sqrt(
        Math.pow(endX - touchStartPosRef.current.x, 2) +
        Math.pow(endY - touchStartPosRef.current.y, 2)
      );

      // 移動距離が閾値以下の場合はトグル操作として扱う
      if (distance <= TOUCH_THRESHOLD.TOGGLE_DISTANCE && !isDragOperationRef.current) {
        e.stopPropagation(); // トグル操作の場合は親要素のonTouchEndを防ぐ
        touchHandledRef.current = true; // タッチイベントで処理済みをマーク
        onToggle(!modeStateRef.current);
      }
      // 移動距離が閾値より大きい場合はD&D操作として扱う（既にモードが有効化されているので何もしない）
      // D&D操作の場合はstopPropagation()を呼ばない（親要素のonEnterを呼ばせるため）

      // クリーンアップ
      touchStartPosRef.current = null;
      isDragOperationRef.current = false;
    };

    iconElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    iconElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    iconElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      iconElement.removeEventListener('touchstart', handleTouchStart);
      iconElement.removeEventListener('touchmove', handleTouchMove);
      iconElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onToggle, recordDragStart]);

  return {
    iconRef,
    handleToggle,
  };
};

