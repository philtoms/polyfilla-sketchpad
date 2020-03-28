import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import { playback } from '../melody/play-back.js';

export default context => {
  define('#channels', {
    init() {
      this.channels = Array.from(this.element.children).reduce(
        (acc, el, channel) => ({ ...acc, [channel]: el }),
        {}
      );
      render(this);
    },
    onclick(e) {
      e.preventDefault();
      const idx = e.target.id.split('-').pop();
      playback(this.voicebox, idx);
    },
    render() {
      const { note, voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        this.voicebox.subscribe((time, beat) => {
          console.log({ time, beat });
        });
      }
      if (note) {
        const { channel, name, idx } = note;
        const elChannel = this.channels[channel];
        const noteId = `${channel}-${idx}`;
        elChannel.innerHTML =
          elChannel.innerHTML + `<span id="${noteId}"> ${name} </span>`;
        const elNote = document.getElementById(noteId);
        this.element.scrollLeft = Math.max(0, elNote.offsetLeft - 375);
        elChannel.style.width = `${elChannel.clientWidth +
          elNote.clientWidth +
          30}px`;
      }
    }
  });
};
