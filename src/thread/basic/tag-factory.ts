import type { AttachmentModel } from '../../options/models.ts';
import { ButtonElement } from './button-element.ts';
import type { CommentsOptions } from '../../options';
import { OptionsProvider } from '../../common/provider.ts';

export class TagFactory {
    readonly #options: Required<CommentsOptions>;

    constructor(container: HTMLElement) {
        this.#options = OptionsProvider.get(container)!;
    }

    createAttachmentTagElement(attachment: AttachmentModel, onDeleted?: () => void): HTMLAnchorElement {
        const attachmentTag: HTMLAnchorElement = document.createElement('a');
        attachmentTag.classList.add('tag', 'attachment');
        attachmentTag.target = '_blank';

        attachmentTag.setAttribute('id', attachment.id);
        (attachmentTag as any).attachmentTagData = attachment;

        let fileName: string;

        if (attachment.file instanceof File) {
            fileName = attachment.file.name;
        } else {
            const parts: string[] = attachment.file.split('/');
            fileName = parts[parts.length - 1];
            fileName = fileName.split('?')[0];
            fileName = decodeURIComponent(fileName);
        }

        const attachmentIcon: HTMLElement = document.createElement('i');
        attachmentIcon.classList.add('fa', 'fa-paperclip');
        if (this.#options.attachmentIconURL.length) {
            attachmentIcon.style.backgroundImage = `url("${this.#options.attachmentIconURL}")`;
            attachmentIcon.classList.add('image');
        }

        attachmentTag.append(attachmentIcon, fileName);

        if (onDeleted) {
            attachmentTag.classList.add('deletable');

            const closeButton: ButtonElement = ButtonElement.createCloseButton(
                {
                    inline: false,
                    onclick: (e) => {
                        (e.currentTarget as HTMLElement).parentElement!.remove();
                        onDeleted();
                    },
                },
                'delete'
            );
            attachmentTag.append(closeButton);
        } else {
            attachmentTag.setAttribute('href', attachment.file as string);
        }

        return attachmentTag;
    }
}
