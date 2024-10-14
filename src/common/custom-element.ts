/**
 * Ссылка на конкретный кастомный класс элемента;
 */
type CustomElementConstructor<E extends HTMLElement> = new (...args: any[]) => E;

/**
 * Декоратор, который регистрирует кастомный HTML element.
 */
export function CustomElement(selector: string, options?: ElementDefinitionOptions): CustomElementDecorator {
    return (_target, context) => {
        context.addInitializer(function () {
            customElements.define(selector, this, options);
        });
    };
}

/**
 * Кастомный декоратор для элемента. Основан на {@link ClassDecorator}.
 */
type CustomElementDecorator = <E extends HTMLElement, C extends CustomElementConstructor<E>>(
    target: C,
    context: ClassDecoratorContext<C>
) => C | void;

export function defineCustomElement(
    ctor: CustomElementConstructor<HTMLElement>,
    selector: string,
    options?: ElementDefinitionOptions
): void {
    customElements.define(selector, ctor, options);
}
