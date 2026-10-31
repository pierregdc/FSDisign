import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  let resolvedSpecifier = specifier;

  if (specifier.startsWith("@/")) {
    const targetPath = path.join(projectRoot, "src", specifier.slice(2));
    if (fs.existsSync(targetPath + ".ts")) {
      return { url: pathToFileURL(targetPath + ".ts").href, format: "module", shortCircuit: true };
    }
    if (fs.existsSync(targetPath + ".tsx")) {
      return { url: pathToFileURL(targetPath + ".tsx").href, format: "module", shortCircuit: true };
    }
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory() && fs.existsSync(path.join(targetPath, "index.ts"))) {
      return { url: pathToFileURL(path.join(targetPath, "index.ts")).href, format: "module", shortCircuit: true };
    }
    resolvedSpecifier = pathToFileURL(targetPath).href;
  }

  if (resolvedSpecifier.startsWith("file://") || resolvedSpecifier.startsWith("./") || resolvedSpecifier.startsWith("../")) {
    let candidate = resolvedSpecifier.startsWith("file://") ? fileURLToPath(resolvedSpecifier) : resolvedSpecifier;
    if (context.parentURL && !resolvedSpecifier.startsWith("file://")) {
      candidate = path.resolve(path.dirname(fileURLToPath(context.parentURL)), resolvedSpecifier);
    }
    if (fs.existsSync(candidate + ".ts")) {
      return { url: pathToFileURL(candidate + ".ts").href, format: "module", shortCircuit: true };
    }
    if (fs.existsSync(candidate + ".tsx")) {
      return { url: pathToFileURL(candidate + ".tsx").href, format: "module", shortCircuit: true };
    }
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() && fs.existsSync(path.join(candidate, "index.ts"))) {
      return { url: pathToFileURL(path.join(candidate, "index.ts")).href, format: "module", shortCircuit: true };
    }
    if (fs.existsSync(candidate) && (candidate.endsWith(".ts") || candidate.endsWith(".tsx"))) {
      return { url: pathToFileURL(candidate).href, format: "module", shortCircuit: true };
    }
  }

  return nextResolve(resolvedSpecifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const filePath = fileURLToPath(url);
    const raw = fs.readFileSync(filePath, "utf-8");
    const transpiled = ts.transpileModule(raw, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
      },
    });
    return {
      format: "module",
      shortCircuit: true,
      source: transpiled.outputText,
    };
  }
  return nextLoad(url, context);
}
