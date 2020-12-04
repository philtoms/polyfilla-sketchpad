export function playback(acc, { startPoint }) {
  const {
    play,
    data: {
      bars,
      autograph: { tempo, timeSignature, voices },
    },
    voicebox,
  } = acc;

  this.count = ((this.count || 0) % 3) + 1;

  const bid = Math.max(0, startPoint - 1);
  const bidEnd = startPoint ? bid + this.count + 2 : bid + this.count;
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

  voicebox.cancel();
  clearTimeout(this.nextHandle);
  this.nextHandle = setTimeout(() => {
    playloop(2);
    this.count = 0;
  }, 1000);
}
