import client from '../../utils/client.js';

export function toggle(acc, value) {
  const recording = value.draw;
  if (recording) {
    return { ...acc, toggle: true, ...this.signal('../record', value) };
  }
  return { ...acc, toggle: false, record: { ...acc.record, previousNote: '' } };
}

export function record(acc, { vid, touch, name = '' }) {
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
}
