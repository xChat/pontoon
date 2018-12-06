/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';

import './index.css';

import { AppLocalizationProvider } from 'core/l10n';
import { ReviewPage, ReviewListPage } from 'modules/review';

import history from './history';
import store from './store';
import App from './App';


ReactDOM.render(
    (
        <Provider store={ store }>
            <ConnectedRouter history={ history }>
                <AppLocalizationProvider>
                    <Switch>
                        <Route exact path="/:locale/:project/review/:translation" component={ ReviewPage } />
                        <Route exact path="/:locale/:project/review/" component={ ReviewListPage } />
                        <Route path="/" component={ App } />
                    </Switch>
                </AppLocalizationProvider>
            </ConnectedRouter>
        </Provider>
    ),
    // $FLOW_IGNORE: we know that the 'root' element exists.
    document.getElementById('root')
);
