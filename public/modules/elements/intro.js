import merge from '../utils/merge.js';

const { define, render, useContext } = hookedElements;

export default context => {
  const provide = state => context.provide(merge(context.value, state));
  define('#tempo', {
    oninput({ target: { value } }) {
      this.element.nextElementSibling.innerText = value;
      provide({
        dynamics: {
          tempo: value
        }
      });
      context.value.voicebox.tempo = value;
    },
    render() {}
  });
  define('#signature', {
    oninput({ target: { value } }) {
      provide({
        dynamics: {
          signature: value
        }
      });
      context.value.voicebox.signature = value;
    },
    render() {}
  });
  define('#intro', {
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        this.voicebox.init(
          merge(
            {
              tempo: 80,
              signature: '4/4'
            },
            context.value.dynamics
          )
        );
        provide({ state: 'compose' });
        e.target.className = 'compose';
      }
    },
    render() {
      const { state, voicebox } = useContext(context);
      this.voicebox = voicebox;
      this.element.className = state;
    }
  });
};
