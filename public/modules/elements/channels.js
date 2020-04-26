import player from '../melody/player.js';
import { draw } from '../utils/touch.js';

const { define, render, useContext } = hookedElements;

export default (context) => {
  const { playback } = player(context);
  let barCount = 0;
  let selectHandle;
  define('#score', {
    init() {
      this.channels = Array.from(this.element.children).reduce(
        (acc, el, channel) => ({ ...acc, [channel]: el }),
        {}
      );
      render(this);
    },
    onclick(e) {
      e.preventDefault();
      const startpoint = e.target.id.split('-')[1];
      clearTimeout(selectHandle);
      barCount = (barCount % 3) + 1;
      selectHandle = setTimeout(() => {
        playback(parseInt(startpoint), barCount, draw(this.drawCtx));
        barCount = 0;
      }, 1000);
    },
    render() {
      const { bvn, voicebox, data, drawCtx, score } = useContext(context);
      this.voicebox = voicebox;
      this.drawCtx = drawCtx;
      if (bvn && bvn !== this.bvn) {
        this.bvn = bvn;
        const [bid, nid] = bvn;
        const beats = score.signature.split('/').shift();
        let elBar = document.getElementById(`b-${bid}`);
        if (!elBar) {
          this.element.innerHTML += `<div class="bar" id="b-${bid}"></div>`;
          elBar = document.getElementById(`b-${bid}`);
        }
        elBar.innerHTML = `<div class="voice" id="v-${bid}-${0}">${data.bars[
          bid
        ][0].notes.reduce(
          (acc, note) =>
            `${acc}<div class="note t-${note.duration[0]}" id="n-${bid}-${0}-${
              note.nid
            }">${note.name}</div>`,
          ''
        )}<div class="tempo-${beats}">${[1, 2, 3, 4]
          .slice(0, beats)
          .reduce(
            (acc, beat) => `${acc}<div class="beat beat-${beat}"></div>`,
            ''
          )}</div></div>`;
        document.getElementById(`n-${bid}-${0}-${nid}`).scrollIntoView();
      }
      if (data != this.data) {
        this.data = data;
        // todo apply all voices
        const voice = 0;
        this.element.innerHTML = data.bars
          .filter(Boolean)
          .reduce((acc, data) => {
            const { name, idx } = data[voice];
            const noteId = `${voice}-${idx}`;
            return `${acc}<span id="${noteId}" class="event"> ${name} </span>`;
          }, '');
      }
    },
  });
};
