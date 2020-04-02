import quantize from '../melody/quantize.js';
import merge from '../utils/merge.js';
import client from '../utils/client.js';

const { define, render, useContext } = hookedElements;

export default context => {
  const { get, post } = client(context);

  const provide = state => {
    context.provide(merge(context.value, state));
    return context.value;
  };

  define('#tempo', {
    oninput({ target: { value } }) {
      const { score, state } = provide({ score: { tempo: value } });
      if (state === 'intro') post(score, 'score');
    },
    render() {
      const { voicebox, score } = useContext(context);
      if (score && score.tempo) {
        voicebox.tempo = score.tempo;
        this.element.value = score.tempo;
        this.element.nextElementSibling.innerText = score.tempo;
      }
    }
  });
  define('#signature', {
    oninput({ target: { value } }) {
      const { score, state } = provide({ score: { signature: value } });
      if (state === 'intro') post(score, 'score');
    },
    render() {
      const { voicebox, score } = useContext(context);
      if (score && score.signature) {
        voicebox.signature = score.signature;
        this.element.value = score.signature;
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
    init() {
      render(this);
      get().then(data => {
        const { score = context.value.score, events = [] } = data;
        provide({
          score,
          data: events.filter(Boolean)
        });
      });
    },
    onclick(e) {
      if (e.target.type === 'submit') {
        e.preventDefault();
        const { score, voicebox, data } = context.value;
        voicebox.init(score);
        provide({
          state: 'compose',
          quantize: quantize(voicebox.signature, data)
        });
        e.target.className = 'compose';
      }
    },
    render() {
      const { state } = useContext(context);
      this.element.className = state;
    }
  });
};
