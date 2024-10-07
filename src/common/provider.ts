import type { CommentsOptions } from '../options';
import { CommentViewModel } from '../view-model/comment-view-model.ts';

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

export class CommentViewModelProvider {
    private static readonly COMMENTS: WeakMap<HTMLElement, CommentViewModel> = new WeakMap();

    static set(container: HTMLElement): CommentViewModel {
        if (this.COMMENTS.has(container)) {
            console.warn('[CommentsProvider] Comments reference cannot be changed after initialization');
        } else {
            this.COMMENTS.set(container, new CommentViewModel());
        }
        return CommentViewModelProvider.get(container);
    }

    static get(container: HTMLElement): CommentViewModel {
        return this.COMMENTS.get(container)!;
    }
}
