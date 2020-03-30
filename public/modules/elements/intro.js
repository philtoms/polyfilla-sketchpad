import merge from '../utils/merge.js';
import client from '../utils/client.js';

const { define, render, useContext } = hookedElements;

export default context => {
  const provide = state => context.provide(merge(context.value, state));
  const { get } = client(context);

  define('#tempo', {
    oninput({ target: { value } }) {
      this.element.nextElementSibling.innerText = value;
      provide({
        dynamics: {
          tempo: value
        }
      });
    },
    render() {
      const { voicebox, dynamics } = useContext(context);
      if (dynamics) {
        voicebox.tempo = dynamics.tempo;
      }
    }
  });
  define('#signature', {
    oninput({ target: { value } }) {
      this.signature = value;
      provide({
        dynamics: {
          signature: value
        }
      });
    },
    render() {
      const { voicebox, dynamics } = useContext(context);
      if (dynamics) {
        voicebox.signature = dynamics.signature;
      }
    }
  });
  define('#title', {
    init() {
      const title = this.element.value;
      provide({ title });
      render(this);
    },
    onchange({ target: { value } }) {
      provide({
        title: value
      });
    },
    render() {
      const { title } = useContext(context);
      if (!this.title) {
        this.title = title;
        get();
      } else if (this.title !== title) {
        window.location.href = window.location.href.replace(this.title, title);
      }
    }
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
