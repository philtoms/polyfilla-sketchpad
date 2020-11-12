const bar = (el, bid, bar, score) => {
  const beats = score.signature.split('/').shift();
  let elBar = document.getElementById(`b-${bid}`);
  if (!elBar) {
    el.innerHTML += `<div class="bar" id="b-${bid}"></div>`;
    elBar = document.getElementById(`b-${bid}`);
  }
  elBar.innerHTML = score.voices.reduce(
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

  $click(acc, e) {
    e.preventDefault();

    let {
      stave: { selectHandle, barCount },
    } = acc;

    const startPoint = e.target.id.split('-')[1] || 0;
    clearTimeout(selectHandle);
    barCount = (barCount % 3) + 1;
    selectHandle = setTimeout(() => {
      this.signal('/player/playback', {
        startPoint: parseInt(startPoint),
        count: barCount,
      });
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
  '$/player/data'(acc, { bars, score }) {
    bars.forEach((data, bid) => {
      bar(this.el, bid, data, score);
    });
  },
  '$/player/play'(acc, { bvn, data: { bars, score } }) {
    const [bid, nid] = bvn;
    bar(this.el, bid, bars[bid], score);
    document.getElementById(`n-${bid}-${0}-${nid}`).scrollIntoView();
  },
};
