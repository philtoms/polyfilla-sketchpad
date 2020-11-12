let basenotes = [];
let noteMap;
let span;
let span2;
let ospan;
let ospan2;
let range;
let orange;

export const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
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
  range = Math.floor(height / span);

  ospan = Math.floor(
    width / [1, 2, 3, 4, 5, 6, 7, 8, 9].find((o) => width / o <= 99)
  );
  ospan2 = ospan / 2;
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
  noteMap = basenotes.reduce(
    (acc, note) => ({ ...acc, [note.name]: note }),
    {}
  );
  return { range, span, ospan, orange };
};

export const note = (name) => noteMap[name];

export const select = (x, y) => {
  const xpos = Math.min(orange * ospan, x);
  const ypos = Math.min(range * span, y);
  return basenotes.find(
    ({ pos, opos }) =>
      Math.abs(pos - ypos) <= span2 && Math.abs(opos - xpos) <= ospan2
  );
};
