export default ctx => ({
  buffer,
  playbackRate = 1,
  cb,
  start = 0,
  stop
} = {}) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  source.connect(ctx.destination);
  if (cb) source.onended = cb;
  source.start(ctx.currentTime + start);
  if (stop) source.stop(ctx.currentTime + stop);
  return source;
};
