/* @flow */

import * as React from 'react';
import TimeAgo from 'react-timeago';

import './ReviewList.css';


export default class ReviewList extends React.Component {
    openSuggestion = (id: string) => {
        return () => {
            this.props.openSuggestion(id);
        };
    }

    render() {
        const { suggestions } = this.props;

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
