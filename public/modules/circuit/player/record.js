import client from '../../utils/client.js';

export function start(acc, value) {
  return this.signal('./record', value);
}

export function stop(acc) {
  return { ...acc, record: { ...acc.record, previousNote: '' } };
}

export function record(acc, { vid, touch, name, draw }) {
  if (draw) {
    let {
      bars,
      autograph,
      quantize,
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
      const [bid, nid] = quantize(nextBar, vid, time, {
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
        voicebox.time = bars[bid][vid].notes[nid].time;
      }
      client.batch(bars[bid][vid], autograph.title);
      return {
        ...acc,
        record: {
          previousNote,
          nextNote,
          nextTime,
          nextBar,
          bvn: [bid, nid],
        },
      };
    }
  }
}
