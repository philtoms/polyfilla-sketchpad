export default {
  $init({ voicebox }) {
    let tick = '';
    let blink = true;
    voicebox.subscribe((beat) => {
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
  $state({ score: { bvn } }) {
    this.bin = bvn.bin;
  },
};
