// 音声再生関連のユーティリティ関数

import { noteNumberToMidi } from './midi';

/**
 * MIDIノート番号から周波数を計算
 * @param midi MIDIノート番号（0-127）
 * @returns 周波数（Hz）
 */
export const midiToFrequency = (midi: number): number => {
  // A4 (MIDI 69) = 440Hz を基準とする
  return 440 * Math.pow(2, (midi - 69) / 12);
};

/**
 * 音符番号文字列（例: "0", "0#", "0b", "0n"）をMIDIノート番号に変換
 * @param noteStr 音符番号文字列
 * @returns MIDIノート番号
 */
export const noteStringToMidi = (noteStr: string): number => {
  // シャープ、フラット、ナチュラル記号を除去して数値に変換
  const isSharp = noteStr.endsWith('#');
  const isFlat = noteStr.endsWith('b');
  const isNatural = noteStr.endsWith('n');
  const noteNumStr = noteStr.replace('#', '').replace('b', '').replace('n', '');
  const noteNum = parseInt(noteNumStr, 10);
  
  if (isNaN(noteNum)) {
    return 60; // デフォルトでC4を返す
  }
  
  const baseMidi = noteNumberToMidi(noteNum);
  
  // シャープ/フラット/ナチュラルの処理
  // ナチュラルの場合は調号の影響を無視するが、ここでは基本音を返す
  if (isSharp) {
    return baseMidi + 1;
  } else if (isFlat) {
    return baseMidi - 1;
  } else {
    return baseMidi;
  }
};

/**
 * ディストーション効果を追加するWaveShaperを作成
 */
const createDistortion = (audioContext: AudioContext, amount: number = 50): WaveShaperNode => {
  const waveShaper = audioContext.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  
  waveShaper.curve = curve;
  waveShaper.oversample = '4x';
  return waveShaper;
};

/**
 * 複数の音符を同時に再生する（和音）
 * @param noteStrs 音符番号文字列の配列（例: ["0", "4", "7"]）
 * @param duration 再生時間（秒、デフォルト: 0.5秒）
 */
export const playChord = (noteStrs: string[], duration: number = 0.5): void => {
  if (noteStrs.length === 0) return;
  
  try {
    // AudioContextを作成（既存のコンテキストがあれば再利用）
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API is not supported');
      return;
    }
    
    // グローバルなAudioContextを管理（複数の音を同時に再生する場合に備える）
    if (!(window as any).audioContext) {
      (window as any).audioContext = new AudioContext();
    }
    const audioContext = (window as any).audioContext as AudioContext;
    
    // AudioContextが停止している場合は再開（非同期で処理）
    const resumeAndPlay = async () => {
      try {
        if (audioContext.state === 'suspended') {
          console.log('Resuming audio context...');
          await audioContext.resume();
          console.log('Audio context resumed');
        }
        console.log('Playing chord with', noteStrs.length, 'notes:', noteStrs);
        playChordInternal(audioContext, noteStrs, duration);
      } catch (error) {
        console.error('Error in resumeAndPlay:', error);
        // エラーが発生しても再生を試みる
        playChordInternal(audioContext, noteStrs, duration);
      }
    };
    
    resumeAndPlay();
  } catch (error) {
    console.error('Error playing chord:', error);
  }
};

const playChordInternal = (audioContext: AudioContext, noteStrs: string[], duration: number = 0.5): void => {
  try {
    const now = audioContext.currentTime;
    
    // 和音の数に応じてディストーションの量を調整（和音が多いほど軽く）
    const distortionAmount = Math.max(8, 15 - noteStrs.length * 1.5);
    const distortion = createDistortion(audioContext, distortionAmount);
    const outputGain = audioContext.createGain();
    
    // すべての音符を共通のディストーションと出力ゲインに接続
    distortion.connect(outputGain);
    outputGain.connect(audioContext.destination);
    
    // エンベロープを設定（ギターらしいアタックとディケイ）
    const attackTime = 0.005; // 5msのアタック（鋭い）
    const decayTime = 0.1; // 100msのディケイ
    const sustainLevel = 0.4; // サステインレベル
    const releaseTime = duration - attackTime - decayTime; // リリース
    
    // 和音の数に応じて各音符の音量を調整（和音が多いほど各音符の音量を少しだけ下げる）
    // 単音の時は1.0、和音の時は少しだけ下げる（0.85程度）
    const noteVolumeReduction = noteStrs.length === 1 ? 1.0 : Math.max(0.75, 1.0 - (noteStrs.length - 1) * 0.1);
    
    // 各音符に対してオシレーターを作成
    noteStrs.forEach((noteStr) => {
      const midi = noteStringToMidi(noteStr);
      const frequency = midiToFrequency(midi);
      
      // メインオシレーター（基本音）- ノコギリ波で少しジャギーに
      const mainOsc = audioContext.createOscillator();
      mainOsc.type = 'sawtooth';
      mainOsc.frequency.value = frequency;
      
      // 2倍音オシレーター（少し強めに）
      const harmonic2Osc = audioContext.createOscillator();
      harmonic2Osc.type = 'triangle';
      harmonic2Osc.frequency.value = frequency * 2;
      
      // ゲインノード（エンベロープ用）
      const mainGain = audioContext.createGain();
      const harmonic2Gain = audioContext.createGain();
      
      // 接続: オシレーター → ゲイン → ディストーション
      mainOsc.connect(mainGain);
      harmonic2Osc.connect(harmonic2Gain);
      
      mainGain.connect(distortion);
      harmonic2Gain.connect(distortion);
      
      // メインオシレーターのエンベロープ（和音の数に応じて音量を調整）
      const mainPeakVolume = 0.5 * noteVolumeReduction;
      const mainSustainVolume = sustainLevel * noteVolumeReduction;
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(mainPeakVolume, now + attackTime);
      mainGain.gain.linearRampToValueAtTime(mainSustainVolume, now + attackTime + decayTime);
      mainGain.gain.linearRampToValueAtTime(mainSustainVolume, now + duration - releaseTime);
      mainGain.gain.linearRampToValueAtTime(0, now + duration);
      
      // 2倍音のエンベロープ（和音の数に応じて音量を調整）
      const harmonic2PeakVolume = 0.12 * noteVolumeReduction;
      const harmonic2SustainVolume = 0.08 * noteVolumeReduction;
      harmonic2Gain.gain.setValueAtTime(0, now);
      harmonic2Gain.gain.linearRampToValueAtTime(harmonic2PeakVolume, now + attackTime);
      harmonic2Gain.gain.linearRampToValueAtTime(harmonic2SustainVolume, now + attackTime + decayTime);
      harmonic2Gain.gain.linearRampToValueAtTime(harmonic2SustainVolume, now + duration - releaseTime);
      harmonic2Gain.gain.linearRampToValueAtTime(0, now + duration);
      
      // 音を再生
      mainOsc.start(now);
      harmonic2Osc.start(now);
      mainOsc.stop(now + duration);
      harmonic2Osc.stop(now + duration);
    });
    
    // 出力ゲインを調整（単音の時は0.3、和音の時は少しだけ下げる）
    const outputVolume = noteStrs.length === 1 ? 0.3 : Math.max(0.25, 0.3 - (noteStrs.length - 1) * 0.02);
    outputGain.gain.setValueAtTime(outputVolume, now);
  } catch (error) {
    console.error('Error playing chord:', error);
  }
};

/**
 * 音符を再生する（ギターっぽいジャギーな音）
 * @param noteStr 音符番号文字列（例: "0", "0#", "0b", "0n"）
 * @param duration 再生時間（秒、デフォルト: 0.5秒）
 */
export const playNote = (noteStr: string, duration: number = 0.5): void => {
  try {
    // AudioContextを作成（既存のコンテキストがあれば再利用）
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API is not supported');
      return;
    }
    
    // グローバルなAudioContextを管理（複数の音を同時に再生する場合に備える）
    if (!(window as any).audioContext) {
      (window as any).audioContext = new AudioContext();
    }
    const audioContext = (window as any).audioContext as AudioContext;
    
    // AudioContextが停止している場合は再開
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // MIDIノート番号から周波数を計算
    const midi = noteStringToMidi(noteStr);
    const frequency = midiToFrequency(midi);
    
    const now = audioContext.currentTime;
    
    // メインオシレーター（基本音）- ノコギリ波で少しジャギーに
    const mainOsc = audioContext.createOscillator();
    mainOsc.type = 'sawtooth';
    mainOsc.frequency.value = frequency;
    
    // 2倍音オシレーター（少し強めに）
    const harmonic2Osc = audioContext.createOscillator();
    harmonic2Osc.type = 'triangle';
    harmonic2Osc.frequency.value = frequency * 2;
    
    // ゲインノード（エンベロープ用）
    const mainGain = audioContext.createGain();
    const harmonic2Gain = audioContext.createGain();
    
    // ディストーション効果を追加（少し強めに）
    const distortion = createDistortion(audioContext, 15);
    
    // 最終的なゲインノード
    const outputGain = audioContext.createGain();
    
    // 接続: オシレーター → ゲイン → ディストーション → 出力ゲイン → 出力
    mainOsc.connect(mainGain);
    harmonic2Osc.connect(harmonic2Gain);
    
    mainGain.connect(distortion);
    harmonic2Gain.connect(distortion);
    
    distortion.connect(outputGain);
    outputGain.connect(audioContext.destination);
    
    // エンベロープを設定（ギターらしいアタックとディケイ）
    const attackTime = 0.005; // 5msのアタック（鋭い）
    const decayTime = 0.1; // 100msのディケイ
    const sustainLevel = 0.4; // サステインレベル
    const releaseTime = duration - attackTime - decayTime; // リリース
    
    // メインオシレーターのエンベロープ
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.5, now + attackTime);
    mainGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    mainGain.gain.linearRampToValueAtTime(sustainLevel, now + duration - releaseTime);
    mainGain.gain.linearRampToValueAtTime(0, now + duration);
    
    // 2倍音のエンベロープ（少し強めに）
    harmonic2Gain.gain.setValueAtTime(0, now);
    harmonic2Gain.gain.linearRampToValueAtTime(0.12, now + attackTime);
    harmonic2Gain.gain.linearRampToValueAtTime(0.08, now + attackTime + decayTime);
    harmonic2Gain.gain.linearRampToValueAtTime(0.08, now + duration - releaseTime);
    harmonic2Gain.gain.linearRampToValueAtTime(0, now + duration);
    
    // 出力ゲインを調整（全体の音量）
    outputGain.gain.setValueAtTime(0.3, now);
    
    // 音を再生
    mainOsc.start(now);
    harmonic2Osc.start(now);
    mainOsc.stop(now + duration);
    harmonic2Osc.stop(now + duration);
  } catch (error) {
    console.error('Error playing note:', error);
  }
};

