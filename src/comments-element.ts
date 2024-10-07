import type { CommentsOptions } from './options';
import { defineCustomElement } from './common/custom-element.ts';
import { CommentViewModel } from './view-model/comment-view-model.ts';
import { ElementEventHandler } from './element-event-handler.ts';
import { CommentSorter } from './view-model/comment-sorter.ts';
import { SortKey } from './options/misc.ts';
import { SpinnerFactory } from './thread/basic/spinner-factory.ts';
import { STYLE_SHEET } from './css/stylesheet.ts';
import { isMobileBrowser } from './common/util.ts';
import { CommentViewModelProvider, OptionsProvider } from './common/provider.ts';

export class CommentsElement extends HTMLElement {
    private container!: HTMLElement;
    readonly #options: Required<CommentsOptions> = {} as Required<CommentsOptions>;

    #commentViewModel!: CommentViewModel;
    #elementEventHandler!: ElementEventHandler;

    #commentSorter!: CommentSorter;
    #spinnerFactory!: SpinnerFactory;

    #currentSortKey!: SortKey;
    #connected: boolean = false;
    #dataFetched: boolean = false;

    constructor() {
        super();
        this.#initShadowDom(this.attachShadow({ mode: 'open' }));
    }

    #initShadowDom(shadowRoot: ShadowRoot): void {
        shadowRoot.innerHTML = `
            <section id="comments-container">
            </section>
        `;
        shadowRoot.adoptedStyleSheets = [STYLE_SHEET];
        this.container = shadowRoot.querySelector<HTMLElement>('#comments-container')!;
    }

    #init(): void {
        this.#initServices();
        this.#initElement();
        this.#initEmitterListeners();
    }

    #initServices(): void {
        OptionsProvider.set(this.container, this.#options);
        this.#commentViewModel = CommentViewModelProvider.set(this.container);
        this.#elementEventHandler = new CommentsElementEventHandler(this.container);
        this.#commentSorter = ServiceProvider.get(this.container, CommentSorter);
        this.#spinnerFactory = ServiceProvider.get(this.container, SpinnerFactory);
    }

    #initElement(): void {
        if (isMobileBrowser()) {
            this.container.classList.add('mobile');
        }

        // Read-only mode
        if (this.#options.readOnly) {
            this.container.classList.add('read-only');
        }

        // Set initial sort key
        this.#currentSortKey = this.#options.defaultNavigationSortKey;

        // Create user CSS declarations
        let allStyles: CSSStyleSheet[] = [createDynamicStylesheet(this.#options)];
        if (this.#options.styles) {
            allStyles = allStyles.concat(this.#options.styles);
        }
        this.shadowRoot!.adoptedStyleSheets = allStyles;

        // Fetching data and rendering
        this.#fetchDataAndRender();
    }

    #initEmitterListeners(): void {
        this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_ADDED, (commentId) => {
            const comment: CommentModelEnriched = this.#commentViewModel.getComment(commentId)!;
            if (!comment.parentId) this.#createThread(comment);
            this.#getNavigation().commentCount += 1;
        });
        this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_DELETED, (commentId) => {
            this.#getNavigation().commentCount -= 1;
        });
    }
}

defineCustomElement(CommentsElement, 'ithub-comments');
