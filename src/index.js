import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AppCompositionRoot } from './services/pure-di';

// Only used in development environment, it does not affect production build
import { HardcodedDopplerLegacyClient } from './services/doppler-legacy-client.doubles';

// TODO: this hardcoded data will depend by the app language
const locale = navigator.language.toLowerCase().split(/[_-]+/)[0] || 'en';

// Only used in development environment, it does not affect production build
const appCompositionRoot =
  process.env.NODE_ENV === 'development'
    ? new AppCompositionRoot({
        dopplerLegacyClient: new HardcodedDopplerLegacyClient(),
      })
    : new AppCompositionRoot();

ReactDOM.render(
  <App locale={locale} dependencies={appCompositionRoot} />,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
