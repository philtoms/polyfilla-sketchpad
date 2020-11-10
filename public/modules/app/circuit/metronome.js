import { subscribe } from '../../voicebox/index.js';

export default {
  $init() {
    let tick = '';
    let blink = true;
    subscribe((beat) => {
      if (this.bin) {
        if (tick) {
          document.getElementsByClassName(tick)[0].classList.remove(tick);
        }
        tick = `tick-${beat + 1}`;
        document.getElementById(`b-${this.bin}`).classList.add(tick);
      }
      this.el.className = `${beat} blink-${!blink}`;
    });
  },
  '$/player/play'(acc, { bvn }) {
    this.bin = bvn[0];
  },
};
