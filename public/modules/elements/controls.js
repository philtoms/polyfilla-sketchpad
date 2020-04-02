import quantize from '../melody/quantize.js';

const { define, useContext } = hookedElements;

export default context => {
  define('#controls', {
    onclick(e) {
      if (e.target.id === 'clear')
        context.provide({ ...context.value, data: [] });
      if (e.target.id === 'quantize') {
        context.provide({
          ...context.value,
          data: quantize(this.voicebox.signature, this.data)
        });
      }
    },
    render() {
      const { voicebox, data } = useContext(context);
      this.voicebox = voicebox;
      this.data = data;
    }
  });
};
