import quantize from '../melody/quantize.js';
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
      if (dynamics && dynamics.tempo) {
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
      if (dynamics && dynamics.signature) {
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
              tempo: 120,
              signature: '4/4'
            },
            context.value.dynamics
          )
        );
        get().then(data => {
          const quantizeData = quantize(this.voicebox.signature, data);
          provide({
            state: 'compose',
            quantize: quantizeData,
            data: quantizeData(0)
          });
        });
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
