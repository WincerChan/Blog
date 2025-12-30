import { defineConfig, presetTypography, presetWind } from "unocss";
import { rules } from "./src/styles/unocss/rules";
import { shortcuts } from "./src/styles/unocss/shortcuts";
import { theme } from "./src/styles/unocss/theme";
import { getTransformers } from "./src/styles/unocss/transformers";

export default defineConfig({
    transformers: getTransformers(process.env.NODE_ENV === "production"),
    theme,
    rules,
    shortcuts,
    presets: [presetWind(), presetTypography()],
});
