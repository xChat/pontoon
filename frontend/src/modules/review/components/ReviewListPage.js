/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';

import './ReviewListPage.css';

import * as navigation from 'core/navigation';

import { actions, NAME } from '..';
import ReviewList from './ReviewList';


export class ReviewPageBase extends React.Component {
    componentDidMount() {
        const { parameters } = this.props;
        this.props.dispatch(actions.get(parameters.locale, parameters.project));
    }

    openSuggestion = (id: string) => {
        const { parameters } = this.props;

        this.props.dispatch(navigation.actions.openReview(parameters, id));
    }

    render() {
        const { parameters, review } = this.props;

        return <div className="review-page">
            <header>
                <h1>Unreviewed Suggestions</h1>
                <h2>{ `${parameters.project} ⋅ ${parameters.locale}` }</h2>
            </header>
            <section>
                <ReviewList
                    suggestions={ review.suggestions }
                    openSuggestion={ this.openSuggestion }
                />
            </section>
        </div>;
    }
}


const mapStateToProps = (state) => {
    return {
        parameters: navigation.selectors.getNavigation(state),
        review: state[NAME],
    };
};

export default connect(mapStateToProps)(ReviewPageBase);
