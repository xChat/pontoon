/* @flow */

import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
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
        const { locale, project, prev, next } = this.props;

        return <nav>
            <ul>
                { !prev ? null :
                <li>
                    <Link to={ `/${locale}/${project}/review/${prev.id}/` }>
                        <i className="fa fa-caret-left" />
                        Previous
                    </Link>
                </li> }
                <li>
                    <Link to={ `/${locale}/${project}/review/` }>
                        <i className="fa fa-align-justify" />
                        List
                    </Link>
                </li>
                { !next ? null :
                <li>
                    <Link to={ `/${locale}/${project}/review/${next.id}/` }>
                        Next
                        <i className="fa fa-caret-right" />
                    </Link>
                </li> }
            </ul>
        </nav>;
    }
}


class Actions extends React.Component {
    render() {
        const { approve, edit, reject, comment } = this.props;

        return <div className="review-actions">
            <button className="edit" onClick={ edit }>Edit</button>
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
        this.props.dispatch(actions.getTranslation(match.params.translation));
    }

    componentDidUpdate(prevProps) {
        const { match, review } = this.props;

        if (prevProps.match.params.translation !== match.params.translation) {
            this.props.dispatch(history.actions.reset());
            this.props.dispatch(otherlocales.actions.reset());
            this.props.dispatch(actions.reset());

            this.props.dispatch(actions.getTranslation(match.params.translation));
        }

        if (prevProps.review.translation !== review.translation) {
            const suggestion = review.translation;
            if (!suggestion) {
                return;
            }

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

        const suggestion = review.translation;
        let next = null;

        if (review.suggestions.length) {
            const findSuggestion = elt => elt.id === match.params.translation;

            const suggestionIndex = review.suggestions.findIndex(findSuggestion);
            const nextIndex = (suggestionIndex + 1) % review.suggestions.length;
            next = review.suggestions[nextIndex];
        }

        this.props.dispatch(history.actions.updateStatus(
            change,
            suggestion.entity.id,
            match.params.locale,
            null,
            suggestion.pluralForm || -1,
            suggestion.id,
        ));

        if (next) {
            this.props.dispatch(navigation.actions.openReview(parameters, next.id));
        }
        else {
            this.props.dispatch(navigation.actions.openReviewList(parameters));
        }
    }

    updateComment = (comment) => {
        this.setState({ comment });
    }

    edit = () => {
        const { dispatch, match, review } = this.props;

        if (!review.translation) {
            return;
        }

        const resource = review.translation.entity.resource.path;
        dispatch(push(`/${match.params.locale}/${match.params.project}/${resource}/?string=${review.translation.entity.id}`));
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
        const { match, review } = this.props;

        if (!this.state.comment || !review.translation) {
            return;
        }

        this.props.dispatch(
            actions.addComment(
                review.translation.entity.id,
                match.params.translation,
                this.state.comment,
            )
        );
        this.setState({ comment: '' });
    }

    render() {
        const { history, match, otherlocales, review } = this.props;

        if (!review.translation || !review.suggestions.length) {
            return <div className="review-page">
                <header>
                    <h1>Unreviewed Suggestions</h1>
                    <h2>
                        { `${match.params.project} ⋅ ${match.params.locale}` }
                        <Link to={ `/${match.params.locale}/${match.params.project}/all/` }>Translate</Link>
                    </h2>
                </header>
            </div>;
        }

        const suggestion = review.translation;

        const findSuggestion = elt => elt.id === match.params.translation;
        const suggestionIndex = review.suggestions.findIndex(findSuggestion);

        let prev = null;
        let next = null;

        if (suggestionIndex > -1) {
            let prevIndex = suggestionIndex - 1;
            if (prevIndex === -1) {
                prevIndex = review.suggestions.length - 1;
            }
            prev = review.suggestions[prevIndex];

            let nextIndex = (suggestionIndex + 1) % review.suggestions.length;
            next = review.suggestions[nextIndex];
        }

        const controls = <Actions
            approve={ this.approve }
            edit={ this.edit }
            reject={ this.reject }
            comment={ this.addComment }
        />;

        let activeTranslation = null;
        if (!suggestion.active && history.translations.length) {
            activeTranslation = history.translations.find(t => t.active);
        }

        return <div className="review-page">
            <header>
                <h1>Unreviewed Suggestions</h1>
                <h2>
                    { `${match.params.project} ⋅ ${match.params.locale}` }
                    <Link to={ `/${match.params.locale}/${match.params.project}/all/` }>Translate</Link>
                </h2>
            </header>
            <Navigation
                locale={ match.params.locale }
                project={ match.params.project }
                next={ next }
                prev={ prev }
            />
            { controls }
            <section className="review-content">
                <p className="original">
                    { suggestion.entity.string }
                    <span className="helper">Original string</span>
                </p>
                { !activeTranslation ? null :
                    <p className="active">
                        { activeTranslation.string }
                        <span className="helper">Currently active translation</span>
                    </p>
                }
                <p className="suggestion">
                    { suggestion.string }
                    <span className="helper">Proposed translation</span>
                </p>
            </section>
            <section className="review-metadata">
                <header>
                    <p>{ suggestion.user ? suggestion.user.firstName : 'IMPORTED' }</p>
                    <TimeAgo date={ suggestion.date } />
                </header>
                <p>{ `Comment: ${suggestion.entity.comment}` }</p>
                <p>
                    <span>File: </span>
                    <Link to={ `/${match.params.locale}/${match.params.project}/${suggestion.entity.resource.path}/` }>
                        { suggestion.entity.resource.path }
                    </Link>
                </p>
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
                next={ next }
                prev={ prev }
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
