/* @flow */

import { UPDATE_COMMENTS, UPDATE_SUGGESTIONS } from './actions';
import type { UpdateCommentsAction, UpdateSuggestionsAction } from './actions';


type Action =
    | UpdateCommentsAction
    | UpdateSuggestionsAction
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
};


function suggestion(entry: Object): Suggestion {
    return {
        id: entry.id,
        original: entry.entity.string,
        translation: entry.string,
        date: entry.date,
        user: entry.user.firstName,
        entity: entry.entity,
        pluralForm: entry.pluralForm,
    };
}


function comment(entry: Object): Comment {
    return {
        author: entry.user.username,
        comment: entry.comment,
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
        case '@@router/LOCATION_CHANGE':
            return {
                ...state,
                comments: [],
            };
        default:
            return state;
    }
}
