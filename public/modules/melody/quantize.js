const BIGTIME = Number.MAX_VALUE;

export default (signature, data) => {
  const [beats, noteValue] = signature;
  const bar = beats * noteValue;
  const q32 = bar / 32;
  const q16 = q32 + q32;
  const q8 = q16 + q16;
  const q4 = q8 + q8;
  const q2 = q4 + q4;
  const q1 = bar;
  const qvMap = Object.entries({
    d1: q1 + q2,
    1: q1,
    '1t': (q1 / 3).toPrecision(3),
    d2: q2 + q4,
    2: q2,
    '2t': (q2 / 3).toPrecision(3),
    d4: q4 + q8,
    4: q4,
    '4t': (q4 / 3).toPrecision(3),
    d8: q8 + q16,
    8: q8,
    '8t': (q8 / 3).toPrecision(3),
    16: q16,
    32: q32
  }).reduce((acc, [k, v]) => ({ ...acc, [v]: [k, Number.parseFloat(v)] }), {});
  const qvalues = Object.values(qvMap).map(([k, v]) => v);
  qvalues.sort((a, b) => b - a);

  const quantize = t =>
    qvMap[qvalues.find(qt => t >= qt) || t < q32 ? q32 : q1 + q2];

  const nudge = (time, idx) => {
    data[idx] = {
      time,
      [0]: {
        ...data[idx][0],
        time
      }
    };
    return time;
  };

  const snap = (time, idx) => {
    const twip = time % q16;
    if (twip) {
      for (let i = idx; i < data.length; i++) {
        nudge(data[i].time - twip, i);
      }
    }
    return data[idx].time;
  };

  const maybeTriple = (time1, time2, time3, qspace) => {
    const tt = time3 - time1;
    const i1 = time2 - time1;
    const i2 = time3 - time2;
    if (time3 && tt <= qspace) {
      if (Math.abs(i1 - i2) < q16) {
        const qt = quantize(Math.max((i1 + i2) / 2, q16));
        return qt[0].endsWith('t') && qt;
      }
    }
    return 0;
  };

  return (start = 0, end) => {
    let qbar = 0;
    for (
      // step back 3 for triples
      let idx = Math.max(0, Math.min(start, start - 3));
      idx < (end || data.length);
      idx++
    ) {
      const event = data[idx];
      const idx1 = idx + 1;
      const idx2 = idx + 2;
      const idx3 = idx + 3;
      const time1 = snap(event.time, idx);
      const time2 = idx1 < data.length ? data[idx1].time : 0;
      const time3 = idx2 < data.length ? data[idx2].time : 0;
      const time4 = idx3 < data.length ? data[idx3].time : BIGTIME;

      qbar = Math.floor(time1 / bar) * bar;
      const qnext = time2 - (time2 % q16) || qbar + bar;
      data[idx].duration = quantize(qnext - time1)[0];
      // console.log(qbar, time1, duration, qnext);
      if (qnext === time1) {
        nudge(qnext + q32, idx1);
      } else {
        const qspace = Math.min(
          Math.max(0, qbar + bar - time1),
          time4 - (time4 % q16) - time1
        );
        const qt = maybeTriple(time1, time2, time3, qspace);
        if (qt) {
          nudge(time1 + qt[1], idx1);
          data[idx1].duration = qt;
          nudge(time1 + qt[1] * 2, idx2);
          data[idx2].duration = qt;
          idx = idx2;
        }
      }
    }
    return data;
  };
};
