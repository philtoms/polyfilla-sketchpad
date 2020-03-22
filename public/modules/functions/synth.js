import startContext from './start-audio-context.js';

const samples = {
  A0: 'A0.mp3',
  A1: 'A1.mp3',
  A2: 'A2.mp3',
  A3: 'A3.mp3',
  A4: 'A4.mp3',
  A5: 'A5.mp3',
  A6: 'A6.mp3',
  A7: 'A7.mp3'
};

export default () => {
  // synth = new Tone.AMSynth().toMaster();
  const synth = new Tone.Sampler(samples).toMaster();
  startContext(Tone.context);
  try {
    Object.keys(samples).forEach(s => synth.triggerAttackRelease(s));
  } catch (e) {}
  return synth;
};
