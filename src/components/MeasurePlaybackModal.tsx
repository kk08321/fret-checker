/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState, useEffect, useRef } from "react";
import { useMeasure, NoteValue } from "../contexts/MeasureContext";
import { useKeySignature } from "../contexts/KeySignatureContext";
import { KEY_SIGNATURES, getKeySignatureNoteNames, getNoteNameFromNoteNumber } from "../utils/keySignature";
import { playChord } from "../utils/audio";

interface MeasurePlaybackModalProps {
  onClose: () => void;
}

const MeasurePlaybackModal = ({ onClose }: MeasurePlaybackModalProps) => {
  const {
    measures,
    currentMeasureIndex,
    setCurrentMeasureIndex,
    navigateToMeasure,
    updateCurrentMeasureNoteValue,
    updateCurrentMeasureDotted,
    updateCurrentMeasureTriplet,
  } = useMeasure();
  const { selectedKeySignature } = useKeySignature();
  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState(currentMeasureIndex);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  
  // 再生状態管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMeasureIndex, setPlayingMeasureIndex] = useState<number | null>(null);
  const playbackTimeoutRef = useRef<number | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);
  const [bpm, setBpm] = useState(120);
  
  // Canvasの幅を計算するための定数
  const baseMeasureWidth = 100; // 基準となるページ幅
  const leftMargin = 10; // ト音記号がないので左マージンを縮小
  const rightMargin = 20;

  // 音価に応じたページ間の間隔を計算する関数
  const getMeasureSpacing = (noteValue: NoteValue): number => {
    switch (noteValue) {
      case 'whole':
        return 150; // 全音符の後は広く
      case 'half':
        return 120; // 二分音符の後はやや広く
      case 'quarter':
        return 100; // 四分音符の後は標準
      case 'eighth':
        return 80; // 八分音符の後はやや狭く
      case 'sixteenth':
        return 60; // 十六分音符の後は狭く
      default:
        return 100;
    }
  };

  // 指定されたページのX位置を計算する関数
  const getMeasureXPosition = (measureIndex: number): number => {
    let x = leftMargin;
    for (let i = 0; i < measureIndex; i++) {
      if (i === 0) {
        x += baseMeasureWidth;
      } else {
        const prevNoteValue = measures[i - 1].noteValue;
        x += getMeasureSpacing(prevNoteValue);
      }
    }
    // 現在のページの中央位置を返す
    const currentMeasureWidth = measureIndex === 0 
      ? baseMeasureWidth 
      : getMeasureSpacing(measures[measureIndex - 1].noteValue);
    return x + currentMeasureWidth / 2;
  };

  // 選択中のページが変更されたら、モーダル内の選択も更新
  useEffect(() => {
    setSelectedMeasureIndex(currentMeasureIndex);
  }, [currentMeasureIndex]);

  // スクロールコンテナのタッチイベントがSheetPageに伝播しないようにする
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.stopPropagation();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // ページ切り替え
  const handleFirstMeasure = () => {
    if (selectedMeasureIndex > 0) {
      setSelectedMeasureIndex(0);
      setCurrentMeasureIndex(0);
    }
  };

  const handlePrevMeasure = () => {
    if (selectedMeasureIndex > 0) {
      const newIndex = selectedMeasureIndex - 1;
      setSelectedMeasureIndex(newIndex);
      navigateToMeasure('prev');
    }
  };

  const handleNextMeasure = () => {
    if (selectedMeasureIndex < measures.length - 1) {
      const newIndex = selectedMeasureIndex + 1;
      setSelectedMeasureIndex(newIndex);
      navigateToMeasure('next');
    }
  };

  const handleLastMeasure = () => {
    if (selectedMeasureIndex < measures.length - 1) {
      const lastIndex = measures.length - 1;
      setSelectedMeasureIndex(lastIndex);
      setCurrentMeasureIndex(lastIndex);
    }
  };

  // 音価変更
  const handleNoteValueChange = (noteValue: NoteValue) => {
    updateCurrentMeasureNoteValue(noteValue);
  };

  // 音価から再生時間（秒）を計算
  const getNoteValueDuration = (noteValue: NoteValue, isDotted: boolean = false, isTriplet: boolean = false): number => {
    const beatsPerSecond = bpm / 60; // BPMから拍/秒を計算
    let baseDuration: number;
    switch (noteValue) {
      case 'whole':
        baseDuration = 4 / beatsPerSecond; // 4拍
        break;
      case 'half':
        baseDuration = 2 / beatsPerSecond; // 2拍
        break;
      case 'quarter':
        baseDuration = 1 / beatsPerSecond; // 1拍
        break;
      case 'eighth':
        baseDuration = 0.5 / beatsPerSecond; // 0.5拍
        break;
      case 'sixteenth':
        baseDuration = 0.25 / beatsPerSecond; // 0.25拍
        break;
      default:
        baseDuration = 1 / beatsPerSecond;
    }
    
    // 付点音符の場合は1.5倍
    if (isDotted) {
      baseDuration *= 1.5;
    }
    
    // 三連符の場合は2/3倍
    if (isTriplet) {
      baseDuration *= 2 / 3;
    }
    
    return baseDuration;
  };

  // メトロノーム音を再生
  const playMetronomeClick = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      if (!(window as any).audioContext) {
        (window as any).audioContext = new AudioContext();
      }
      const audioContext = (window as any).audioContext as AudioContext;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      
      // メトロノーム音（高めのクリック音）
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 1000; // 1000Hzのクリック音
      
      // 短い音（0.05秒）
      const duration = 0.05;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (error) {
      console.error('Error playing metronome:', error);
    }
  };

  // 再生開始
  const handlePlay = () => {
    if (isPlaying) {
      // 再生中の場合は停止
      handleStop();
      return;
    }

    if (measures.length === 0) return;

    setIsPlaying(true);
    setPlayingMeasureIndex(0);
    
    // メトロノームを開始（四分音符のタイミングで）
    const quarterNoteDuration = 60 / bpm; // 四分音符の長さ（秒）
    playMetronomeClick(); // 最初のクリックを即座に鳴らす
    
    metronomeIntervalRef.current = window.setInterval(() => {
      playMetronomeClick();
    }, quarterNoteDuration * 1000);
    
    // 最初のページを再生
    playMeasure(0);
  };

  // 再生停止
  const handleStop = () => {
    setIsPlaying(false);
    setPlayingMeasureIndex(null);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }
  };

  // 指定されたページを再生し、次のページへの再生をスケジュール
  const playMeasure = (measureIndex: number) => {
    if (measureIndex >= measures.length) {
      // すべてのページを再生完了
      handleStop();
      return;
    }

    const measure = measures[measureIndex];
    // 音符がある場合は再生
    if (measure.notes.length > 0) {
      const duration = getNoteValueDuration(measure.noteValue, measure.isDotted || false, measure.isTriplet || false);
      playChord(measure.notes, duration);
    }
    // 音符がない場合は、そのページの音価に応じた長さで無音をキープ（休符として処理）

    // 次のページへの再生をスケジュール
    // 音符がない場合でも、そのページの音価（全音符、二分音符など）に応じた長さで無音をキープ
    const duration = getNoteValueDuration(measure.noteValue, measure.isDotted || false, measure.isTriplet || false);
    
    setPlayingMeasureIndex(measureIndex);
    
    playbackTimeoutRef.current = setTimeout(() => {
      playMeasure(measureIndex + 1);
    }, duration * 1000);
  };

  // 指定されたページを中央にスクロールする関数
  const scrollToMeasure = (measureIndex: number) => {
    if (!containerRef.current || measureIndex < 0 || measureIndex >= measures.length) return;

    const container = containerRef.current;
    const measureX = getMeasureXPosition(measureIndex);
    
    // スケールファクターを考慮（0.7倍）
    const scaleFactor = 0.7;
    const scaledMeasureX = measureX * scaleFactor;
    
    // コンテナの幅とスクロール位置を取得
    const containerWidth = container.getBoundingClientRect().width;
    
    // ページが中央に来るようにスクロール位置を計算
    const scrollLeft = scaledMeasureX - containerWidth / 2;
    
    // スムーズにスクロール
    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth',
    });
  };

  // 再生中のページが変更されたときに自動スクロール
  useEffect(() => {
    if (playingMeasureIndex !== null) {
      scrollToMeasure(playingMeasureIndex);
    }
  }, [playingMeasureIndex, measures, canvasWidth]);

  // 選択中のページが変更されたときに自動スクロール
  useEffect(() => {
    scrollToMeasure(selectedMeasureIndex);
  }, [selectedMeasureIndex, measures, canvasWidth]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, []);

  // Canvasに楽譜を描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvasサイズを設定
    const dpr = window.devicePixelRatio || 1;
    const containerElement = containerRef.current;
    const containerWidth = containerElement ? containerElement.getBoundingClientRect().width : 800;
    const canvasHeight = 200; // 高さを短くして一覧性を向上
    // Canvasの幅はページ数に応じて計算（最小でもコンテナ幅）
    // 各ページの間隔を音価に応じて計算
    let totalWidth = leftMargin;
    measures.forEach((_, index) => {
      if (index === 0) {
        // 最初のページは基準幅を使用
        totalWidth += baseMeasureWidth;
      } else {
        // 前のページの音価に応じた間隔を使用
        const prevNoteValue = measures[index - 1].noteValue;
        totalWidth += getMeasureSpacing(prevNoteValue);
      }
    });
    totalWidth += rightMargin;
    const calculatedCanvasWidth = Math.max(containerWidth, totalWidth);
    setCanvasWidth(calculatedCanvasWidth);
    canvas.width = calculatedCanvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${calculatedCanvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 背景をクリア
    ctx.fillStyle = '#FCFCFC';
    ctx.fillRect(0, 0, calculatedCanvasWidth, canvasHeight);

    // 楽譜全体を縮小表示（0.7倍）
    const scaleFactor = 0.7;
    ctx.save();
    ctx.scale(scaleFactor, scaleFactor);

    // 楽譜の設定
    // SheetPageでは24本の線（五線譜5本＋補助線）が均等に配置されている
    // 各線の高さは4.16666%（100% / 24）
    const topMargin = 10; // 上マージン（はみ出し防止）
    const totalLines = 24; // SheetPageと同じ24本の線
    const availableHeight = canvasHeight - topMargin; // マージンを除いた利用可能な高さ
    const lineSpacing = availableHeight / totalLines; // 各線の間隔
    const noteSize = 22; // 音符のサイズ（20%縮小: 28 * 0.8 = 22.4 → 22）

    // 五線を描画（7本目から11本目まで、つまりインデックス7-11）
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const lineIndex = 8 + i * 2;
      const y = topMargin + lineIndex * lineSpacing;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(calculatedCanvasWidth - rightMargin, y);
      ctx.stroke();
    }

    // 各ページの音符を描画
    let currentX = leftMargin;
    measures.forEach((measure, measureIndex) => {
      const measureNotes = measure.notes;
      const noteValue = measure.noteValue;
      const isDotted = measure.isDotted || false;
      const isTriplet = measure.isTriplet || false;

      // このページの幅を決定（最初のページは基準幅、それ以外は前のページの音価に応じた間隔）
      const currentMeasureWidth = measureIndex === 0 
        ? baseMeasureWidth 
        : getMeasureSpacing(measures[measureIndex - 1].noteValue);

      // 補助線を描画するために、このページの音符の位置を取得
      const ledgerLines = new Set<number>(); // 補助線が必要な線のインデックス
      
      measureNotes.forEach((noteStr) => {
        const noteNum = parseInt(noteStr.replace('#', '').replace('b', '').replace('n', ''), 10);
        if (isNaN(noteNum)) return;
        
        const lineIndex = 23 - noteNum;
        // 五線譜の外（上または下）にある場合は補助線を描画
        if (lineIndex <= 0) ledgerLines.add(0);
        if (lineIndex <= 2) ledgerLines.add(2);
        if (lineIndex <= 4) ledgerLines.add(4);
        if (lineIndex <= 6) ledgerLines.add(6);
        if (lineIndex >= 18) ledgerLines.add(18);
        if (lineIndex >= 20) ledgerLines.add(20);
        if (lineIndex >= 22) ledgerLines.add(22);
      });

      // 補助線を描画
      ctx.strokeStyle = '#000'; // 必ず黒色に設定
      ledgerLines.forEach((lineIndex) => {
        const ledgerY = topMargin + lineIndex * lineSpacing;
        // 補助線は音符3つ分の横幅（音符の中心から左右に約42pxずつ）
        const ledgerLength = noteSize * 2; // 音符3つ分の長さ
        const ledgerStartX = currentX + currentMeasureWidth / 2 - ledgerLength / 2;
        const ledgerEndX = currentX + currentMeasureWidth / 2 + ledgerLength / 2;
        ctx.beginPath();
        ctx.moveTo(ledgerStartX, ledgerY);
        ctx.lineTo(ledgerEndX, ledgerY);
        ctx.stroke();
      });

      // 和音として表示するため、同じページ内のすべての音符を同じX位置に配置
      const noteX = currentX + currentMeasureWidth / 2; // ページの中央

      // 選択中のページかどうかを判定
      const isSelectedMeasure = measureIndex === selectedMeasureIndex;
      
      // 再生中のページかどうかを判定
      const isPlayingMeasure = measureIndex === playingMeasureIndex;

      // 臨時記号を先に描画（重ならないようにするため）
      const accidentals: Array<{ x: number; y: number; symbol: string }> = [];
      
      measureNotes.forEach((noteStr) => {
        // 音符番号からnote番号を取得（"0", "0#", "0b", "0n"など）
        const noteNum = parseInt(noteStr.replace('#', '').replace('b', '').replace('n', ''), 10);
        
        if (isNaN(noteNum)) return;

        // note番号から五線上の位置を計算
        // SheetPageでは24本の線が均等に配置され、Array.from({ length: 24 }, (_, i) => { const note = String(23 - i); })
        // つまり、i=0の時note=23（一番下）、i=23の時note=0（一番上）
        // 各線の位置は、i * lineSpacing（iは0から23）
        // note番号から線のインデックスを計算: lineIndex = 23 - noteNum
        const lineIndex = 23 - noteNum; // noteNum=0の時lineIndex=23（一番下）、noteNum=23の時lineIndex=0（一番上）
        const noteY = topMargin + lineIndex * lineSpacing;

        // 臨時記号の判定
        const isSharp = noteStr.includes('#');
        const isFlat = noteStr.includes('b');
        const isNatural = noteStr.includes('n');

        // 調号の判定
        let isKeySignatureSharp = false;
        let isKeySignatureFlat = false;
        if (selectedKeySignature) {
          const keySignature = KEY_SIGNATURES[selectedKeySignature];
          const { sharpNames, flatNames } = getKeySignatureNoteNames(keySignature);
          const noteName = getNoteNameFromNoteNumber(noteNum);
          if (sharpNames.has(noteName)) {
            isKeySignatureSharp = true;
          }
          if (flatNames.has(noteName)) {
            isKeySignatureFlat = true;
          }
        }

        // 臨時記号を描画（調号で自動適用されない場合のみ）
        const showSharp = isSharp && !isKeySignatureSharp && !isNatural;
        const showFlat = isFlat && !isKeySignatureFlat && !isNatural;
        const showNatural = isNatural;

        // 臨時記号の情報を保存（後で描画）
        if (showSharp || showFlat || showNatural) {
          let symbol = '';
          if (showSharp) symbol = '♯';
          else if (showFlat) symbol = '♭';
          else if (showNatural) symbol = '♮';
          
          // 各音符の左側に臨時記号を配置（Y位置に基づいて）
          accidentals.push({
            x: noteX - 25, // 音符の左側
            y: noteY,
            symbol,
          });
        }
      });

        // 臨時記号を描画
        accidentals.forEach((accidental) => {
          ctx.font = 'bold 28px serif';
          // 再生中のページの場合はオレンジ、選択中のページの場合は水色、それ以外は黒色
          ctx.fillStyle = isPlayingMeasure ? '#FF9800' : (isSelectedMeasure ? '#00BCD4' : '#000');
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(accidental.symbol, accidental.x, accidental.y);
        });
      
      // 休符の色を決定
      const restColor = isPlayingMeasure ? '#FF9800' : (isSelectedMeasure ? '#00BCD4' : '#000');
      
      // 音符がない場合は休符を描画
      if (measureNotes.length === 0) {
        const restX = currentX + currentMeasureWidth / 2; // ページの中央
        const restY = topMargin + 14 * lineSpacing; // 中央線（第3線、インデックス10）の位置
        
        ctx.fillStyle = restColor;
        ctx.strokeStyle = restColor;
        
        // 音価に応じた休符を描画
        if (noteValue === 'whole') {
          // 全休符：第4線（インデックス11）の下側に四角形を描画
          const wholeRestY = topMargin + 10 * lineSpacing; // 第4線の下側
          const wholeRestWidth = lineSpacing * 2;
          const wholeRestHeight = lineSpacing * 1;
          ctx.fillRect(restX - wholeRestWidth / 2, wholeRestY, wholeRestWidth, wholeRestHeight);
        } else if (noteValue === 'half') {
          // 二分休符：第3線（インデックス10）の上側に四角形を描画
          const halfRestY = topMargin + 11 * lineSpacing; // 第3線の上側
          const halfRestWidth = lineSpacing * 2;
          const halfRestHeight = lineSpacing * 1; // 高さは約0.5スペース
          ctx.fillRect(restX - halfRestWidth / 2, halfRestY, halfRestWidth, halfRestHeight);
        } else if (noteValue === 'quarter') {
          // 四分休符：SVGパスで描画（上下反転）
          const quarterRestPath = new Path2D('M404.25,1277.9 L404.65,1276.5 L405.09,1275 L405.57,1273.6 L406.08,1272.2 L406.64,1270.9 L407.22,1269.6 L407.85,1268.3 L408.5,1267.1 L409.89,1264.7 L411.4,1262.4 L413,1260.3 L414.68,1258.3 L416.44,1256.4 L418.25,1254.6 L420.12,1252.9 L422.02,1251.3 L423.95,1249.8 L425.89,1248.5 L427.83,1247.2 L429.76,1246 L431.66,1245 L433.53,1244 L435.35,1243.1 L437.11,1242.3 L438.8,1241.5 L440.4,1240.9 L441.91,1240.3 L443.32,1239.8 L444.6,1239.3 L445.75,1239 L446.75,1238.7 L447.6,1238.4 L447.97,1238.3 L448.28,1238.2 L448.56,1238.2 L448.79,1238.1 L448.97,1238.1 L449.1,1238 L449.18,1238 L449.2,1238 C449.2,1238,431.52,1253.7,430.01,1272.4 C428.49,1291.1,464.86,1300.2,464.86,1300.2 C464.86,1300.2,439.1,1312.3,438.6,1334.5 C438.09,1356.7,466.89,1368.3,466.89,1368.3 L422.94,1403.2 C431.02,1370.4,409.3,1337,409.3,1337 C416.88,1321.4,444.66,1302.7,444.66,1302.7 C444.66,1302.7,396.16,1309.8,404.25,1277.9 Z');
          const quarterRestScale = (lineSpacing * 4) / 165; // SVGの高さ165を基準にスケール
          const quarterRestHeight = 165 * quarterRestScale;
          ctx.save();
          ctx.translate(restX, restY - quarterRestHeight / 2);
          ctx.scale(quarterRestScale, -quarterRestScale); // 上下反転
          ctx.translate(-430, -1320); // パスの中心付近に移動
          ctx.fill(quarterRestPath);
          ctx.restore();
        } else if (noteValue === 'eighth') {
          // 八分休符：SVGパスで描画（上下反転）
          const eighthRestPath = new Path2D('M596.2,1341.8 L597.27,1341.8 L598.32,1341.7 L599.37,1341.7 L600.41,1341.7 L601.45,1341.7 L602.47,1341.7 L603.48,1341.8 L604.47,1341.8 L605.46,1341.9 L606.43,1342 L607.38,1342.2 L608.32,1342.3 L609.23,1342.5 L610.13,1342.6 L611.01,1342.8 L611.87,1343 L612.7,1343.1 L613.51,1343.3 L614.3,1343.5 L615.06,1343.7 L615.79,1343.9 L616.5,1344.1 L617.18,1344.3 L617.82,1344.5 L618.44,1344.7 L619.02,1344.9 L619.57,1345.1 L620.09,1345.3 L620.57,1345.4 L621.01,1345.6 L621.42,1345.8 L621.78,1345.9 C635.77,1350,647.96,1356.5,647.96,1356.5 L588.35,1250.9 H604.01 L675.24,1386.8 H662.61 C645.62,1365.3,628.88,1361.2,620.04,1360.7 C620.44,1362.4,620.68,1364.2,620.68,1366.1 C620.68,1379.5,609.83,1390.3,596.43,1390.3 C583.04,1390.3,572.19,1379.5,572.19,1366.1 C572.19,1352.8,582.92,1342,596.2,1341.8 Z');
          const eighthRestScale = (lineSpacing * 4) / 140; // SVGの高さ140を基準にスケール
          const eighthRestHeight = 140 * eighthRestScale;
          ctx.save();
          ctx.translate(restX, restY - eighthRestHeight / 2);
          ctx.scale(eighthRestScale, -eighthRestScale); // 上下反転
          ctx.translate(-625, -1318); // パスの中心付近に移動
          ctx.fill(eighthRestPath);
          ctx.restore();
        } else if (noteValue === 'sixteenth') {
          // 十六分休符：SVGパスで描画（上下反転）
          const sixteenthRestPath = new Path2D('M772.81,1293.3 L773.87,1293.3 L774.93,1293.2 L775.98,1293.2 L777.02,1293.2 L778.05,1293.2 L779.07,1293.2 L780.08,1293.3 L781.08,1293.4 L782.06,1293.4 L783.03,1293.6 L783.99,1293.7 L784.92,1293.8 L785.84,1294 L786.74,1294.1 L787.62,1294.3 L788.47,1294.5 L789.31,1294.6 L790.12,1294.8 L790.91,1295 L791.67,1295.2 L792.4,1295.4 L793.11,1295.6 L793.78,1295.8 L794.43,1296 L795.05,1296.2 L795.63,1296.4 L796.18,1296.6 L796.69,1296.8 L797.17,1297 L797.62,1297.1 L798.02,1297.3 L798.39,1297.4 C807.07,1300,815.07,1303.4,819.88,1305.7 L788.95,1250.9 H804.61 L875.84,1386.8 H863.21 C846.23,1365.3,829.48,1361.2,820.65,1360.7 C821.04,1362.4,821.28,1364.2,821.28,1366.1 C821.28,1379.5,810.43,1390.3,797.03,1390.3 C783.65,1390.3,772.79,1379.5,772.79,1366.1 C772.79,1352.8,783.52,1342,796.8,1341.8 C808.17,1340.8,818.68,1344.4,822.39,1345.9 C836.36,1350,848.56,1356.5,848.56,1356.5 L836.34,1334.8 C820.36,1316.4,804.99,1312.7,796.65,1312.2 C797.04,1313.9,797.29,1315.7,797.29,1317.6 C797.29,1331,786.43,1341.8,773.04,1341.8 C759.65,1341.8,748.79,1331,748.79,1317.6 C748.79,1304.3,759.53,1293.5,772.81,1293.3 Z');
          const sixteenthRestScale = (lineSpacing * 4) / 140; // SVGの高さ140を基準にスケール
          const sixteenthRestHeight = 140 * sixteenthRestScale;
          ctx.save();
          ctx.translate(restX, restY - sixteenthRestHeight / 2);
          ctx.scale(sixteenthRestScale, -sixteenthRestScale); // 上下反転
          ctx.translate(-800, -1318); // パスの中心付近に移動
          ctx.fill(sixteenthRestPath);
          ctx.restore();
        }
        
        // 付点休符の点を描画
        if (isDotted) {
          const dotX = restX + lineSpacing * 0.6; // 休符の右側
          const dotY = restY; // 休符と同じ高さ
          ctx.fillStyle = restColor;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // 次のページの位置を更新
        currentX += currentMeasureWidth;
        return;
      }
      
      // 和音の場合、縦線は一番上と一番下の音符の間を結ぶ
      // まず、すべての音符のY位置を取得（ページごとに一度だけ計算）
      const allNoteYs = measureNotes
        .map(n => {
          const num = parseInt(n.replace('#', '').replace('b', '').replace('n', ''), 10);
          if (isNaN(num)) return null;
          const lineIndex = 23 - num; // SheetPageと同じ計算
          return topMargin + lineIndex * lineSpacing;
        })
        .filter((y): y is number => y !== null);
      
      const minNoteY = Math.min(...allNoteYs);
      const maxNoteY = Math.max(...allNoteYs);
      const averageNoteY = (minNoteY + maxNoteY) / 2;
      
      // 縦線の方向を決定（中央線（12本目）より上なら下向き、下なら上向き）
      const stemDirection = averageNoteY < topMargin + 12 * lineSpacing ? 'down' : 'up';
      const stemStartX = stemDirection === 'down' ? noteX - noteSize / 2 : noteX + noteSize / 2;
      const stemEndY = stemDirection === 'down' ? maxNoteY + noteSize * 1.5 : minNoteY - noteSize * 1.5;

      // 音符を描画（和音として縦に並べる）
      measureNotes.forEach((noteStr, noteIndex) => {
        // 音符番号からnote番号を取得（"0", "0#", "0b", "0n"など）
        const noteNum = parseInt(noteStr.replace('#', '').replace('b', '').replace('n', ''), 10);
        
        if (isNaN(noteNum)) return;

        // note番号から五線上の位置を計算
        // SheetPageと同じ計算: lineIndex = 23 - noteNum
        const lineIndex = 23 - noteNum;
        const noteY = topMargin + lineIndex * lineSpacing;

        // 音符を描画（音価に応じた形状）
        // 再生中のページの場合はオレンジ、選択中のページの場合は水色、それ以外は黒色
        const noteColor = isPlayingMeasure ? '#FF9800' : (isSelectedMeasure ? '#00BCD4' : '#000');
        ctx.fillStyle = noteColor;
        ctx.strokeStyle = noteColor;
        ctx.lineWidth = 2;

        // 音価に応じた音符の描画
        if (noteValue === 'whole') {
          // 全音符（白い楕円）
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(noteX, noteY, noteSize / 2, noteSize / 2 * 0.7, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (noteValue === 'half') {
          // 二分音符（白い楕円 + 縦線）
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(noteX, noteY, noteSize / 2, noteSize / 2 * 0.7, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          // 四分音符・八分音符（黒い楕円 + 縦線）
          ctx.beginPath();
          ctx.ellipse(noteX, noteY, noteSize / 2, noteSize / 2 * 0.7, 0, 0, 2 * Math.PI);
          ctx.fill();
        }

        // 縦線は最初の音符の描画時に一度だけ描画（和音の場合は共有）
        if (noteIndex === 0 && noteValue !== 'whole') {
          // 縦線の色も選択中のページの場合は水色に
          ctx.strokeStyle = noteColor;
          ctx.beginPath();
          ctx.moveTo(stemStartX, stemDirection === 'down' ? minNoteY : maxNoteY);
          ctx.lineTo(stemStartX, stemEndY);
          ctx.stroke();
          
          // 八分音符・十六分音符の場合は旗を追加
          if (noteValue === 'eighth') {
            const flagX = stemStartX;
            const flagY = stemEndY;
            ctx.beginPath();
            if (stemDirection === 'down') {
              // 下向きの縦線には上向きの旗
              ctx.moveTo(flagX, flagY);
              ctx.quadraticCurveTo(flagX - 8, flagY - 10, flagX - 12, flagY - 15);
            } else {
              // 上向きの縦線には下向きの旗
              ctx.moveTo(flagX, flagY);
              ctx.quadraticCurveTo(flagX + 8, flagY + 10, flagX + 12, flagY + 15);
            }
            ctx.stroke();
          } else if (noteValue === 'sixteenth') {
            const flagX = stemStartX;
            const flagY = stemEndY;
            const flagSpacing = 12; // 旗の間隔
            ctx.beginPath();
            if (stemDirection === 'down') {
              // 下向きの縦線には上向きの旗を2つ
              ctx.moveTo(flagX, flagY);
              ctx.quadraticCurveTo(flagX - 8, flagY - 10, flagX - 12, flagY - 15);
              ctx.moveTo(flagX, flagY - flagSpacing);
              ctx.quadraticCurveTo(flagX - 8, flagY - flagSpacing - 10, flagX - 12, flagY - flagSpacing - 15);
            } else {
              // 上向きの縦線には下向きの旗を2つ
              ctx.moveTo(flagX, flagY);
              ctx.quadraticCurveTo(flagX + 8, flagY + 10, flagX + 12, flagY + 15);
              ctx.moveTo(flagX, flagY + flagSpacing);
              ctx.quadraticCurveTo(flagX + 8, flagY + flagSpacing + 10, flagX + 12, flagY + flagSpacing + 15);
            }
            ctx.stroke();
          }
          
          // 三連符の「3」を描画（全音符以外の場合）
          if (isTriplet && noteIndex === 0) {
            const tripletX = stemStartX;
            const tripletY = stemDirection === 'down' 
              ? minNoteY - 20 // 下向きの場合は上側
              : maxNoteY + 20; // 上向きの場合は下側
            ctx.font = 'bold 16px serif';
            ctx.fillStyle = noteColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('3', tripletX, tripletY);
          }
        }
        
        // 付点音符の点を描画（最初の音符の時のみ、全音符でも可）
        if (isDotted && measureNotes.length > 0) {
          // 最初の音符の位置を使用
          const firstNoteStr = measureNotes[0];
          const firstNoteNum = parseInt(firstNoteStr.replace('#', '').replace('b', '').replace('n', ''), 10);
          if (!isNaN(firstNoteNum)) {
            const firstLineIndex = 23 - firstNoteNum;
            const firstNoteY = topMargin + firstLineIndex * lineSpacing;
            const dotX = noteX + noteSize / 2 + 8; // 音符の右側
            const dotY = firstNoteY; // 最初の音符と同じ高さ
            ctx.fillStyle = isPlayingMeasure ? '#FF9800' : (isSelectedMeasure ? '#00BCD4' : '#000');
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });

      // 次のページの位置を更新（このページの幅分進む）
      currentX += currentMeasureWidth;
    });

    // スケールを元に戻す
    ctx.restore();
  }, [measures, selectedKeySignature, selectedMeasureIndex, playingMeasureIndex, isPlaying]);

  const currentMeasure = measures[selectedMeasureIndex];
  const currentNoteValue = currentMeasure?.noteValue || 'quarter';
  const currentIsDotted = currentMeasure?.isDotted || false;
  const currentIsTriplet = currentMeasure?.isTriplet || false;

  // 付点音符フラグの変更
  const handleDottedChange = (isDotted: boolean) => {
    if (isDotted && currentIsTriplet) {
      // 付点をONにする場合、三連符をOFFにする
      updateCurrentMeasureTriplet(false);
    }
    updateCurrentMeasureDotted(isDotted);
  };

  // 三連符フラグの変更
  const handleTripletChange = (isTriplet: boolean) => {
    if (isTriplet && currentIsDotted) {
      // 三連符をONにする場合、付点をOFFにする
      updateCurrentMeasureDotted(false);
    }
    updateCurrentMeasureTriplet(isTriplet);
  };

  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        css={css`
          background-color: #fff;
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          css={css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          `}
        >
          <h2
            css={css`
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            `}
          >
            楽譜プレイヤー
          </h2>
          <button
            onClick={onClose}
            css={css`
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
              padding: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              
              &:hover {
                background-color: rgba(0, 0, 0, 0.05);
              }
            `}
          >
            ×
          </button>
        </div>

        {/* ページ切り替えと音価指定 */}
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 20px;
            padding: 16px;
            background-color: #f5f5f5;
            border-radius: 8px;
          `}
        >
          {/* ページネーション - 白い横長ブロックにグルーピング */}
          <div
            css={css`
              display: flex;
              align-items: stretch;
              background-color: #fff;
              border-radius: 8px;
              border: 1px solid #e0e0e0;
              overflow: hidden;
            `}
          >
            {/* 最初へボタン */}
            <button
              onClick={handleFirstMeasure}
              disabled={selectedMeasureIndex === 0}
              css={css`
                flex: 0 0 auto;
                padding: 8px 16px;
                border: none;
                border-right: 1px solid #e0e0e0;
                background-color: transparent;
                color: ${selectedMeasureIndex === 0 ? '#bbb' : '#666'};
                font-size: 16px;
                cursor: ${selectedMeasureIndex === 0 ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                
                &:hover:not(:disabled) {
                  background-color: #f5f5f5;
                }
                
                &:active:not(:disabled) {
                  background-color: #eeeeee;
                }
              `}
            >
              &lt;&lt;
            </button>

            {/* 前へボタン */}
            <button
              onClick={handlePrevMeasure}
              disabled={selectedMeasureIndex === 0}
              css={css`
                flex: 0 0 auto;
                padding: 8px 16px;
                border: none;
                border-right: 1px solid #e0e0e0;
                background-color: transparent;
                color: ${selectedMeasureIndex === 0 ? '#bbb' : '#666'};
                font-size: 16px;
                cursor: ${selectedMeasureIndex === 0 ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                
                &:hover:not(:disabled) {
                  background-color: #f5f5f5;
                }
                
                &:active:not(:disabled) {
                  background-color: #eeeeee;
                }
              `}
            >
              &lt;
            </button>

            {/* ページ数表示 */}
            <div
              css={css`
                flex: 1;
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: 2px;
                padding: 8px 12px;
                border-right: 1px solid #e0e0e0;
              `}
            >
              <span
                css={css`
                  color: #333;
                  font-size: 18px;
                  font-weight: bold;
                `}
              >
                {selectedMeasureIndex + 1}/{measures.length}
              </span>
              <span
                css={css`
                  color: #999;
                  font-size: 10px;
                  font-weight: normal;
                `}
              >
              </span>
            </div>

            {/* 次へボタン */}
            <button
              onClick={handleNextMeasure}
              disabled={selectedMeasureIndex >= measures.length - 1}
              css={css`
                flex: 0 0 auto;
                padding: 8px 16px;
                border: none;
                border-right: 1px solid #e0e0e0;
                background-color: transparent;
                color: ${selectedMeasureIndex >= measures.length - 1 ? '#bbb' : '#666'};
                font-size: 16px;
                cursor: ${selectedMeasureIndex >= measures.length - 1 ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                
                &:hover:not(:disabled) {
                  background-color: #f5f5f5;
                }
                
                &:active:not(:disabled) {
                  background-color: #eeeeee;
                }
              `}
            >
              &gt;
            </button>

            {/* 最後へボタン */}
            <button
              onClick={handleLastMeasure}
              disabled={selectedMeasureIndex >= measures.length - 1}
              css={css`
                flex: 0 0 auto;
                padding: 8px 16px;
                border: none;
                background-color: transparent;
                color: ${selectedMeasureIndex >= measures.length - 1 ? '#bbb' : '#666'};
                font-size: 16px;
                cursor: ${selectedMeasureIndex >= measures.length - 1 ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                
                &:hover:not(:disabled) {
                  background-color: #f5f5f5;
                }
                
                &:active:not(:disabled) {
                  background-color: #eeeeee;
                }
              `}
            >
              &gt;&gt;
            </button>
          </div>

          {/* 音価指定 */}
          <div
            css={css`
              display: flex;
              background-color: rgba(120, 120, 128, 0.16);
              border-radius: 8.91px;
              padding: 2.5px;
              gap: 0;
            `}
          >
            {(['whole', 'half', 'quarter', 'eighth', 'sixteenth'] as NoteValue[]).map((value) => {
              const isSelected = currentNoteValue === value;
              let svgPath = '';
              let viewBox = '';
              
              if (value === 'whole') {
                svgPath = 'M808.2,403c-11.1,0-20.2,6.4-20.2,14.4c0,8,9,14.4,20.2,14.4c11.1,0,20.2-6.4,20.2-14.4C828.4,409.5,819.4,403,808.2,403z    M811.3,429.3c-4.7,1.2-9.8-3.1-11.5-9.7c-1.7-6.5,0.7-12.8,5.4-14c4.7-1.2,9.8,3.1,11.5,9.7C818.3,421.8,815.9,428.1,811.3,429.3z';
                viewBox = '780 380 80 80';
              } else if (value === 'half') {
                svgPath = 'M919.2,81.4v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0   V81.4H919.2z M909.4,188.2c-5.6,3.3-10,5.9-12.3,1.9c-2.4-4,1.5-7.2,7.1-10.5c5.6-3.3,10.8-5.5,13.1-1.5   C919.7,182,915,184.9,909.4,188.2z';
                viewBox = '907 75 50 140';
              } else if (value === 'quarter') {
                svgPath = 'M179.6,81.4v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0   V81.4H179.6z';
                viewBox = '170 75 50 140';
              } else if (value === 'eighth') {
                svgPath = 'M282.2,121.3c-5.7-10.7-18.8-23.2-18.8-39.9h-2.5v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5   c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0V113c0,0,7.7,0,13.9,9.7c10.1,15.7,7.9,31.8,1.4,46.3   C289.7,153.8,287.9,132,282.2,121.3z';
                viewBox = '230 75 80 140';
              } else if (value === 'sixteenth') {
                svgPath = 'M367,140.6c5.4-11,1.2-21.5-3.2-28c-9-13.4-18.8-14.5-18.8-31.3h-2.5v93c-3.8-3.7-11.2-3.8-17.7,0.1   c-7.4,4.4-10.8,12.2-7.7,17.5c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0v-50.2c0,0,6.1,0.2,13.9,8.7   c10.7,11.5,12.1,22.9,5.6,37.5C373.7,163.6,372.2,150.2,367,140.6z M363.8,135.7c-7.5-9.5-16.7-18.4-18.5-32.4   c1.3,0.7,6.8,3.8,13.6,11.1c6.9,7.4,9.9,15.6,7.4,25.1C365.6,138.2,364.7,136.9,363.8,135.7z';
                viewBox = '311 76 66 126';
              }
              
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleNoteValueChange(value)}
                  css={css`
                    flex: 1;
                    padding: 7px 8px;
                    border: none;
                    border-radius: 6.67px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background-color: ${isSelected ? '#ffffff' : 'transparent'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    &:active {
                      transform: scale(0.98);
                    }
                  `}
                >
                  <svg
                    viewBox={viewBox}
                    css={css`
                      width: 32px;
                      height: 40px;
                      fill: ${isSelected ? '#007aff' : 'rgba(60, 60, 67, 0.6)'};
                      stroke: none;
                    `}
                  >
                    <path d={svgPath} />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* 付点音符と三連符の設定 */}
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 32px;
            `}
          >
            {/* 付点音符トグル */}
            <label
              htmlFor="dottedToggle"
              css={css`
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
              `}
            >
              <span
                css={css`
                  font-size: 14px;
                  color: #666;
                  font-weight: 400;
                `}
              >
                付点
              </span>
              <div
                css={css`
                  position: relative;
                  width: 51px;
                  height: 31px;
                  flex-shrink: 0;
                `}
              >
                <input
                  type="checkbox"
                  id="dottedToggle"
                  checked={currentIsDotted}
                  onChange={(e) => handleDottedChange(e.target.checked)}
                  css={css`
                    opacity: 0;
                    width: 0;
                    height: 0;
                    position: absolute;
                  `}
                />
                <span
                  css={css`
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: ${currentIsDotted ? '#34c759' : 'rgba(120, 120, 128, 0.16)'};
                    transition: background-color 0.3s ease;
                    border-radius: 15.5px;
                    
                    &:before {
                      position: absolute;
                      content: "";
                      height: 27px;
                      width: 27px;
                      left: 2px;
                      bottom: 2px;
                      background-color: white;
                      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      border-radius: 50%;
                      transform: ${currentIsDotted ? 'translateX(20px)' : 'translateX(0)'};
                      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06);
                    }
                  `}
                />
              </div>
            </label>

            {/* 三連符トグル */}
            <label
              htmlFor="tripletToggle"
              css={css`
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
              `}
            >
              <span
                css={css`
                  font-size: 14px;
                  color: #666;
                  font-weight: 400;
                `}
              >
                三連符
              </span>
              <div
                css={css`
                  position: relative;
                  width: 51px;
                  height: 31px;
                  flex-shrink: 0;
                `}
              >
                <input
                  type="checkbox"
                  id="tripletToggle"
                  checked={currentIsTriplet}
                  onChange={(e) => handleTripletChange(e.target.checked)}
                  css={css`
                    opacity: 0;
                    width: 0;
                    height: 0;
                    position: absolute;
                  `}
                />
                <span
                  css={css`
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: ${currentIsTriplet ? '#34c759' : 'rgba(120, 120, 128, 0.16)'};
                    transition: background-color 0.3s ease;
                    border-radius: 15.5px;
                    
                    &:before {
                      position: absolute;
                      content: "";
                      height: 27px;
                      width: 27px;
                      left: 2px;
                      bottom: 2px;
                      background-color: white;
                      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      border-radius: 50%;
                      transform: ${currentIsTriplet ? 'translateX(20px)' : 'translateX(0)'};
                      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06);
                    }
                  `}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Canvasで楽譜を表示 */}
        <div
          ref={containerRef}
          data-scroll-container
          css={css`
            flex: 1;
            overflow: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #FCFCFC;
            touch-action: pan-x pan-y;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          `}
        >
          <canvas
            ref={canvasRef}
            css={css`
              height: 200px;
              display: block;
              pointer-events: none;
              touch-action: none;
            `}
            style={{
              width: canvasWidth > 0 ? `${canvasWidth}px` : '100%',
            }}
          />
        </div>

        {/* BPM入力 */}
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 2px;
            `}
          >
            <label
              css={css`
                font-size: 14px;
                color: #666;
                font-weight: 500;
              `}
            >
              BPM:
            </label>
            <input
              type="number"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 40 && value <= 220) {
                  setBpm(value);
                }
              }}
              disabled={isPlaying}
              css={css`
                width: 50px;
                padding: 6px 0;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                text-align: center;
                background-color: ${isPlaying ? '#f5f5f5' : '#fff'};
                color: ${isPlaying ? '#999' : '#333'};
                
                &:focus {
                  outline: none;
                  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
                }
                
                &:disabled {
                  cursor: not-allowed;
                }
              `}
            />
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 40 && value <= 220) {
                  setBpm(value);
                }
              }}
              disabled={isPlaying}
              css={css`
                flex: 1;
                max-width: 300px;
                height: 6px;
                border-radius: 3px;
                background: ${isPlaying ? '#e0e0e0' : '#ddd'};
                outline: none;
                cursor: ${isPlaying ? 'not-allowed' : 'pointer'};
                
                &::-webkit-slider-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: ${isPlaying ? '#999' : '#4CAF50'};
                  cursor: ${isPlaying ? 'not-allowed' : 'pointer'};
                  transition: all 0.2s;
                  
                  &:hover {
                    background: ${isPlaying ? '#999' : '#45a049'};
                    transform: scale(1.1);
                  }
                }
                
                &::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: ${isPlaying ? '#999' : '#4CAF50'};
                  cursor: ${isPlaying ? 'not-allowed' : 'pointer'};
                  border: none;
                  transition: all 0.2s;
                  
                  &:hover {
                    background: ${isPlaying ? '#999' : '#45a049'};
                    transform: scale(1.1);
                  }
                }
              `}
            />
          </div>
        </div>

        {/* 再生ボタン */}
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
          `}
        >
          <button
            onClick={handlePlay}
            css={css`
              padding: 12px 24px;
              border-radius: 8px;
              border: 2px solid ${isPlaying ? '#f44336' : '#4CAF50'};
              background-color: ${isPlaying ? '#ffebee' : '#E8F5E9'};
              color: ${isPlaying ? '#f44336' : '#2E7D32'};
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              min-width: 120px;
              
              &:hover {
                background-color: ${isPlaying ? '#ffcdd2' : '#C8E6C9'};
                border-color: ${isPlaying ? '#e53935' : '#4CAF50'};
              }
              
              &:active {
                transform: scale(0.95);
              }
            `}
          >
            {isPlaying ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                停止
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                再生
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurePlaybackModal;

