import marimbaHigh from '../assets/sounds/marimba_high.mp3';
import marimbaLow from '../assets/sounds/marimba_low.mp3';
import congaHigh from '../assets/sounds/conga_high.mp3';
import congaLow from '../assets/sounds/conga_low.mp3';
import drumKitHigh from '../assets/sounds/snare.mp3';
import drumKitLow from '../assets/sounds/kick.mp3';

const lowSounds = {
  marimba: marimbaLow,
  conga: congaLow,
  drum: drumKitLow,
};

const highSounds = {
  marimba: marimbaHigh,
  conga: congaHigh,
  drum: drumKitHigh,
};

const volume = 0.25;

export const onSoundLow = (soundType: string) => {};
