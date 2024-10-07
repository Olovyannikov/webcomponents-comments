import { defineCustomElement } from '../../common/custom-element.ts';
import { CommentsOptions } from '../../options';

export class NavigationElement extends HTMLElement {
    get commentCount(): number {
        return this.#commentCount;
    }

    set commentCount(count: number) {
        this.#commentCount = count;
        this.#setCommentsHeaderText(count);
    }

    #commentCount: number = 0;
    #options!: Required<CommentsOptions>;

    static create(options: Pick<NavigationElement, 'sortKey' | 'onSortKeyChanged'>): NavigationElement {
        const navigationEl: NavigationElement = document.createElement('ax-navigation') as NavigationElement;
        Object.assign(navigationEl, options);
        return navigationEl;
    }

    #setCommentsHeaderText(
        commentCount: number,
        commentHeader: HTMLSpanElement = this.querySelector<HTMLElement>('.comments-header')!
    ) {
        let text: string = this.#options.commentsHeaderText;
        text = text.replace('__commentCount__', `${commentCount}`);
        commentHeader.textContent = text;
    }
}

defineCustomElement(NavigationElement, 'ithub-navigation');
