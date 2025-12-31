/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Bar from "./Bar";
import ControlPanel from "./components/ControlPanel";
import { useSheetPage } from "./hooks/useSheetPage";
import {
  sheetWrapper,
  whiteBarWrapperCss,
  blackBarWrapperCss,
  whiteBarCss,
  blackLongBarCss,
  blackShortBarCss,
} from "./styles/sheetPageStyles";

function SheetPage() {
  const {
    touchCoordinates,
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
  } = useSheetPage();

  return (
    <div
      ref={pageWrapperRef}
      css={css`
        width: 100%;
        height: 100%;
      `}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={onEnter}
    >
      <div
        css={[
          sheetWrapper,
          css`
            height: ${sheetWrapperHeight}px;
          `,
        ]}
      >
        {Array.from({ length: 24 }, (_, i) => {
          const note = String(23 - i);
          const isEven = (23 - i) % 2 === 0;
          
          // 黒バーのスタイルを決定（15-7は長い、それ以外は短い）
          const isBlackLong = (23 - i) >= 7 && (23 - i) <= 15 && (23 - i) % 2 === 1;
          
          const wrapperCss = isEven ? whiteBarWrapperCss : blackBarWrapperCss;
          const barCss = isEven 
            ? whiteBarCss 
            : (isBlackLong ? blackLongBarCss : blackShortBarCss);
          
          return (
            <Bar
              key={note}
              note={note}
              onSelected={setSelectedNote}
              coordinates={touchCoordinates}
              wrapperCss={wrapperCss}
              barCss={barCss}
            />
          );
        })}
      </div>

      <ControlPanel notes={notes} controlWrapperRef={controlWrapperRef} />
    </div>
  );
}

export default SheetPage;
