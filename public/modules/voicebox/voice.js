import { fromSPN } from './notes.js';

export default (ctx, sampleData) => {
  const naturals = [];
  const samples = {};
  Object.entries(sampleData).map(
    ([spn, url]) =>
      new Promise((resolve) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          ctx.decodeAudioData(
            request.response,
            (buffer) => {
              samples[spn] = { spn, buffer, playbackRate: 1 };
              naturals.push(samples[spn]);
              resolve();
            },
            (err) => console.error(err)
          );
        };
        request.send();
      })
  );

  return (spn) => {
    let sample = samples[spn];
    if (!sample) {
      ({ sample } = naturals.reduce(
        (acc, src) => {
          const gap = fromSPN(spn).midi - fromSPN(src.spn).midi;
          const interval = Math.abs(gap + 12) % 12;
          const quality = 1 / Math.abs(gap);
          if (quality > acc.quality || interval < acc.interval) {
            const octive = Math.pow(
              2,
              parseInt((gap >= 0 ? gap : gap - 12) / 12)
            );
            const rate = Math.pow(2, interval / 12) * octive;
            acc = {
              interval,
              quality,
              sample: {
                ...src,
                spn,
                playbackRate: rate,
              },
            };
          }
          return acc;
        },
        { interval: Number.MAX_SAFE_INTEGER, quality: 0 }
      ));
    }
    return (samples[spn] = sample);
  };
};
