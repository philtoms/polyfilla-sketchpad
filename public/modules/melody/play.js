import { select } from './notes.js';
import { register } from './play-back.js';

let lastNote;

export const play = (voicebox, channel, touch) => {
  const note = select(touch.pageX, touch.pageY);

  if (note && note !== lastNote) {
    const event = register(voicebox, channel, note, touch, voicebox.time);
    voicebox.play(0, note);
    lastNote = note;
    return event;
  }
};

export const stop = () => (lastNote = '');
