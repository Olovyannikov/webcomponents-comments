export function isNil(value: any): value is undefined | null {
    return value === undefined || value === null;
}

export function isStringEmpty(value: string | undefined | null): boolean {
    return isNil(value) || value!.trim().length === 0;
}

// Сравнивает ссылки на объект
export function areArraysEqual<T>(first: T[], second: T[]): boolean {
    if (first.length !== second.length) { // Кейс: массивы имеют разный размер
        return false;
    } else { // Кейс: массивы имеют одинаковый размер
        first.sort();
        second.sort();

        for (let i = 0; i < first.length; i++) {
            if (first[i] !== second[i]) {
                return false;
            }
        }

        return true;
    }
}

// функция-заглушка
export function noop(): void {}


export function isMobileBrowser(): boolean {
    return /Mobile/i.test(window.navigator.userAgent);
}

export function normalizeSpaces(inputText: string): string {
    return inputText.trim().replace(/([^\S\n ]|[^\P{C}\n ]|[^\P{Z}\n ])/gmu, ' ');
}

export function debounce<T extends (...args: any[]) => void>(callback: T, wait: number, options: DebounceOptions = DebounceOptions.BOTH_EDGES): T {
    if (options === DebounceOptions.LEADING) {
        return getLeadingEdgeDebouncer(callback, wait);
    } else if (options === DebounceOptions.TRAILING) {
        return getTrailingEdgeDebouncer(callback, wait);
    } else {
        const leadingEdge: T = getLeadingEdgeDebouncer(callback, wait);
        const trailingEdge: T = getTrailingEdgeDebouncer(callback, wait);

        return function bothEdges(...args: any[]): void {
            leadingEdge.apply(null, args);
            trailingEdge.apply(null, args);
        } as T;
    }
}

function getLeadingEdgeDebouncer<T extends (...args: any[]) => void>(callback: T, wait: number): T {
    let timeoutId: any = null;
    let execute: boolean = true;

    return function leadingEdge(...args: any[]): void {
        clearTimeout(timeoutId);
        if (execute) {
            callback.apply(null, args);
            execute = false;
        }
        timeoutId = setTimeout(() => {
            execute = true;
        }, wait);
    } as T;
}

function getTrailingEdgeDebouncer<T extends (...args: any[]) => void>(callback: T, wait: number): T {
    let timeoutId: any = null;
    return function trailingEdge(...args: any[]): void {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    } as T;
}

export class DebounceOptions {

    static readonly LEADING: DebounceOptions = new DebounceOptions(true, false);
    static readonly TRAILING: DebounceOptions = new DebounceOptions(false, true);
    static readonly BOTH_EDGES: DebounceOptions = new DebounceOptions(true, true);

    private constructor(
        readonly leadingEdge: boolean,
        readonly trailingEdge: boolean
    ) {
    }
}