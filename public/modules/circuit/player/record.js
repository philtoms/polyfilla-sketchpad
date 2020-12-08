import client from '../../utils/client.js';

export function start(acc, value) {
  // toggle state change
  return { ...record(acc, value), start: true };
}

export const stop = (acc) => ({
  ...acc,
  previousNote: '',
  start: false,
});

export const record = (acc, { vid, touch, name }) => {
  let {
    data,
    voicebox,
    record: { previousNote, nextNote, nextBar, nextTime } = {},
  } = acc;

  if (nextTime === null) {
    nextTime = 0;
    voicebox.time = nextTime;
  }

  if (name !== previousNote) {
    previousNote = name;
    voicebox.play(vid, name);
    let time = voicebox.time;
    const [bid, nid] = data.quantize(nextBar, vid, time, {
      name,
      time,
      nid: nextNote++,
      touch: {
        pageX: touch.pageX,
        pageY: touch.pageY,
      },
    });
    if (bid !== nextBar) {
      nextBar = bid;
      nextNote = nid + 1;
      voicebox.time = data.bars[bid][vid].notes[nid].time;
    }
    client.batch(data.bars[bid][vid], data.autograph.title);
    return {
      ...acc,
      record: {
        previousNote,
        nextNote,
        nextTime,
        nextBar,
        bvn: [bid, nid],
        data,
      },
    };
  }
};
