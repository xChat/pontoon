/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TimeAgo from 'react-timeago';

import './ReviewPage.css';

import * as navigation from 'core/navigation';
import * as history from 'modules/history';
import * as otherlocales from 'modules/otherlocales';

import History from './History';
import Locales from './Locales';
import { actions, NAME } from '..';


class Navigation extends React.Component {
    render() {
        const { locale, project, suggestions, suggestion } = this.props;

        const suggestionIndex = suggestions.indexOf(suggestion);

        let prevIndex = suggestionIndex - 1;
        if (prevIndex === -1) {
            prevIndex = suggestions.length - 1;
        }
        const prev = suggestions[prevIndex];

        let nextIndex = (suggestionIndex + 1) % suggestions.length;
        const next = suggestions[nextIndex];

        return <nav>
            <ul>
                <li>
                    <Link to={ `/${locale}/${project}/review/${prev.id}/` }>
                        <i className="fa fa-caret-left" />
                        Previous
                    </Link>
                </li>
                <li>
                    <Link to={ `/${locale}/${project}/review/` }>
                        <i className="fa fa-align-justify" />
                        List
                    </Link>
                </li>
                <li>
                    <Link to={ `/${locale}/${project}/review/${next.id}/` }>
                        Next
                        <i className="fa fa-caret-right" />
                    </Link>
                </li>
            </ul>
        </nav>;
    }
}


class Actions extends React.Component {
    render() {
        const { approve, reject, comment } = this.props;

        return <div className="review-actions">
            <button className="approve" onClick={ approve }>Approve</button>
            <button className="reject" onClick={ reject }>Reject</button>
            <button className="comment" onClick={ comment }>Comment</button>
        </div>;
    }
}


class Comments extends React.Component {
    handleChange = (event: SyntheticInputEvent<HTMLTextAreaElement>) => {
        this.props.updateComment(event.currentTarget.value);
    }

    renderComments() {
        const { comments } = this.props;

        if (!comments) {
            return null;
        }

        return <ol>
            { comments.map((comment, i) => {
                const avatarUrl = `https://ui-avatars.com/api/?size=28&rounded=true&name=${comment.author}`;

                return <li key={ i }>
                    <img src={ avatarUrl } alt="" />
                    <header>
                        <strong>{ comment.author }</strong>
                        <TimeAgo date={ comment.date } />
                    </header>
                    <p>{ comment.comment }</p>
                </li>;
            })}
        </ol>;
    }

    render() {
        return <section className="review-comments">
            { this.renderComments() }
            <div>
                <textarea
                    placeholder="Reply..."
                    onChange={ this.handleChange }
                    value={ this.props.comment }
                />
                { this.props.controls }
            </div>
        </section>;
    }
}


class Panels extends React.Component {
    render() {
        const {
            comment,
            comments,
            controls,
            history,
            otherlocales,
            updateComment,
        } = this.props;

        return <Tabs>
            <TabList>
                <Tab>
                    Comments
                </Tab>
                <Tab>
                    History
                </Tab>
                <Tab>
                    Machinery
                </Tab>
                <Tab>
                    Locales
                </Tab>
                <Tab>
                    Context
                </Tab>
            </TabList>

            <TabPanel>
                <Comments
                    comment={ comment }
                    comments={ comments }
                    controls={ controls }
                    updateComment={ updateComment }
                />
            </TabPanel>
            <TabPanel>
                <History history={ history } />
            </TabPanel>
            <TabPanel>
                <p className="not-yet">
                    Let there be <strong>Machinery</strong> here at some point.
                </p>
            </TabPanel>
            <TabPanel>
                <Locales otherlocales={ otherlocales } />
            </TabPanel>
            <TabPanel>
                <p className="not-yet">
                    Let there be <strong>Context</strong> here at some point.
                </p>
            </TabPanel>
        </Tabs>;
    }
}


export class ReviewPageBase extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            comment: ''
        };
    }

    componentDidMount() {
        const { match } = this.props;

        this.props.dispatch(actions.get(match.params.locale, match.params.project));
    }

    componentDidUpdate(prevProps) {
        const { match, review } = this.props;

        if (
            prevProps.review.suggestions !== review.suggestions ||
            prevProps.match.params.translation !== match.params.translation
        ) {
            const findSuggestion = elt => elt.id === match.params.translation;
            const suggestion = review.suggestions.find(findSuggestion);

            if (!suggestion) {
                return;
            }

            // Get comments
            this.props.dispatch(actions.getComments(
                suggestion.id,
            ));

            // Get history
            this.props.dispatch(history.actions.get(
                suggestion.entity.id,
                match.params.locale,
                suggestion.pluralForm || -1
            ));

            // Get locales
            this.props.dispatch(otherlocales.actions.get(
                suggestion.entity.id,
                match.params.locale,
                suggestion.pluralForm || -1
            ));
        }
    }

    updateTranslationStatus = (translation, change) => {
        const { match, review, parameters } = this.props;

        const findSuggestion = elt => elt.id === match.params.translation;
        const suggestion = review.suggestions.find(findSuggestion);

        const suggestionIndex = review.suggestions.indexOf(suggestion);
        const nextIndex = (suggestionIndex + 1) % review.suggestions.length;
        const next = review.suggestions[nextIndex];

        this.props.dispatch(history.actions.updateStatus(
            change,
            suggestion.entity.id,
            match.params.locale,
            null,
            suggestion.pluralForm || -1,
            suggestion.id,
        ));
        this.props.dispatch(navigation.actions.openReview(parameters, next.id));
    }

    updateComment = (comment) => {
        this.setState({ comment });
    }

    approve = () => {
        this.addComment();
        this.updateTranslationStatus(this.props.translation, 'approve');
    }

    reject = () => {
        this.addComment();
        this.updateTranslationStatus(this.props.translation, 'reject');
    }

    addComment = () => {
        if (!this.state.comment) {
            return;
        }

        const { match } = this.props;
        this.props.dispatch(
            actions.addComment(
                match.params.translation,
                this.state.comment,
            )
        );
        this.setState({ comment: '' });
    }

    render() {
        const { history, match, otherlocales, review } = this.props;

        const findSuggestion = elt => elt.id === match.params.translation;
        const suggestion = review.suggestions.find(findSuggestion);

        if (!suggestion) {
            return null;
        }

        const controls = <Actions
            approve={ this.approve }
            reject={ this.reject }
            comment={ this.addComment }
        />;

        return <div className="review-page">
            <header>
                <h1>Unreviewed Suggestions</h1>
                <h2>{ `${match.params.project} ⋅ ${match.params.locale}` }</h2>
            </header>
            <Navigation
                locale={ match.params.locale }
                project={ match.params.project }
                suggestions={ review.suggestions }
                suggestion={ suggestion }
            />
            { controls }
            <section className="review-content">
                <p className="original">{ suggestion.original }</p>
                <p className="active"></p>
                <p className="suggestion">{ suggestion.translation }</p>
            </section>
            <section className="review-metadata">
                <header>
                    <p>{ suggestion.user }</p>
                    <TimeAgo date={ suggestion.date } />
                </header>
                <p>Comment: that's a very good poem</p>
                <p>File: ui/hidden/poem.po</p>
            </section>
            <section className="review-panels">
                <Panels
                    history={ history }
                    otherlocales={ otherlocales }
                    comments={ review.comments }
                    comment={ this.state.comment }
                    controls={ controls }
                    updateComment={ this.updateComment }
                />
            </section>
            <Navigation
                locale={ match.params.locale }
                project={ match.params.project }
                suggestions={ review.suggestions }
                suggestion={ suggestion }
            />
        </div>;
    }
}


const mapStateToProps = (state) => {
    return {
        parameters: navigation.selectors.getNavigation(state),
        review: state[NAME],
        history: state[history.NAME],
        otherlocales: state[otherlocales.NAME],
    };
};

export default connect(mapStateToProps)(ReviewPageBase);
