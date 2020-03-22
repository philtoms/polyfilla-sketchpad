import { createContext } from 'https://unpkg.com/hooked-elements?module';

import log from './modules/utils/log.js';
import elements from './modules/elements.js';

function startup() {
  const context = createContext({
    state: 'intro'
  });
  elements(context);
}

document.addEventListener('DOMContentLoaded', startup);
