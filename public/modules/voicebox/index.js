import { fromSPN } from './notes.js';

// for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;

const Source = (ctx, { buffer, playbackRate = 1 }) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  source.connect(ctx.destination);
  return source;
};

const Clock = (ctx, interval, cb) => {
  const loop = () => {
    const source = Source(ctx, ctx.createBuffer(1, 1, ctx.sampleRate));
    source.onended = e => {
      cb(e);
      loop();
    };
    source.start(0);
    source.stop(ctx.currentTime + interval);
  };
  loop();
};

const Voice = (ctx, sampleData) => {
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
              resolve();
            },
            err => console.error(err)
          );
        };
        request.send();
      })
  );

  const samples = {};
  return spn => {
    let sample = samples[spn];
    if (!sample) {
      ({ sample } = Object.values(samples).reduce(
        (acc, src) => {
          const interval = Math.abs(fromSPN(spn).midi - fromSPN(src.spn).midi);
          if (interval < acc.interval) {
            acc = {
              interval,
              sample: {
                ...src,
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

export default (options = { tick: 60 / 80 }) => {
  const subscriptions = [];
  let beats = 0;
  const ctx = new AudioContext(options);
  const init = () => {
    try {
      const source = Source(ctx.createBuffer(1, 1, ctx.sampleRate));
      source.start(0);
      source.connect(ctx.destination);
    } catch (e) {}
    if (ctx.resume) {
      ctx.resume();
    }
    voicebox.time = 0;
    Clock(ctx, options.tick, e => {
      const beat = beats++ % 4;
      subscriptions.forEach(cb => cb(voicebox.time, beat));
    });
    return ctx;
  };

  let baseTime = ctx.currentTime;
  const voices = {};
  const voicebox = {
    init,
    create: (vid, data) => (voices[vid] = Voice(ctx, data)) && voicebox,
    start: (vid, spn, time = 0) =>
      Source(ctx, voices[vid](spn)).start(ctx.currentTime + time),
    get time() {
      return ctx.currentTime - baseTime;
    },
    set time(time) {
      baseTime = ctx.currentTime - time;
    },
    subscribe: cb => {
      subscriptions.push(cb);
      return subscriptions.length - 1;
    },
    unsubscribe: sid => subscriptions.splice(sid, 1),
    schedule: (startTime, beats, events) => {
      const lead = options.tick * beats;
      events.forEach(({ vid, spn, time }) =>
        voicebox.start(vid, spn, time - startTime + lead)
      );
      voicebox.time = startTime - lead;
    }
  };
  return voicebox;
};
