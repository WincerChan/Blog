import { defineConfig, presetTypography, presetWind4 as presetWind } from "unocss";
import { rules } from "./src/styles/unocss/rules";
import { shortcuts } from "./src/styles/unocss/shortcuts";
import { theme } from "./src/styles/unocss/theme";
import { getTransformers } from "./src/styles/unocss/transformers";

export default defineConfig({
    transformers: getTransformers(process.env.NODE_ENV === "production"),
    theme,
    rules,
    shortcuts,
    presets: [
        presetWind(),
        presetTypography({
            cssExtend: {
                "--un-prose-body": "var(--c-text)",
                "--un-prose-headings": "var(--c-text)",
                "--un-prose-links": "var(--c-link)",
                "--un-prose-lists": "var(--c-text-muted)",
                "--un-prose-hr": "var(--c-border)",
                "--un-prose-captions": "var(--c-text-subtle)",
                "--un-prose-code": "var(--c-text)",
                "--un-prose-borders": "var(--c-border)",
                "--un-prose-bg-soft": "var(--c-surface-2)",
                "--un-prose-invert-body": "var(--c-text)",
                "--un-prose-invert-headings": "var(--c-text)",
                "--un-prose-invert-links": "var(--c-link)",
                "--un-prose-invert-lists": "var(--c-text-muted)",
                "--un-prose-invert-hr": "var(--c-border)",
                "--un-prose-invert-captions": "var(--c-text-subtle)",
                "--un-prose-invert-code": "var(--c-text)",
                "--un-prose-invert-borders": "var(--c-border)",
                "--un-prose-invert-bg-soft": "var(--c-surface-2)",
            },
        }),
    ],
});
