// Self-contained Web Audio synth — no external audio files to host or license.
let audioContext = null;

function getContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function beep(ctx, { startTime, freq, duration, type, gain, volume }) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, startTime);
  osc.type = type;
  gainNode.gain.setValueAtTime(volume * gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

const SOUND_PROFILES = {
  gentle: {
    warning: { freq: 523.25, type: 'sine', duration: 0.5, gain: 0.5 },
    alarmNotes: [523.25, 659.25, 783.99]
  },
  chime: {
    warning: { freq: 783.99, type: 'sine', duration: 0.8, gain: 0.6 },
    alarmNotes: [783.99, 659.25, 783.99, 1046.5]
  },
  urgent: {
    warning: { freq: 880, type: 'square', duration: 0.3, gain: 0.4 },
    alarmNotes: [880, 880, 880, 880, 880]
  }
};

export function playAlertSound(kind, { soundType = 'gentle', volume = 0.7 } = {}) {
  try {
    const ctx = getContext();
    const profile = SOUND_PROFILES[soundType] || SOUND_PROFILES.gentle;
    const now = ctx.currentTime;
    if (kind === 'warning') {
      const { freq, type, duration, gain } = profile.warning;
      beep(ctx, { startTime: now, freq, duration, type, gain, volume });
    } else if (kind === 'alarm') {
      profile.alarmNotes.forEach((freq, i) => {
        beep(ctx, {
          startTime: now + i * (soundType === 'urgent' ? 0.15 : 0.28),
          freq,
          duration: 0.25,
          type: soundType === 'gentle' ? 'sine' : soundType === 'chime' ? 'sine' : 'square',
          gain: 0.6,
          volume
        });
      });
    }
  } catch (err) {
    console.error('Audio playback failed:', err);
  }
}

export function primeAudio() {
  try {
    getContext();
  } catch {
    /* ignored — browser may require a user gesture first */
  }
}
