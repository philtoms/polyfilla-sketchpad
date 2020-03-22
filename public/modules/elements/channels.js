import {
  define,
  render,
  useContext
} from 'https://unpkg.com/hooked-elements?module';

import { subscribe } from '../functions/tempo.js';

export default context => {
  define('#channels', {
    init() {
      this.channels = Array.from(this.element.children).reduce(
        (acc, el, channel) => ({ ...acc, [channel]: el }),
        {}
      );
      subscribe(time => {
        console.log({ time });
      });
      render(this);
    },
    onclick(e) {
      e.preventDefault();
    },
    render() {
      const { note } = useContext(context);
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
