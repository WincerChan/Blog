import adpater from "solid-start-static";
import solid from "solid-start/vite";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import jsonxPlugin from "./plugin/jsonx";


export default defineConfig({
  plugins: [{ ...jsonxPlugin(), enforce: "pre" }, solid({ adapter: adpater(), extensions: [".jsonx"] }), UnoCSS()],
});
