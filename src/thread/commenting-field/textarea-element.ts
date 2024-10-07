import { defineCustomElement } from '../../common/custom-element.ts';
import { normalizeSpaces } from '../../common/util.ts';

export class TextareaElement extends HTMLTextAreaElement {
    parentId: string | null = null;
    existingCommentId: string | null = null;

    getTextareaContent(): string {
        return normalizeSpaces(this.value ?? '');
    }
}

defineCustomElement(TextareaElement, 'ithub-textarea', { extends: 'textarea' });
