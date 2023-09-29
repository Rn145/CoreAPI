import Path from "path";
import fs from "fs";

export default async function ImportScript(path: string) {
    const stat = await fs.promises.stat(path);
    if (stat.isDirectory())
        path = Path.join(path, 'index.js');
    const script = await import(path);
    return script;
}