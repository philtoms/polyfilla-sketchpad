export default context => {
  // this accomplishes the iOS specific requirement
  var buffer = context.createBuffer(1, 1, context.sampleRate);
  var source = context.createBufferSource();
  source.buffer = buffer;
  try {
    source.connect(context.destination);
  } catch (e) {}
  source.start(0);

  // resume the audio context
  if (context.resume) {
    context.resume();
  }
};
