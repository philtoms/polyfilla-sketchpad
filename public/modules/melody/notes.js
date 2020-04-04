let basenotes;
let span = 40;
let span2 = span / 2;
let ospan;
let range;
let orange;

export const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const setRange = (width, height) => {
  span = Math.floor(
    height / [10, 11, 12, 13, 14].find((o) => height / o <= 39)
  );
  span2 = span / 2;

  basenotes = [
    ...scale,
    ...scale,
    ...scale,
    ...scale,
    ...scale,
    ...scale,
  ].slice(0, height / span);
  range = basenotes.length;
  const hpos = range * span - span2;
  basenotes = basenotes.map((name, idx) => ({
    name,
    pos: hpos - idx * span,
    idx,
  }));

  ospan = Math.floor(
    width / [1, 2, 3, 4, 5, 6, 7, 8, 9].find((o) => width / o <= 99)
  );
  orange = Math.floor(width / ospan);
  return { range, span, span2, ospan, orange };
};

export const noteMap = (y) =>
  basenotes.find(({ pos }) => Math.abs(pos - y) < span2);

export const select = (x, y) => {
  const note = noteMap(y);
  if (note) {
    const octive =
      2 + Math.floor(note.idx / scale.length) + Math.floor(x / ospan);
    return `${note.name}${octive}`;
  }
};
