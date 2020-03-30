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
      playback(startpoint, 0);
    },
    render() {
      const { note, voicebox } = useContext(context);
      this.voicebox = voicebox;
      if (note && note !== this.note) {
        this.note = note;
        const { channel, name, idx } = note;
        const elChannel = this.channels[channel];
        const noteId = `${channel}-${idx}`;
        const event = `<span id="${noteId}" class="event"> ${name} </span>`;
        let node = document.getElementById(noteId);
        while (node) {
          const next = node.nextSibling;
          node.parentNode.removeChild(node);
          node = next;
        }
        elChannel.innerHTML += event;
        const elNote = document.getElementById(noteId);
        this.element.scrollLeft = Math.max(0, elNote.offsetLeft - 375);
        elChannel.style.width = `${elChannel.clientWidth +
          elNote.clientWidth +
          30}px`;
      }
    }
  });
};
