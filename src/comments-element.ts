import {CommentsOptions} from "./options";
import {defineCustomElement} from "./common/custom-element.ts";
import {CommentViewModel} from "./view-model/comment-view-model.ts";
import {ElementEventHandler} from "./element-event-handler.ts";
import {CommentSorter} from "./view-model/comment-sorter.ts";
import {SortKey} from "./options/misc.ts";
import {SpinnerFactory} from "./thread/basic/spinner-factory.ts";

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
}

defineCustomElement(CommentsElement, 'ithub-comments');