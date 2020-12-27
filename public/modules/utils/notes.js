let basenotes = [];
let span;
let span2;
let span4;
let ospan;
let ospan2;
let ospan4;
let range;
let orange;

export const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const sharps = {
  C: 'C#',
  D: 'D#',
  F: 'F#',
  G: 'G#',
  A: 'A#',
};
export const color = {
  C: '255,255,0',
  'C#': '255,127,0',
  D: '255,0,0',
  'D#': '255,0,127',
  E: '255,0,255',
  F: '127,0,255',
  'F#': '0,0,255',
  G: '0,127,255',
  'G#': '0,255,255',
  A: '0,255,127',
  'A#': '0,255,0',
  B: '127,255,0',
};

export const setRange = (width, height) => {
  span = Math.floor(
    height / [10, 11, 12, 13, 14].find((o) => height / o <= 39)
  );
  span2 = span / 2;
  span4 = span / 4;
  range = Math.floor(height / span);

  ospan = Math.floor(
    width / [1, 2, 3, 4, 5, 6, 7, 8, 9].find((o) => width / o <= 99)
  );
  ospan2 = ospan / 2;
  ospan4 = ospan / 4;
  orange = Math.floor(width / ospan);
  const baseOctive = Math.max(
    0,
    Math.floor((11 - (range * orange) / scale.length) / 2)
  );
  for (let y = 0, idx = 0; y < range; y++) {
    for (let x = 0; x < orange; x++, idx++) {
      const interval = Math.floor(idx / range);
      const octive = baseOctive + Math.floor(idx / scale.length);
      const key = scale[idx % scale.length];
      basenotes[idx] = {
        key,
        pos: span * range - span * (idx % range) - span2,
        opos: interval * ospan + ospan2,
        idx,
        octive,
        interval,
        name: `${key}${octive}`,
      };
    }
  }
  return { range, span, ospan, orange };
};

const sharpen = (note) => {
  const key = sharps[note.key] || note.key;
  return {
    ...note,
    key,
    name: `${key}${note.octive}`,
  };
};

export const select = (x, y, center, sharp) => {
  const spot = center ? span4 : span2;
  const ospot = center ? ospan4 : ospan2;
  const xpos = Math.min(orange * ospan, x);
  const ypos = Math.min(range * span, y);
  const note = basenotes.find(
    ({ pos, opos }) =>
      Math.abs(pos - ypos) <= spot && Math.abs(opos - xpos) <= ospot
  );
  return (sharp && sharpen(note)) || note || {};
};
