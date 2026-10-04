import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

/** CLI専用。信頼済みのプロジェクトTSだけを読み、ブラウザには含めない。 */
export function loadTsModule(relativePath, projectRoot = process.cwd()) {
  const sourceRoot = path.resolve(projectRoot, "client/src");
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(filename);
    if (
      !resolved.startsWith(sourceRoot + path.sep) ||
      !resolved.endsWith(".ts")
    ) {
      throw new Error(`Unsupported module: ${resolved}`);
    }
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const module = { exports: {} };
    cache.set(resolved, module);
    const { outputText } = ts.transpileModule(
      fs.readFileSync(resolved, "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      }
    );
    const requireModule = specifier => {
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) {
        throw new Error(`Unsupported import: ${specifier}`);
      }
      return load(
        (specifier.startsWith("@/")
          ? path.join(sourceRoot, specifier.slice(2))
          : path.resolve(path.dirname(resolved), specifier)) + ".ts"
      );
    };
    vm.runInNewContext(
      `(function(require,module,exports){${outputText}\n})`,
      {}
    )(requireModule, module, module.exports);
    return module.exports;
  }
  return load(path.resolve(projectRoot, relativePath));
}
