/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react"
import SheetPage from "./SheetPage";

function App() {

  return (
    <div css={css`width: 100vw; height: 100vh;`}>
      <div css={css`width: 100%; height: 90%;`}>
        <SheetPage />
      </div>
      <div css={css`width: 100%; height: 10%; background-color: gray;`}>
      </div>
    </div>
  );
}

export default App;
