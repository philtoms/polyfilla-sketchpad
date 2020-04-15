import { select } from './notes.js';
import client from '../utils/client.js';

let previousNote = '';
let nextNote = 0;
let nextBar = 0;
let nextTime = null;

export default (context) => {
  const { batch } = client(context);
  const play = (vid, touch) => {
    const { voicebox } = context.value;
    if (nextTime === null) {
      nextTime = 0;
      voicebox.time = nextTime;
    }
    const name = select(touch.pageX, touch.pageY).name;
    if (name && name !== previousNote) {
      previousNote = name;
      voicebox.play(vid, name);
      return register(vid, name, touch);
    }
  };

  const stop = () => {
    previousNote = '';
  };

  const register = (vid, name, touch) => {
    const { voicebox, quantize, data } = context.value;
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
      voicebox.time = data.bars[bid][vid].notes[nid].time;
    }
    batch(data.bars[bid][vid]);
    return [bid, nid];
  };

  const playback = (startpoint, count = 1, draw) => {
    const {
      voicebox,
      score: { tempo, signature },
      data: { voices, bars },
    } = context.value;
    voicebox.cancel();

    const bid = Math.max(0, startpoint - 1);

    nextBar = startpoint;
    const [bar] = signature.split('/');
    const tbar = (bar * 60) / tempo;

    const playloop = (loop = 2) => {
      const cb = ({ bid, idx, start, touch }) => {
        draw(touch);
        nextBar = bid;
        if (start) {
          nextNote = 0;
          voicebox.time = 0;
        }
        if (idx === lastIdx && loop) {
          setTimeout(() => playloop(loop - 1), 1000);
        }
      };
      let lastIdx = 0;
      voicebox.schedule(
        bars.slice(bid, bid + count + 2).reduce(
          (acc, bar, bid) =>
            acc.concat(
              Object.values(voices).reduce(
                (acc, vid) =>
                  acc.concat(
                    bar[vid].notes.map((note) => ({
                      time: tbar * bid + note.time,
                      spn: note.name,
                      bid,
                      vid,
                      start: bid === startpoint && note.nid === 0,
                      idx: ++lastIdx,
                      touch: note.touch,
                      cb,
                    }))
                  ),
                []
              )
            ),
          []
        )
      );
    };
    playloop(2);
  };
  return {
    play,
    stop,
    playback,
  };
};
