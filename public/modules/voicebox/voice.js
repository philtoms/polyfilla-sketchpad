import { fromSPN } from './notes.js';

export default (ctx, sampleData) => {
  const naturals = [];
  const samples = {};
  Object.entries(sampleData).map(
    ([spn, url]) =>
      new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          ctx.decodeAudioData(
            request.response,
            buffer => {
              samples[spn] = { spn, buffer, playbackRate: 1 };
              naturals.push(samples[spn]);
              resolve();
            },
            err => console.error(err)
          );
        };
        request.send();
      })
  );

  return spn => {
    let sample = samples[spn];
    if (!sample) {
      ({ sample } = naturals.reduce(
        (acc, src) => {
          const interval = fromSPN(spn).midi - fromSPN(src.spn).midi;
          if (interval >= 0 && interval < acc.interval) {
            acc = {
              interval,
              sample: {
                ...src,
                spn,
                playbackRate: Math.pow(2, interval / 12)
              }
            };
          }
          return acc;
        },
        { interval: Number.MAX_SAFE_INTEGER }
      ));
    }
    return (samples[spn] = sample);
  };
};
