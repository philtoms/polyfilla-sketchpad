export const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const basenotes = [...scale, ...scale, ...scale]
  .slice(0, 400 / 40)
  .map((name, idx) => ({ name, pos: 380 - idx * 40, idx }));

let notes = basenotes;

export const noteMap = y => notes.find(({ pos }) => Math.abs(pos - y) < 20);

export const select = (oidx, y) => {
  const note = noteMap(y);
  if (note) {
    const octive =
      3 + Math.floor(note.idx / scale.length) + Math.floor(oidx / 200);
    return `${note.name}${octive}`;
  }
};
