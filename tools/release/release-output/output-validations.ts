import {existsSync, readFileSync} from 'fs';
import {dirname, isAbsolute, join} from 'path';
import * as ts from 'typescript';

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

/** RegExp that matches common Bazel manifest paths in this workspace */
const bazelManifestPath = /(gc_ajf|external)\//;

/**
 * List of fields which are mandatory in entry-point "package.json" files and refer
 * to files in the release output.
 */
const packageJsonPathFields =
    ['main', 'module', 'typings', 'es2015', 'fesm5', 'fesm2015', 'esm5', 'esm2015'];

/**
 * Checks the specified JavaScript file and ensures that it does not
 * contain any external resource URLs, or Bazel manifest paths.
 */
export function checkJavaScriptOutput(filePath: string): string[] {
  const fileContent = readFileSync(filePath, 'utf8');
  const failures: string[] = [];

  if (inlineStylesSourcemapRegex.exec(fileContent) !== null) {
    failures.push('Found sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(fileContent) !== null) {
    failures.push('Found external component resource references');
  }

  if (bazelManifestPath.exec(fileContent) !== null) {
    failures.push('Found Bazel manifest path in output.');
  }

  return failures;
}

/**
 * Checks a "package.json" file by ensuring that common fields which are
 * specified in the Angular package format are present. Those fields which
 * resolve to paths are checked so that they do not refer to non-existent files.
 */
export function checkPackageJsonFile(filePath: string): string[] {
  const fileContent = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  const packageJsonDir = dirname(filePath);
  const failures: string[] = [];

  packageJsonPathFields.forEach(fieldName => {
    if (!parsed[fieldName]) {
      failures.push(`Missing field: ${fieldName}`);
    }

    const resolvedPath = join(packageJsonDir, parsed[fieldName]);

    if (!existsSync(resolvedPath)) {
      failures.push(`File referenced in "${fieldName}" field does not exist.`);
    }
  });

  return failures;
}

/**
 * Checks the specified TypeScript definition file by ensuring it does not contain invalid
 * dynamic import statements. There can be invalid type imports paths because we compose the
 * release package by moving things in a desired output structure. See Angular package format
 * specification and https://github.com/angular/components/pull/12876
 */
export function checkTypeDefinitionFile(filePath: string): string[] {
  const baseDir = dirname(filePath);
  const fileContent = readFileSync(filePath, 'utf8');
  const failures: string[] = [];

  const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
  const nodeQueue = [...sourceFile.getChildren()];

  while (nodeQueue.length) {
    const node = nodeQueue.shift()!;

    // Check all dynamic type imports and ensure that the import path is valid within the release
    // output. Note that we don't want to enforce that there are no dynamic type imports because
    // type inference is heavily used within the schematics and is useful in some situations.
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)) {
      const importPath = node.argument.literal.text;

      // In case the type import path starts with a dot, we know that this is a relative path
      // and can ensure that the target path exists. Note that we cannot completely rely on
      // "isAbsolute" because dynamic imports can also import from modules (e.g. "my-npm-module")
      if (importPath.startsWith('.') && !existsSync(join(baseDir, `${importPath}.d.ts`))) {
        failures.push('Found relative type imports which do not exist.');
      } else if (isAbsolute(importPath)) {
        failures.push('Found absolute type imports in definition file.');
      }
    }

    nodeQueue.push(...node.getChildren());
  }

  return failures;
}
