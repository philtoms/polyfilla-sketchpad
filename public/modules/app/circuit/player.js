import { select } from '../../melody/notes.js';
import quantize from '../../melody/quantize.js';
import voicebox from '../voicebox.js';

import client from '../../utils/client.js';

let previousNote = '';
let nextNote = 0;
let nextBar = 0;
let nextTime = null;

export const play = (vid, touch) => {
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

export const stop = () => {
  previousNote = '';
};

const register = (vid, name, touch) => {
  const { voicebox, quantize, data, client } = context;
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
  client.batch(data.bars[bid][vid]);
  return [bid, nid];
};

export const playback = (startpoint, count = 1, draw) => {
  const {
    voicebox,
    score: { tempo, signature },
    data: { voices, bars },
  } = context;
  voicebox.cancel();

  const bid = Math.max(0, startpoint - 1);
  const bidEnd = startpoint ? bid + count + 2 : bid + count;
  nextBar = startpoint;
  const [bar] = signature.split('/');
  const tbar = (bar * 60) / tempo;

  const cb = ({ bid, last, first, touch, loop }) => {
    draw(touch);
    nextBar = bid;
    if (first) {
      nextNote = 0;
      voicebox.time = 0;
    }
    if (last && loop) {
      setTimeout(() => playloop(loop - 1), 1000);
    }
  };
  const playloop = (loop = 2) => {
    voicebox.schedule(
      bars.slice(bid, bidEnd).reduce(
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
                    touch: note.touch,
                    loop,
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

export const start = (acc) => {
  return { ...acc, voicebox: voicebox.init() };
};

export default {
  $init(acc) {
    const {
      score: { title },
    } = acc;
    client.get(title).then((data) => {
      return { ...acc, data, quantize: quantize(acc, data) };
    });
  },
  $state(acc) {},
};
