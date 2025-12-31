import fs from "node:fs";
import path from "node:path";

const tryDecode = (value: string) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const candidateFiles = (urlPath: string) => {
    const normalized = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    const relEncoded = normalized.replace(/^\//, "");
    const relDecoded = tryDecode(relEncoded);
    const rels = relDecoded === relEncoded ? [relEncoded] : [relEncoded, relDecoded];

    const cwd = process.cwd();
    const roots: string[] = [];
    for (let up = 0; up <= 6; up += 1) {
        const base = path.resolve(cwd, ...Array.from({ length: up }, () => ".."));
        roots.push(path.join(base, "public"));
        roots.push(path.join(base, ".output", "public"));
    }

    const files: string[] = [];
    for (const root of roots) {
        for (const rel of rels) files.push(path.join(root, rel));
    }
    return files;
};

const readPublicJsonSync = <T>(urlPath: string, fallback: T): T => {
    for (const filepath of candidateFiles(urlPath)) {
        try {
            if (!fs.existsSync(filepath)) continue;
            return JSON.parse(fs.readFileSync(filepath, "utf8")) as T;
        } catch {
            // keep trying
        }
    }
    return fallback;
};

export { readPublicJsonSync };
