/**
 * 🎧 Web Audio API Ambient Soundscape Synthesizer
 * 
 * Synthesizes 4 focus soundscapes (Rain, Forest Wind, Binaural Beats, White Noise)
 * using pure Web Audio API without any external audio asset files.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

let audioCtx = null;
let currentNodes = [];
let masterGainNode = null;

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Stop active soundscape
 */
export const stopSoundscape = () => {
  try {
    currentNodes.forEach(node => {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    });
    currentNodes = [];
    masterGainNode = null;
  } catch (err) {
    console.warn('[SoundscapeEngine] Error stopping soundscape:', err);
  }
};

/**
 * Set master volume (0.0 to 1.0)
 */
export const setSoundscapeVolume = (volume = 0.5) => {
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
};

/**
 * Start ambient soundscape
 * @param {'RAIN' | 'FOREST' | 'BINAURAL' | 'WHITE_NOISE'} type 
 * @param {number} volume (0.0 to 1.0)
 */
export const startSoundscape = (type = 'RAIN', volume = 0.4) => {
  stopSoundscape();
  const ctx = getAudioContext();
  if (!ctx) return;

  masterGainNode = ctx.createGain();
  masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  masterGainNode.connect(ctx.destination);

  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  if (type === 'RAIN') {
    // 🌧️ Gentle Rain: Lowpass white noise with subtle LFO gain modulation
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    // Modulation LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2Hz swell

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(masterGainNode);

    whiteNoise.start();
    lfo.start();
    currentNodes.push(whiteNoise, lfo, filter);

  } else if (type === 'FOREST') {
    // 🌲 Pine Forest Wind: Deep lowpass pink noise with slow 0.1Hz LFO
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(masterGainNode);

    whiteNoise.start();
    lfo.start();
    currentNodes.push(whiteNoise, lfo, filter);

  } else if (type === 'BINAURAL') {
    // 🎧 Binaural Alpha Wave (10Hz focus beat): 200Hz + 210Hz dual sine tones
    const merger = ctx.createChannelMerger(2);

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, ctx.currentTime); // 10Hz Alpha beat

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    merger.connect(masterGainNode);

    oscLeft.start();
    oscRight.start();
    currentNodes.push(oscLeft, oscRight, merger);

  } else if (type === 'WHITE_NOISE') {
    // ⚡ Pure White Noise
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGainNode);

    whiteNoise.start();
    currentNodes.push(whiteNoise, filter);
  }
};
