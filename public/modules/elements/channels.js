import player from '../melody/player.js';

const { define, render, useContext } = hookedElements;

export default context => {
  const { playback } = player(context);
  define('#channels', {
    init() {
      this.channels = Array.from(this.element.children).reduce(
        (acc, el, channel) => ({ ...acc, [channel]: el }),
        {}
      );
      render(this);
    },
    onclick(e) {
      e.preventDefault();
      const startpoint = e.target.id.split('-').pop();
      playback(parseInt(startpoint), 0);
    },
    render() {
      const { note, voicebox, data } = useContext(context);
      this.voicebox = voicebox;
      if (note && note !== this.note) {
        this.note = note;
        const { channel, name, idx } = note;
        const noteId = `${channel}-${idx}`;
        const event = `<span id="${noteId}" class="event"> ${name} </span>`;
        let node = document.getElementById(noteId);
        while (node) {
          const next = node.nextSibling;
          node.parentNode.removeChild(node);
          node = next;
        }
        this.channels[channel].innerHTML += event;
        const elNote = document.getElementById(noteId);
        this.element.scrollLeft = Math.max(0, elNote.offsetLeft - 375);
      }
      // todo apply all channels
      if (data && !this.channels[0].innerHTML) {
        const channel = 0;
        this.channels[channel].innerHTML = data.reduce((acc, data) => {
          const { name, idx } = data[channel];
          const noteId = `${channel}-${idx}`;
          return `${acc}<span id="${noteId}" class="event"> ${name} </span>`;
        }, '');
      }
    }
  });
};
