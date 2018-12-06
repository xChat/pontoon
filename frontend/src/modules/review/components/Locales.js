import React from 'react';
import { Localized } from 'fluent-react';

import 'modules/otherlocales/components/Locales.css';


/**
 * Shows all existing translations of an entity.
 *
 * For each translation, show its author, date and status (approved, rejected).
 */
export default class Locales extends React.Component {
    renderNoResults() {
        return <section className="otherlocales">
            <Localized id="history-history-no-translations">
                <p>No translations available.</p>
            </Localized>
        </section>
    }

    render() {
        const { otherlocales } = this.props;

        if (!otherlocales || otherlocales.fetching) {
            return null;
        }

        if (!otherlocales.translations.length) {
            return this.renderNoResults();
        }

        return <section className="otherlocales">
            <ul>
                { otherlocales.translations.map((translation, key) => {
                    return <li key={ key }>
                        <header>
                            { translation.locale }
                            <span>{ translation.code }</span>
                        </header>
                        <p
                            lang={ translation.code }
                            dir={ translation.direction }
                            script={ translation.script }
                        >
                            { translation.translation }
                        </p>
                    </li>;
                }) }
            </ul>
        </section>;
    }
}
