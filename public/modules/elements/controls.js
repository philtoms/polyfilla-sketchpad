import quantize from '../melody/quantize.js';

const { define, useContext } = hookedElements;

export default (context) => {
  define('#controls', {
    onclick(e) {
      if (e.target.id === 'clear')
        context.provide({ ...context.value, data: [] });
      if (e.target.id === 'quantize') {
        context.provide({
          ...context.value,
          data: quantize(this.score, this.data),
        });
      }
    },
    render() {
      const { voicebox, data, score } = useContext(context);
      this.voicebox = voicebox;
      this.score = score;
      this.data = data;
    },
  });
};
