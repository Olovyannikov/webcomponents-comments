import { defineCustomElement } from '../../common/custom-element.ts';
import { noop } from '../../common/util.ts';
import { CommentsOptions } from '../../options';

export class ButtonElement extends HTMLButtonElement {
    onInitialized: (button: ButtonElement) => void = noop;

    set inline(value: boolean) {
        if (value) this.classList.add('inline-button');
    }

    #options!: Required<CommentsOptions>;

    setButtonState(enabled: boolean, loading: boolean): void {
        this.classList.toggle('enabled', enabled);

        this.querySelector<HTMLElement>('.spinner')!.classList.toggle('hidden', !loading);
    }

    static createCloseButton(options: Pick<ButtonElement, 'inline' | 'onclick'>, className?: string): ButtonElement {
        const closeButton: ButtonElement = document.createElement('button', { is: 'ax-button' }) as ButtonElement;
        Object.assign(closeButton, options);
        closeButton.classList.add(className || 'close');

        closeButton.onInitialized = (button) => {
            const icon: HTMLElement = document.createElement('i');
            icon.classList.add('fa', 'fa-times');
            if (button.#options.closeIconURL.length) {
                icon.style.backgroundImage = `url("${button.#options.closeIconURL}")`;
                icon.classList.add('image');
            }

            button.append(icon);
        };

        return closeButton;
    }
}

defineCustomElement(ButtonElement, 'ithub-button', { extends: 'button' });
