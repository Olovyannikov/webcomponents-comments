type StringProps<T> = { [P in keyof T]: T[P] extends string ? P : never }[keyof T];

const PREVIOUS_DISPLAY_VALUE: WeakMap<HTMLElement, string> = new WeakMap();

class QueryableElementArray<E extends HTMLElement> extends Array implements Pick<ParentNode, 'querySelector'> {
    querySelector(selectors: string): E | null {
        for (const element of this) {
            const foundElement: E | null = (element as E).querySelector<E>(selectors);
            if (foundElement) {
                return foundElement;
            }
        }
        return null;
    }

    querySelectorAll(selectors: string): E[] {
        const results: E[] = [];
        for (const element of this) {
            const foundElements: NodeListOf<E> = (element as E).querySelectorAll<E>(selectors);
            if (foundElements.length > 0) {
                results.push(...foundElements);
            }
        }
        return results;
    }

    first(): E | null {
        return this.length > 0 ? (this[0] as E) : null;
    }

    last(): E | null {
        return this.length > 0 ? (this[this.length - 1] as E) : null;
    }
}

export function findParentsBySelector<E extends HTMLElement = HTMLElement>(
    element: HTMLElement,
    selectors?: string
): QueryableElementArray<E> {
    const results: E[] = [];
    for (let parent = element && element.parentElement; parent; parent = parent.parentElement) {
        if (!selectors || parent.matches(selectors)) {
            results.push(parent as E);
        }
    }
    return new QueryableElementArray(...(results as unknown as number[]));
}

export function getElementStyle(element: HTMLElement, prop: StringProps<CSSStyleDeclaration>): string {
    return element.style[prop] || getComputedStyle(element)[prop];
}

export function getHostContainer(child: HTMLElement): HTMLElement {
    const container: HTMLElement | null = findParentsBySelector<HTMLDivElement>(child, '#comments-container').first();
    if (!container) {
        throw new Error(`${child.constructor.name} will not work outside ithub-comments.`);
    }
    return container;
}

function showElementUnconditionally(element: HTMLElement): void {
    element.style.display = PREVIOUS_DISPLAY_VALUE.get(element) || 'block';
}

export function showElement(element: HTMLElement | null): void {
    if (element && getElementStyle(element, 'display') === 'none') {
        showElementUnconditionally(element);
    }
}

function hideElementUnconditionally(element: HTMLElement): void {
    PREVIOUS_DISPLAY_VALUE.set(element, getElementStyle(element, 'display'));
    element.style.display = 'none';
}

export function hideElement(element: HTMLElement | null): void {
    if (element && getElementStyle(element, 'display') !== 'none') {
        hideElementUnconditionally(element);
    }
}

export function toggleElementVisibility(element: HTMLElement | null): void {
    if (!element) {
        return;
    } else if (getElementStyle(element, 'display') !== 'none') {
        hideElementUnconditionally(element);
    } else {
        showElementUnconditionally(element);
    }
}

export function isElementVisible(element: HTMLElement | null): boolean {
    return !!element && !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

export function isElementHidden(element: HTMLElement | null): boolean {
    return !isElementVisible(element);
}

export function findSiblingsBySelector<E extends HTMLElement = HTMLElement>(
    element: Element,
    selectors?: string
): QueryableElementArray<E> {
    const siblings: E[] = [];
    for (const sibling of element.parentElement!.children) {
        if (sibling !== element) siblings.push(sibling as E);
    }

    if (!selectors) {
        return new QueryableElementArray(...(siblings as any));
    }

    const results: E[] = [];
    for (const sibling of siblings) {
        if (sibling.matches(selectors)) {
            results.push(sibling);
        }
    }
    return new QueryableElementArray(...(results as any));
}
