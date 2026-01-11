import { defineConfig } from "velite";
import { matterLoader } from "./tools/velite/loaders/matterLoader";
import { collections } from "./tools/velite/collections";
import { prepareVelite } from "./tools/velite/prepare";

export default defineConfig({
  root: "_blogs/content",
  loaders: [matterLoader],
  collections,
  output: {
    data: ".velite",
    clean: false,
  },
  prepare: prepareVelite,
});
