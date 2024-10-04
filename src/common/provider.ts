import {CommentsOptions} from "../options";

export class OptionsProvider {
    private static readonly OPTIONS: WeakMap<HTMLElement, Required<CommentsOptions>> = new WeakMap();

    static set(container: HTMLElement, options: Required<CommentsOptions>): void {
        if (this.OPTIONS.has(container)) {
            console.warn('[OptionsProvider] Options reference cannot be changed after initialization');
        }
        this.OPTIONS.set(container, options);
    }

    static get(container: HTMLElement): Required<CommentsOptions> {
        return this.OPTIONS.get(container)!;
    }
}