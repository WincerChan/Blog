import { transformerCompileClass, transformerDirectives } from "unocss";

export const getTransformers = (isProd: boolean) => {
    const transformers = [transformerDirectives({ enforce: "pre" })];
    if (isProd) {
        transformers.push(
            transformerCompileClass({
                trigger: "::",
                classPrefix: "",
            }),
        );
    }
    return transformers;
};

