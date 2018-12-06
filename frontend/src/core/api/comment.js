/* @flow */

import APIBase from './base';


export default class CommentAPI extends APIBase {
    async getAll(translation: string) {
        const query = `{
            translation(
                id: "${translation}"
            ) {
                comments {
                    comment
                    date
                    user {
                        username
                    }
                }
            }
        }`;
        const payload = new URLSearchParams();
        payload.append('query', query);

        const headers = new Headers();
        headers.append('X-Requested-With', 'XMLHttpRequest');

        return await this.fetch('/graphql/', 'GET', payload, headers);
    }

    async add(translation: string, comment: string) {
        const csrfToken = this.getCSRFToken();

        const payload = new URLSearchParams();
        payload.append('translation', translation);
        payload.append('comment', comment);
        payload.append('csrfmiddlewaretoken', csrfToken);

        const headers = new Headers();
        headers.append('X-Requested-With', 'XMLHttpRequest');
        headers.append('X-CSRFToken', csrfToken);

        return await this.fetch('/add-comment/', 'POST', payload, headers);
    }
}
