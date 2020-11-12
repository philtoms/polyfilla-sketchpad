export function playback(acc, { startPoint, count = 1 }) {
  const {
    play,
    data: {
      bars,
      autograph: { tempo, timeSignature, voices },
    },
    voicebox,
  } = acc;

  voicebox.cancel();

  const bid = Math.max(0, startPoint - 1);
  const bidEnd = startPoint ? bid + count + 2 : bid + count;
  play.nextBar = startPoint;
  const [beats] = timeSignature.split('/');
  const tbeats = (beats * 60) / tempo;

  const cb = ({ bid, last, first, touch, loop }) => {
    this.signal('/compose/touch/draw', touch);
    play.nextBar = bid;
    if (first) {
      play.nextNote = 0;
      voicebox.time = 0;
    }
    if (last && loop) {
      setTimeout(() => playloop(loop - 1), 1000);
    }
  };
  const playloop = (loop = 2) => {
    voicebox.schedule(
      bars.slice(bid, bidEnd).reduce(
        (acc, bar, bid) =>
          acc.concat(
            voices.reduce(
              (acc, voice, vid) =>
                acc.concat(
                  bar[vid].notes.map((note) => ({
                    time: tbeats * bid + note.time,
                    spn: note.name,
                    bid,
                    vid,
                    touch: note.touch,
                    loop,
                    cb,
                  }))
                ),
              []
            )
          ),
        []
      )
    );
  };
  playloop(2);
}
