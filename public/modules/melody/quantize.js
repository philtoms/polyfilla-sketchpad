const BIGTIME = Number.MAX_VALUE;

/*
  tempo 60
  bar 3
  beat 4
  tbar = bar * 60 / tempo = 3 * 60 / 60 = 3
  q[beat] = q4 = tbar / bar = 3 / 3 = 1
  0                   12                  24
  |                   |                   |
    t1=2         1         2         4         5

*/
export default ({ tempo, signature }, data) => {
  const [bar, beat] = signature.split('/');
  const tbar = (bar * 60) / tempo;
  const tbar2 = tbar + tbar;
  const tbeat = tbar / bar;
  const t = [64, 32, 16, 8, 4, 2, 1].reduce(
    (acc, q) => ({ ...acc, [q]: (tbeat * beat) / q }),
    {}
  );
  const q64 = t[64];
  const q32 = t[32];
  const q16 = t[16];
  const q8 = t[8];
  const q4 = t[4];
  const q2 = t[2];
  const q1 = t[1];

  const snap = (time) => time - (time % q64);

  const qvMap = Object.entries({
    d1: q1 + q2,
    1: q1,
    '1t': snap(q1 / 3),
    d2: q2 + q4,
    2: q2,
    '2t': snap(q2 / 3),
    d4: q4 + q8,
    4: q4,
    '4t': snap(q4 / 3),
    d8: q8 + q16,
    8: q8,
    '8t': snap(q8 / 3),
    16: q16,
    // 32: q32,
    // 64: q64,
  }).reduce((acc, [k, v]) => ({ ...acc, [v]: [k, Number.parseFloat(v)] }), {});
  const qvalues = Object.values(qvMap)
    .filter(([k]) => !k.endsWith('t'))
    .map(([k, v]) => v);
  qvalues.sort((a, b) => b - a);
  const tvalues = Object.values(qvMap)
    .filter(([k]) => k.endsWith('t'))
    .map(([k, v]) => v);
  tvalues.sort((a, b) => b - a);
  console.log(qvalues, tvalues);

  const quantize = (t, values = qvalues) =>
    qvMap[
      values.reduce((v, qt) => {
        const d = Math.abs(t - qt);
        return d < Math.abs(t - v) ? qt : v;
      }, q1 + q2)
    ];

  const maybeTriple = (time1, time2, time3, qspace) => {
    const tt = time3 - time1;
    const i1 = time2 - time1;
    const i2 = time3 - time2;
    if (time3 && tt <= qspace) {
      if (Math.abs(i1 - i2) < q16) {
        return quantize(Math.max((i1 + i2) / 2, q16), tvalues);
      }
    }
    return 0;
  };

  return (bid, vid, time, note) => {
    if (time % tbar2 > tbar) {
      bid++;
      note.nid = 0;
      time %= tbar;
    }
    const bar = data.bars[bid] || {
      bid,
    };
    data.bars[bid] = bar;

    const voice = bar[vid] || { vid, bid, notes: [] };
    bar[vid] = voice;

    const notes = voice.notes;
    note.nid = note.nid || 0;
    note.time = snap(time);
    note.qtime = quantize(time)[1];

    notes.length = note.nid;
    notes[note.nid] = note;

    for (let idx1 = 0; idx1 < notes.length; idx1++) {
      const idx2 = idx1 + 1;
      const idx3 = idx2 + 1;
      const time1 = notes[idx1].qtime;
      const time2 = idx2 < notes.length ? notes[idx2].time : 0;
      const time3 = idx3 < notes.length ? notes[idx3].time : 0;
      const qspace = tbar - time1;
      const qt = maybeTriple(time1, time2, time3, qspace);
      if (qt) {
        notes[idx1].qtime = time1;
        notes[idx1].duration = qt;
        notes[idx2].qtime = time1 + qt[1];
        notes[idx2].duration = qt;
        notes[idx3].qtime = time1 + qt[1] + qt[1];
        notes[idx3].duration = qt;
        idx1 = idx3;
      } else {
        const qnext = time2 || tbar;
        if (time2 && qnext === time1) {
          notes[idx2].qtime += q32;
        }
        notes[idx1].qtime = time1;
        notes[idx1].duration = quantize(qnext - time1);
      }
    }
    // console.log(bid, note.time, note.qtime, time);
    return [bid, note.nid];
  };
};
