import React from 'react';
import { Localized } from 'fluent-react';

import 'modules/history/components/History.css';

import Translation from './Translation';


/**
 * Shows all existing translations of an entity.
 *
 * For each translation, show its author, date and status (approved, rejected).
 */
export default class History extends React.Component {
    renderNoResults() {
        return <section className="history">
            <Localized id="history-history-no-translations">
                <p>No translations available.</p>
            </Localized>
        </section>
    }

    render() {
        const { history } = this.props;

        if (!history.translations.length) {
            if (history.fetching) {
                return null;
            }

            return this.renderNoResults();
        }

        return <section className="history">
            <ul>
                { history.translations.map((translation, key) => {
                    return <Translation
                        translation={ translation }
                        key={ key }
                    />;
                }) }
            </ul>
        </section>;
    }
}
