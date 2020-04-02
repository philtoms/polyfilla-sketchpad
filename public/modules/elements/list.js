import player from '../melody/player.js';
import client from '../utils/client.js';

const { define, useContext } = hookedElements;

export default context => {
  const { playback } = player(context);
  const { get } = client(context);

  define('#list', {
    onclick(e) {
      if (e.target.className === 'events') {
        context.value.title = e.target.previousSibling.innerText;
        get().then(data => {
          this.voicebox.init(data.score);
          context.value.data = data.events.filter(Boolean);
          playback(0, 0);
        });
      }
    },
    render() {
      const { voicebox } = useContext(context);
      this.voicebox = voicebox;
    }
  });
};
