const { define, useContext } = hookedElements;

export default (context) => {
  define('#metronome', {
    render() {
      const { voicebox, bvn } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        let blink = 0;
        this.voicebox.subscribe((beat) => {
          if (this.bvn) {
            const [bin] = this.bvn;
            if (this.tick) {
              document
                .getElementsByClassName(this.tick)[0]
                .classList.remove(this.tick);
            }
            this.tick = `tick-${beat + 1}`;
            document.getElementById(`b-${bin}`).classList.add(this.tick);
          }
          this.element.className = `${beat} blink-${(blink = 1 - blink)}`;
        });
      }
      if (bvn && bvn !== this.bvn) {
        this.bvn = bvn;
      }
    },
  });
};
