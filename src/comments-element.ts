import type { CommentsOptions } from './options';
import { defineCustomElement } from './common/custom-element.ts';
import { CommentViewModel, CommentViewModelEvent } from './view-model/comment-view-model.ts';
import { CommentsElementEventHandler, ElementEventHandler } from './element-event-handler.ts';
import { CommentSorter } from './view-model/comment-sorter.ts';
import { SortKey } from './options/misc.ts';
import { SpinnerFactory } from './thread/basic/spinner-factory.ts';
import { STYLE_SHEET } from './css/stylesheet.ts';
import { isMobileBrowser, isNil, noop } from './common/util.ts';
import { CommentViewModelProvider, OptionsProvider, ServiceProvider } from './common/provider.ts';
import { createDynamicStylesheet } from './css/dynamic-stylesheet-factory.ts';
import type { CommentModel } from './options/models.ts';
import type { CommentModelEnriched } from './view-model/comment-model-enriched.ts';
import { ThreadElement } from './thread/thread-element.ts';
import { NavigationElement } from './thread/basic/navigation-element.ts';
import { hideElement } from './common/html-util.ts';
import { CommentingFieldElement } from './thread/commenting-field/commenting-field-element.ts';
import { createElement } from './common/html-element-factory.ts';
import { EVENT_HANDLERS_MAP } from './events.ts';
import { getDefaultOptions } from './options/get-default-options-factory.ts';

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

    static create(options: Pick<CommentsElement, 'options'>): CommentsElement {
        const commentsElement: CommentsElement = document.createElement('ithub-comments') as CommentsElement;
        Object.assign(commentsElement, options);
        return commentsElement;
    }

    connectedCallback(): void {
        this.#connected = true;
        if (Object.keys(this.#options).length) {
            this.#init();
        }
    }

    disconnectedCallback(): void {
        this.#connected = false;
        this.#commentViewModel.unsubscribeAll();
        this.#unsubscribeEvents();
        this.container.innerHTML = '';
    }

    get options(): CommentsOptions {
        return this.#options;
    }

    set options(options: CommentsOptions) {
        if (!options) return;
        if (Object.keys(this.#options).length) {
            console.warn(`<ax-comments> Options already set, component can not be reinitialized.`);
            return;
        }
        Object.assign(this.#options, getDefaultOptions(), options);
        Object.freeze(this.#options);
        if (this.#connected) this.#init();
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

        if (this.#options.readOnly) {
            this.container.classList.add('read-only');
        }

        this.#currentSortKey = this.#options.defaultNavigationSortKey;

        let allStyles: CSSStyleSheet[] = [createDynamicStylesheet(this.#options)];
        if (this.#options.styles) {
            allStyles = allStyles.concat(this.#options.styles);
        }
        this.shadowRoot!.adoptedStyleSheets = allStyles;

        this.#fetchDataAndRender();
    }

    #initEmitterListeners(): void {
        this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_ADDED, (commentId) => {
            const comment: CommentModelEnriched = this.#commentViewModel.getComment(commentId)!;
            if (!comment.parentId) this.#createThread(comment);
            this.#getNavigation().commentCount += 1;
        });
        this.#commentViewModel.subscribe(CommentViewModelEvent.COMMENT_DELETED, () => {
            this.#getNavigation().commentCount -= 1;
        });
    }

    #fetchDataAndRender(): void {
        this.container.innerHTML = '';
        this.#createHTML();

        const success: (comments: CommentModel[]) => void = (comments) => {
            this.#commentViewModel.initComments(comments);

            this.#dataFetched = true;

            this.#render(this.#commentViewModel.size);
        };
        const error: () => void = noop;

        this.#options.getComments(success, error);
    }

    #createThreads() {
        this.container.querySelector('#comment-list')?.remove();
        const commentList: HTMLUListElement = createElement(`
            <ul id="comment-list" class="main">
            </ul>
        `);

        const rootComments: CommentModelEnriched[] = this.#commentViewModel.getRootComments(
            this.#commentSorter.getSorter(this.#currentSortKey)
        );

        this.container.querySelector('[data-container="comments"]')!.prepend(commentList);

        rootComments.forEach((commentModel) => {
            this.#addThread(commentModel, commentList);
        });
    }

    #createThread(comment: CommentModelEnriched): void {
        const commentList: HTMLUListElement = this.container.querySelector('#comment-list')!;
        const prependThread = this.#currentSortKey === SortKey.NEWEST;
        this.#addThread(comment, commentList, prependThread);
    }

    #addThread(
        commentModel: CommentModelEnriched,
        commentList: HTMLUListElement,
        prependThread: boolean = false
    ): void {
        const threadEl: ThreadElement = ThreadElement.create({ commentModel: commentModel });

        if (prependThread) {
            commentList.prepend(threadEl);
        } else {
            commentList.append(threadEl);
        }
    }

    #getNavigation(): NavigationElement {
        return this.container.querySelector<NavigationElement>('ithub-navigation')!;
    }

    #createHTML(): void {
        const mainCommentingField: CommentingFieldElement = CommentingFieldElement.create({ isMain: true });
        this.container.append(mainCommentingField);

        const mainControlRow: HTMLElement = mainCommentingField.querySelector('.control-row')!;
        hideElement(mainControlRow);
        hideElement(mainCommentingField.querySelector<HTMLElement>('.close'));

        this.container.append(
            NavigationElement.create({
                sortKey: this.#currentSortKey,
                onSortKeyChanged: this.#navigationSortKeyChanged,
            })
        );

        const spinner: HTMLElement = this.#spinnerFactory.createSpinner();
        this.container.append(spinner);

        const commentsContainer: HTMLElement = document.createElement('div');
        commentsContainer.classList.add('data-container');
        commentsContainer.setAttribute('data-container', 'comments');
        this.container.append(commentsContainer);

        const noComments: HTMLElement = document.createElement('div');
        noComments.classList.add('no-comments', 'no-data');
        noComments.textContent = this.#options.noCommentsText;
        const noCommentsIcon = document.createElement('i');
        noCommentsIcon.classList.add('fa', 'fa-comments', 'fa-2x');
        if (this.#options.noCommentsIconURL.length) {
            noCommentsIcon.style.backgroundImage = `url("${this.#options.noCommentsIconURL}")`;
            noCommentsIcon.classList.add('image');
        }
        noComments.prepend(document.createElement('br'), noCommentsIcon);
        commentsContainer.append(noComments);

        if (this.#options.enableAttachments) {
            const droppableOverlay: HTMLDivElement = document.createElement('div');
            droppableOverlay.classList.add('droppable-overlay');

            const droppableContainer: HTMLDivElement = document.createElement('div');
            droppableContainer.classList.add('droppable-container');

            const droppable: HTMLDivElement = document.createElement('div');
            droppable.classList.add('droppable');

            const uploadIcon: HTMLElement = document.createElement('i');
            uploadIcon.classList.add('fa', 'fa-paperclip', 'fa-4x');

            if (this.#options.uploadIconURL.length) {
                uploadIcon.style.backgroundImage = `url("${this.#options.uploadIconURL}")`;
                uploadIcon.classList.add('image');
            }

            const dropAttachmentText: HTMLDivElement = document.createElement('div');
            dropAttachmentText.textContent = this.#options.attachmentDropText;
            droppable.append(uploadIcon);
            droppable.append(dropAttachmentText);
            droppableContainer.append(droppable);

            droppableOverlay.append(droppableContainer);
            hideElement(droppableOverlay);
            this.container.append(droppableOverlay);
        }
    }

    #navigationSortKeyChanged: (newSortKey: SortKey) => void = (newSortKey) => {
        this.#currentSortKey = newSortKey;
        this.#sortAndReArrangeComments(newSortKey);
    };

    #sortAndReArrangeComments(sortKey: SortKey): void {
        const commentList: HTMLElement = this.container.querySelector('#comment-list')!;
        const rootComments: CommentModelEnriched[] = this.#commentViewModel.getRootComments(
            this.#commentSorter.getSorter(sortKey)
        );

        rootComments.forEach((commentModel) => {
            const commentEl: HTMLElement = commentList.querySelector(
                `:scope > li.comment[data-id="${commentModel.id}"]`
            )!;
            commentList.append(commentEl);
        });
    }

    #toggleEventHandlers(bindFunction: 'addEventListener' | 'removeEventListener') {
        EVENT_HANDLERS_MAP.forEach((handlerNames, event) => {
            handlerNames.forEach((handlerName) => {
                const method: (e: Event) => void = <(e: Event) => void>(
                    this.#elementEventHandler[handlerName].bind(this.#elementEventHandler)
                );

                if (isNil(event.selector)) {
                    this.container[bindFunction](event.type, method);
                } else {
                    this.container.querySelectorAll<HTMLElement>(event.selector!).forEach((element) => {
                        element[bindFunction](event.type, method);
                    });
                }
            });
        });
    }

    #subscribeEvents(): void {
        this.#toggleEventHandlers('addEventListener');
    }

    #unsubscribeEvents(): void {
        this.#toggleEventHandlers('removeEventListener');
    }

    #render(commentCount: number): void {
        if (!this.#dataFetched) {
            return;
        }

        this.#createThreads();
        this.#getNavigation().commentCount = commentCount;

        this.#subscribeEvents();

        this.container.querySelectorAll(':scope > .spinner').forEach((spinner) => spinner.remove());

        this.#options.refresh();
    }
}

defineCustomElement(CommentsElement, 'ithub-comments');
