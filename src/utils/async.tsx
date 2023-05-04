import { Component, JSXElement, Show, Suspense, createEffect, createResource } from "solid-js";

type AsyncProps<T> = {
    promise: Promise<T>,
    await: JSXElement,
    catch: (err: string) => JSXElement,
    children: JSXElement | ((data: T) => JSXElement)
}

export const Async: <T>(props: AsyncProps<T>) => JSXElement = <T,>(props: AsyncProps<T>) => {
    const [data] = createResource(
        props.promise
    )
    createEffect(() => {
        console.log(data())
    })
    return (
        <Suspense fallback={props.await}>
            <Show when={data()}>{props.children}</Show>
        </Suspense>
    )
}

export const Await: Component<{ children: JSXElement }> = (props) => {
    return props.children
}

export const Catch: Component<{ children: JSXElement }> = (props) => {
    return props.children
}