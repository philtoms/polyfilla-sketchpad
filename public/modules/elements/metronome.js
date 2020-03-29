const { define, useContext } = hookedElements;

export default context => {
  define('#metronome', {
    render() {
      const { voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        this.voicebox.subscribe(beat => {
          this.element.className = `tick-${beat}`;
          // console.log({ time, beat });
        });
      }
    }
  });
};
