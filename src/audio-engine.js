export const audioCueNames = Object.freeze([
  'typeKey',
  'commit',
  'accept',
  'reject',
  'ribbonDamage',
  'blocked',
  'ghostMutation',
  'burn',
  'bind',
  'lie',
  'doorOpen',
  'trueNameBanish'
]);

const cueProfiles = Object.freeze({
  typeKey: { wave: 'square', frequency: 880, endFrequency: 520, duration: 0.026, gain: 0.018 },
  commit: { wave: 'triangle', frequency: 310, endFrequency: 460, duration: 0.07, gain: 0.034 },
  accept: { wave: 'sine', frequency: 392, endFrequency: 588, duration: 0.11, gain: 0.04 },
  reject: { wave: 'sawtooth', frequency: 190, endFrequency: 92, duration: 0.14, gain: 0.044 },
  ribbonDamage: { wave: 'sawtooth', frequency: 120, endFrequency: 58, duration: 0.16, gain: 0.034 },
  blocked: { wave: 'square', frequency: 146, endFrequency: 116, duration: 0.12, gain: 0.032 },
  ghostMutation: { wave: 'sawtooth', frequency: 250, endFrequency: 430, duration: 0.24, gain: 0.05 },
  burn: { wave: 'triangle', frequency: 620, endFrequency: 170, duration: 0.18, gain: 0.052 },
  bind: { wave: 'sine', frequency: 220, endFrequency: 148, duration: 0.18, gain: 0.04 },
  lie: { wave: 'triangle', frequency: 440, endFrequency: 330, duration: 0.16, gain: 0.034 },
  doorOpen: { wave: 'sine', frequency: 98, endFrequency: 196, duration: 0.32, gain: 0.05 },
  trueNameBanish: { wave: 'sine', frequency: 330, endFrequency: 880, duration: 0.55, gain: 0.055 }
});

export function getNextMuteState(currentMuted) {
  return !currentMuted;
}

export function getPressureIntensity(pressureLevel, options = {}) {
  if (!options.active || options.bound || options.lured || options.muted) return 0;

  const baseIntensity = {
    safe: 0,
    warning: 0.34,
    danger: 0.68
  }[pressureLevel] ?? 0;

  const mutationBoost = options.mutated ? Math.min((options.mutationLevel ?? 1) * 0.08, 0.24) : 0;
  const angryBoost = options.angry ? 0.1 : 0;
  return Math.min(baseIntensity + mutationBoost + angryBoost, 1);
}

export function createAudioEngine({ root = globalThis, documentRef = root.document } = {}) {
  const AudioContextConstructor = root.AudioContext ?? root.webkitAudioContext;
  const state = {
    available: Boolean(AudioContextConstructor),
    initialized: false,
    muted: false,
    context: null,
    masterGain: null,
    pressureOscillator: null,
    pressureGain: null,
    pressureFilter: null,
    lastPressureIntensity: 0,
    toggleButtons: []
  };

  function now() {
    return state.context?.currentTime ?? 0;
  }

  function setParam(param, value, at = now(), ramp = 0.01) {
    if (!param) return;
    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(value, at + ramp);
  }

  function initialize() {
    if (state.initialized || !state.available) return state.available;

    try {
      state.context = new AudioContextConstructor();
      state.masterGain = state.context.createGain();
      state.masterGain.gain.value = state.muted ? 0 : 0.42;
      state.masterGain.connect(state.context.destination);
      state.initialized = true;
    } catch {
      state.available = false;
    }

    return state.available;
  }

  async function resumeFromGesture() {
    if (!initialize() || state.muted) return state.available;
    if (state.context?.state === 'suspended') {
      try {
        await state.context.resume();
      } catch {
        state.available = false;
      }
    }
    return state.available;
  }

  function renderToggleControls() {
    for (const button of state.toggleButtons) {
      button.textContent = state.muted ? 'Audio: Muted' : 'Audio: On';
      button.setAttribute('aria-pressed', String(!state.muted));
      button.title = state.available ? 'Toggle generated audio feedback' : 'AudioContext unavailable in this browser';
    }
  }

  function setMuted(nextMuted) {
    state.muted = Boolean(nextMuted);
    const at = now();
    if (state.masterGain) setParam(state.masterGain.gain, state.muted ? 0 : 0.42, at, 0.035);
    if (state.muted) setPressureIntensity(0, 0.08);
    renderToggleControls();
    return state.muted;
  }

  function toggleMuted() {
    return setMuted(getNextMuteState(state.muted));
  }

  function playCue(name) {
    if (state.muted || !initialize()) return false;
    const profile = cueProfiles[name];
    if (!profile) return false;

    const audioNow = now();
    const oscillator = state.context.createOscillator();
    const gain = state.context.createGain();
    oscillator.type = profile.wave;
    oscillator.frequency.setValueAtTime(profile.frequency, audioNow);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(profile.endFrequency, 1), audioNow + profile.duration);
    gain.gain.setValueAtTime(0.0001, audioNow);
    gain.gain.exponentialRampToValueAtTime(profile.gain, audioNow + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioNow + profile.duration);
    oscillator.connect(gain);
    gain.connect(state.masterGain);
    oscillator.start(audioNow);
    oscillator.stop(audioNow + profile.duration + 0.025);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
    return true;
  }

  function ensurePressureHum() {
    if (!initialize()) return false;
    if (state.pressureOscillator) return true;

    const audioNow = now();
    state.pressureOscillator = state.context.createOscillator();
    state.pressureGain = state.context.createGain();
    state.pressureFilter = state.context.createBiquadFilter();
    state.pressureOscillator.type = 'sine';
    state.pressureOscillator.frequency.value = 64;
    state.pressureFilter.type = 'lowpass';
    state.pressureFilter.frequency.value = 340;
    state.pressureGain.gain.value = 0;
    state.pressureOscillator.connect(state.pressureFilter);
    state.pressureFilter.connect(state.pressureGain);
    state.pressureGain.connect(state.masterGain);
    state.pressureOscillator.start(audioNow);
    return true;
  }

  function setPressureIntensity(intensity, ramp = 0.12) {
    const normalizedIntensity = Math.max(0, Math.min(Number(intensity) || 0, 1));
    state.lastPressureIntensity = normalizedIntensity;
    if (state.muted || normalizedIntensity === 0) {
      if (!state.pressureGain) return false;
      setParam(state.pressureGain.gain, 0, now(), ramp);
      return true;
    }

    if (!ensurePressureHum()) return false;
    const audioNow = now();
    setParam(state.pressureGain.gain, 0.014 + normalizedIntensity * 0.038, audioNow, ramp);
    setParam(state.pressureOscillator.frequency, 52 + normalizedIntensity * 36, audioNow, ramp);
    setParam(state.pressureFilter.frequency, 260 + normalizedIntensity * 260, audioNow, ramp);
    return true;
  }

  function stopPressure() {
    setPressureIntensity(0, 0.08);
  }

  function bindToggle(button) {
    if (!button) return;

    state.toggleButtons.push(button);
    button.addEventListener('click', async () => {
      const muted = toggleMuted();
      if (!muted) await resumeFromGesture();
    });
    renderToggleControls();
  }

  if (documentRef) bindToggle(documentRef.querySelector('#audio-toggle'));

  return {
    isAvailable: () => state.available,
    isInitialized: () => state.initialized,
    isMuted: () => state.muted,
    resumeFromGesture,
    setMuted,
    toggleMuted,
    playCue,
    setPressureIntensity,
    stopPressure,
    getLastPressureIntensity: () => state.lastPressureIntensity,
    renderToggleControls
  };
}
