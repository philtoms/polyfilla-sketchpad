const { define, useContext } = hookedElements;

export default (context) => {
  define('#metronome', {
    render() {
      const { voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        let blink = 0;
        this.voicebox.subscribe((beat) => {
          this.element.className = `tick-${beat} blink-${(blink = 1 - blink)}`;
          // console.log(beat, this.voicebox.time);
        });
      }
    },
  });
};
