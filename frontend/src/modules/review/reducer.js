/* @flow */

import { UPDATE_COMMENTS, UPDATE_SUGGESTIONS, UPDATE_TRANSLATION, RESET } from './actions';
import type { UpdateCommentsAction, UpdateSuggestionsAction, UpdateTranslationAction, ResetAction } from './actions';


type Action =
    | UpdateCommentsAction
    | UpdateSuggestionsAction
    | UpdateTranslationAction
    | ResetAction
;

type Comment = {|
    +author: string,
    +comment: string,
    +date: string,
|};

type Suggestion = {|
    +id: string,
    +original: string,
    +translation: string,
    +date: string,
    +user: string,
|};

export type ReviewListState = {|
    suggestions: Array<Suggestion>,
|};


const initial: ReviewListState = {
    suggestions: [],
    comments: [],
    translation: null,
};


function suggestion(entry: Object): Suggestion {
    return {
        id: entry.id,
        original: entry.entity.string,
        translation: entry.string,
        date: entry.date,
        user: entry.user ? entry.user.firstName: null,
        entity: entry.entity,
        pluralForm: entry.pluralForm,
    };
}


function comment(entry: Object): Comment {
    return {
        author: entry.author.username,
        comment: entry.content,
        date: entry.date,
    };
}


export default function reducer(
    state: ReviewListState = initial,
    action: Action,
): ReviewListState {
    switch (action.type) {
        case UPDATE_COMMENTS:
            return {
                ...state,
                comments: action.data.map(comment),
            };
        case UPDATE_SUGGESTIONS:
            return {
                ...state,
                suggestions: action.data.map(suggestion),
            };
        case UPDATE_TRANSLATION:
            return {
                ...state,
                translation: action.data,
            };
        case RESET:
            return {
                ...state,
                comments: [],
                translation: null,
            };
        default:
            return state;
    }
}
