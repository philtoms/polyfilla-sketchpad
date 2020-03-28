import { createContext } from 'https://unpkg.com/hooked-elements?module';

import log from './modules/utils/log.js';
import intro from './modules/elements/intro.js';
import compose from './modules/elements/compose.js';
import voicebox from './modules/voicebox/index.js';

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

const startup = () => {
  const context = createContext({
    state: 'intro',
    voicebox: voicebox().create(0, samples)
  });
  intro(context);
  compose(context);
};

document.addEventListener('DOMContentLoaded', startup);
