export const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const basenotes = [...scale, ...scale, ...scale]
  .slice(0, 400 / 40)
  .map((name, idx) => ({ name, pos: 380 - idx * 40, idx }));

let notes = basenotes;

export const select = (oidx, y, m, d) => {
  const note = notes.find(({ pos }) => Math.abs(pos - y) < 20);
  if (note) {
    const octive =
      3 + Math.floor(note.idx / scale.length) + Math.floor(oidx / 200);
    const p1 = Math.max(0, Math.min(notes.length - 1, note.idx + d));
    // log(`${note.note} ${notes[0].pitch}`);
    //normalise(note.note, parseInt(f), m);
    const spn = {
      name: `${note.name}${octive}`,
      p1: notes[p1]
    };

    return spn;
  }
  return {};
};
