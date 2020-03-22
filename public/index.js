import { createContext } from 'https://unpkg.com/hooked-elements?module';

import log from './modules/utils/log.js';
import intro from './modules/elements/intro.js';
import compose from './modules/elements/compose.js';

function startup() {
  const context = createContext({
    state: 'intro'
  });
  intro(context);
  compose(context);
}

document.addEventListener('DOMContentLoaded', startup);
