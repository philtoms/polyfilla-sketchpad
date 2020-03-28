import { define, useContext } from 'https://unpkg.com/hooked-elements?module';

export default context => {
  define('#metronome', {
    render() {
      const { voicebox } = useContext(context);
      if (!this.voicebox) {
        this.voicebox = voicebox;
        this.voicebox.subscribe((time, beat) => {
          this.element.className = `tick-${beat}`;
          // console.log({ time, beat });
        });
      }
    }
  });
};
