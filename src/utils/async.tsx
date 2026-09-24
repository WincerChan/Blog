import { Component, Element, Errored, Loading, createMemo } from "solid-js";

type AsyncProps<T> = {
    promise: Promise<T>,
    await: Element,
    catch: (err: string) => Element,
    children: Element | ((data: T) => Element)
}

export const Async: <T>(props: AsyncProps<T>) => Element = <T,>(props: AsyncProps<T>) => {
    const data = createMemo(() => props.promise)
    return (
        <Loading fallback={props.await}>
            <Errored fallback={error => props.catch(String(error()))}>
                {typeof props.children === "function" ? props.children(data()) : props.children}
            </Errored>
        </Loading>
    )
}

export const Await: Component<{ children: Element }> = (props) => {
    return props.children
}

export const Catch: Component<{ children: Element }> = (props) => {
    return props.children
}