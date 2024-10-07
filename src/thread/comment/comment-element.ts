import { defineCustomElement } from '../../common/custom-element.ts';

export class CommentElement extends HTMLLIElement {}

defineCustomElement(CommentElement, 'ithub-comment', { extends: 'li' });
