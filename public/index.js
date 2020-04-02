import log from './modules/utils/log.js';
import intro from './modules/elements/intro.js';
import compose from './modules/elements/compose.js';
import list from './modules/elements/list.js';
import voicebox from './modules/voicebox/index.js';

const { createContext } = hookedElements;
const assets = 'https://cdn.glitch.com/ee40e085-f63b-4369-9a4a-dc97bb39e335%2F';

const samples = {
  A0: `${assets}A0.mp3`,
  A1: `${assets}A1.mp3`,
  A2: `${assets}A2.mp3`,
  A3: `${assets}A3.mp3`,
  A4: `${assets}A4.mp3`,
  A5: `${assets}A5.mp3`,
  A6: `${assets}A6.mp3`,
  A7: `${assets}A7.mp3`
};

const startup = () => {
  const context = createContext({
    state: 'intro',
    voicebox: voicebox().create(0, samples)
  });
  intro(context);
  compose(context);
  list(context);
};

document.addEventListener('DOMContentLoaded', startup);
