/* @flow */

import * as React from 'react';
import TimeAgo from 'react-timeago';

import './ReviewList.css';

import EntitiesLoader from 'modules/entitieslist/components/EntitiesLoader';


export default class ReviewList extends React.Component {
    openSuggestion = (id: string) => {
        return () => {
            this.props.openSuggestion(id);
        };
    }

    render() {
        const { suggestions } = this.props;

        if (!suggestions.length) {
            return <div className="review-list">
                <EntitiesLoader />
            </div>;
        }

        return <ul className="review-list">
            { suggestions.map((suggestion, i) => {
                return <li key={ i } onClick={ this.openSuggestion(suggestion.id) }>
                    <span><TimeAgo date={ suggestion.date } /></span>
                    <p className="original">{ suggestion.original }</p>
                    <span>{ suggestion.user }</span>
                    <p className="suggestion">{ suggestion.translation }</p>
                </li>;
            }) }
        </ul>;
    }
}
