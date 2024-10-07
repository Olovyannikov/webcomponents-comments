import { defineCustomElement } from '../common/custom-element.ts';
import { CommentElement } from './comment/comment-element.ts';

export class ThreadElement extends CommentElement {
    static create(options: Pick<ThreadElement, 'commentModel'>): ThreadElement {
        const threadEl: ThreadElement = document.createElement('li', { is: 'ax-thread' }) as ThreadElement;
        Object.assign(threadEl, options);
        return threadEl;
    }
}

defineCustomElement(ThreadElement, 'ithub-thread', { extends: 'li' });
