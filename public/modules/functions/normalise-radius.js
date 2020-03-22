const bias = 100;
export default (note, pitch, momentum) => {
  const delta = pitch - noteMap[note] + bias / (momentum + 1);
  // log(momentum % bias);
  if (basenotes[0].pos + delta > 0 && basenotes[0].pos + delta < 40) {
    notes = basenotes.map(note => ({
      ...note,
      pos: note.pos + delta
    }));
  }
};
