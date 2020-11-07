import { playback } from '../../melody/player.js';

export default {
  $init(acc) {
    const channels = Array.from(this.el.children).reduce(
      (acc, el, channel) => ({ ...acc, [channel]: el }),
      {}
    );
    const { data, stave } = acc;
    this.el.innerHTML = data.bars.filter(Boolean).reduce((acc, data) => {
      // todo apply all voices
      const voice = 0;
      const { name, idx } = data[voice];
      const noteId = `${voice}-${idx}`;
      return `${acc}<span id="${noteId}" class="event"> ${name} </span>`;
    }, '');
    return {
      ...acc,
      stave: {
        ...stave,
        barCount: 0,
        channels,
      },
    };
  },
  start: ({ voicebox }) => {
    voicebox.init();
  },
  $click(acc, e) {
    e.preventDefault();

    const {
      stave: { selectHandle, barCount },
    } = acc;
    const startPoint = e.target.id.split('-')[1];
    clearTimeout(selectHandle);
    barCount = (barCount % 3) + 1;
    selectHandle = setTimeout(() => {
      // signal an internal state change
      const { drawCtx } = this.signal('/state/touch');
      playback(parseInt(startPoint), barCount, drawCtx);
      barCount = 0;
    }, 1000);

    return {
      ...acc,
      stave: {
        ...acc.stave,
        barCount,
        selectHandle,
      },
    };
  },
  '$/bvn'({ key, data }, bvn) {
    const [bid, nid] = bvn;
    const beats = key;
    let elBar = document.getElementById(`b-${bid}`);
    if (!elBar) {
      this.innerHTML += `<div class="bar" id="b-${bid}"></div>`;
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
  },
};
