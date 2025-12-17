import { defineConfig, presetWind } from "unocss";
import { rules } from "./src/modules/site/styles/unocss/rules";
import { shortcuts } from "./src/modules/site/styles/unocss/shortcuts";
import { theme } from "./src/modules/site/styles/unocss/theme";
import { getTransformers } from "./src/modules/site/styles/unocss/transformers";

export default defineConfig({
    transformers: getTransformers(process.env.NODE_ENV === "production"),
    theme,
    rules,
    shortcuts,
    presets: [presetWind()],
});
