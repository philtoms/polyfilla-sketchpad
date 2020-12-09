const bar = (el, bid, bar, autograph) => {
  const [beats] = autograph.timeSignature.split('/');
  let elBar = document.getElementById(`b-${bid}`);
  if (!elBar) {
    el.innerHTML += `<div class="bar" id="b-${bid}"></div>`;
    elBar = document.getElementById(`b-${bid}`);
  }
  elBar.innerHTML = autograph.voices.reduce(
    (acc, voice, vid) =>
      `${acc}<div class="voice" id="v-${vid}-${0}">${bar[vid].notes.reduce(
        (acc, note) =>
          `${acc}<div class="note t-${note.duration[0]}" id="n-${bid}-${vid}-${note.nid}">${note.name}</div>`,
        ''
      )}<div class="tempo-${beats}">${[1, 2, 3, 4]
        .slice(0, beats)
        .reduce(
          (acc, beat) => `${acc}<div class="beat beat-${beat}"></div>`,
          ''
        )}</div></div>`,
    ''
  );
};

export default {
  $init(acc) {
    const channels = Array.from(this.el.children).reduce(
      (acc, el, channel) => ({ ...acc, [channel]: el }),
      {}
    );
    return {
      ...acc,
      stave: {
        ...stave,
        barCount: 0,
        channels,
      },
    };
  },

  $click_(e) {
    e.preventDefault();
    const startPoint = parseInt(e.target.id.split('-')[1] || 0);
    this.signal('/player/playback', { startPoint });
  },
  '$/player/data_'({ bars, autograph }) {
    bars.forEach((data, bid) => {
      bar(this.el, bid, data, autograph);
    });
  },
  '$/player/record_'({ bvn, data: { bars, autograph } }) {
    const [bid, nid] = bvn;
    bar(this.el, bid, bars[bid], autograph);
    document.getElementById(`n-${bid}-${0}-${nid}`).scrollIntoView();
  },
};
