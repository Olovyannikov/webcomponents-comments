import type {CommentsOptions} from "./options";
import {defineCustomElement} from "./common/custom-element.ts";
import {CommentViewModel} from "./view-model/comment-view-model.ts";
import {ElementEventHandler} from "./element-event-handler.ts";
import {CommentSorter} from "./view-model/comment-sorter.ts";
import {SortKey} from "./options/misc.ts";
import {SpinnerFactory} from "./thread/basic/spinner-factory.ts";
import {STYLE_SHEET} from "./css/stylesheet.ts";

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
        this.#initShadowDom(this.attachShadow({mode: 'open'}));
    }

    #initShadowDom(shadowRoot: ShadowRoot): void {
        shadowRoot.innerHTML = `
            <section id="comments-container">
            </section>
        `;
        shadowRoot.adoptedStyleSheets = [STYLE_SHEET];
        this.container = shadowRoot.querySelector<HTMLElement>('#comments-container')!;
    }
}

defineCustomElement(CommentsElement, 'ithub-comments');