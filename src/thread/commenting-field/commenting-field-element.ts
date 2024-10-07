import type { AttachmentModel } from '../../options/models.ts';
import { ButtonElement } from '../basic/button-element.ts';
import type { CommentsOptions } from '../../options';
import { TagFactory } from '../basic/tag-factory.ts';
import { areArraysEqual, isStringEmpty } from '../../common/util.ts';
import { TextareaElement } from './textarea-element.ts';
import { findSiblingsBySelector } from '../../common/html-util.ts';
import { CommentViewModel } from '../../view-model/comment-view-model.ts';

export class CommentingFieldElement extends HTMLElement {
    #options!: Required<CommentsOptions>;
    #tagFactory!: TagFactory;
    #commentViewModel!: CommentViewModel;

    static create(
        options: Partial<Pick<CommentingFieldElement, 'parentId' | 'existingCommentId' | 'isMain' | 'onClosed'>>
    ): CommentingFieldElement {
        const commentingFieldEl: CommentingFieldElement = document.createElement(
            'ax-commenting-field'
        ) as CommentingFieldElement;
        Object.assign(commentingFieldEl, options);
        return commentingFieldEl;
    }

    #toggleSaveButton(): void {
        const textarea: TextareaElement = this.querySelector('.textarea')!;
        const saveButton: ButtonElement = findSiblingsBySelector<ButtonElement>(textarea, '.control-row').querySelector(
            '.save'
        )!;

        const content = textarea.getTextareaContent();
        const attachments = this.getAttachments();
        let enabled: boolean;

        const commentModel = this.#commentViewModel.getComment(textarea.existingCommentId!);
        if (commentModel) {
            const contentChanged = content !== commentModel.content;
            const parentFromModel: string = commentModel.parentId || '';

            const parentFromTextarea: string | null = textarea.parentId;
            const parentChanged: boolean = !isStringEmpty(parentFromTextarea) && parentFromTextarea !== parentFromModel;

            let attachmentsChanged = false;
            if (this.#options.enableAttachments) {
                const savedAttachmentIds = (commentModel.attachments ?? []).map((attachment: any) => attachment.id);
                const currentAttachmentIds = attachments.map((attachment: any) => attachment.id);
                attachmentsChanged = !areArraysEqual(savedAttachmentIds, currentAttachmentIds);
            }

            enabled = contentChanged || parentChanged || attachmentsChanged;
        } else {
            enabled = !!content.length || !!attachments.length;
        }

        saveButton.classList.toggle('enabled', enabled);
    }

    getAttachments<F extends File | string>(): AttachmentModel<F>[] {
        const attachmentElements: NodeListOf<HTMLAnchorElement> = this.querySelectorAll('.attachments .attachment');
        const attachments: AttachmentModel<F>[] = [];
        for (let i = 0; i < attachmentElements.length; i++) {
            attachments[i] = (attachmentElements[i] as any).attachmentTagData;
        }

        return attachments;
    }

    preSaveAttachments(files: ArrayLike<File> & Iterable<File>): void {
        const uploadButton: ButtonElement = this.querySelector('.control-row .upload')!;
        const attachmentsContainer: HTMLElement = this.querySelector('.control-row .attachments')!;

        if (!files.length) {
            return;
        }

        let attachments: AttachmentModel<File>[] = [...files].map((file) => ({
            id: 'tempId_' + file.name,
            mimeType: file.type,
            file: file,
        }));

        const existingAttachments: AttachmentModel<File>[] = this.getAttachments();
        attachments = attachments.filter((attachment) => {
            let duplicate = false;

            // Check if the attachment name and size matches with an already added attachment
            for (let i = 0; i < existingAttachments.length; i++) {
                const existingAttachment = existingAttachments[i];
                if (
                    attachment.file.name === existingAttachment.file.name &&
                    attachment.file.size === existingAttachment.file.size
                ) {
                    duplicate = true;
                    break;
                }
            }

            return !duplicate;
        });

        if (this.classList.contains('main')) {
            this.querySelector('.textarea')!.dispatchEvent(new MouseEvent('click'));
        }

        uploadButton.setButtonState(false, true);

        this.#options.validateAttachments(attachments, (validatedAttachments) => {
            if (validatedAttachments.length) {
                // Create attachment tags
                validatedAttachments.forEach((attachment) => {
                    const attachmentTag: HTMLAnchorElement = this.#tagFactory.createAttachmentTagElement(
                        attachment,
                        () => {
                            this.#toggleSaveButton();
                        }
                    );
                    attachmentsContainer.append(attachmentTag);
                });

                this.#toggleSaveButton();
            }

            uploadButton.setButtonState(true, false);
        });

        uploadButton.querySelector('input')!.value = '';
    }
}
