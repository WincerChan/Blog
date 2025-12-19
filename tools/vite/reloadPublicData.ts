import path from "node:path";
import type { Plugin } from "vite";

const reloadPublicData = (baseDir: string): Plugin => ({
  name: "reload-public-data",
  apply: "serve",
  configureServer(server) {
    const dataDir = path.resolve(baseDir, "public", "_data");
    const normalize = (value: string) => value.split(path.sep).join("/");
    const target = normalize(dataDir);

    server.watcher.add(dataDir);
    const triggerReload = (file: string) => {
      if (!normalize(file).startsWith(target)) return;
      server.ws.send({ type: "full-reload" });
    };

    server.watcher.on("add", triggerReload);
    server.watcher.on("change", triggerReload);
    server.watcher.on("unlink", triggerReload);
  },
});

export default reloadPublicData;
