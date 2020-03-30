const { define, useContext } = hookedElements;

export default context => {
  define('#metronome', {
    render() {
      const { voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        this.voicebox.subscribe(beat => {
          this.element.className = `tick-${beat % 2}`;
          // console.log(beat, this.voicebox.time);
        });
      }
    }
  });
};
