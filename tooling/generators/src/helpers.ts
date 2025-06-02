import { execSync } from "node:child_process";
import type * as k from "ast-types/gen/kinds";
import { builders as b, namedTypes as t } from "ast-types";
import * as recast from "recast";
import * as typescriptParser from "recast/parsers/babel-ts";
import { z } from "zod";

export const ensureCleanWorktree = () => {
  if (execSync("git status --porcelain").toString().trim() !== "") {
    throw new Error(
      "This generator overwrites files and your git working tree is not clean. Commit or stash changes and try again",
    );
  }
};

export function parsePackageJson(content: string) {
  return z
    .object({
      name: z.string().optional(),
      dependencies: z.record(z.string(), z.string()).optional(),
      devDependencies: z.record(z.string(), z.string()).optional(),
      peerDependencies: z.record(z.string(), z.string()).optional(),
      boring: z.object({ namespace: z.string() }).optional(),
      scripts: z.record(z.string(), z.string()).optional(),
    })
    .passthrough()
    .parse(JSON.parse(content));
}

export function renameDependencies(dependencies?: unknown, prefix?: string) {
  if (!dependencies) return;

  const result: Record<string, string> = {};
  for (const [dep, version] of Object.entries(dependencies)) {
    if (dep.startsWith("@spolka-z-l-o/")) {
      result[dep.replace("@spolka-z-l-o", "@" + prefix)] = `${version}`;
    } else {
      result[dep] = `${version}`;
    }
  }
  return result;
}

export const modifyCreatetRPCContextDeclarationBody =
  (fn: (val: t.FunctionDeclaration | t.ArrowFunctionExpression) => void) =>
  (statement: t.Program["body"][number]) => {
    if (!t.ExportNamedDeclaration.check(statement)) {
      return;
    }

    const declaration = statement.declaration;

    if (
      t.FunctionDeclaration.check(declaration) &&
      declaration.id?.name === "createTRPCContext"
    ) {
      fn(declaration);
      return;
    } else if (t.VariableDeclaration.check(declaration)) {
      if (declaration.declarations.length !== 1) {
        return;
      }

      const declarator = declaration.declarations[0];
      if (
        t.VariableDeclarator.check(declarator) &&
        t.Identifier.check(declarator.id) &&
        declarator.id.name === "createTRPCContext" &&
        t.ArrowFunctionExpression.check(declarator.init)
      ) {
        return fn(declarator.init);
      }

      return;
    }

    return;
  };

export const extendRootRouter = (
  fileAST: t.File,
  routers: {
    exportedRouterName: string;
    routerImportPath: string;
    routerKey: string;
  }[],
) => {
  for (const { exportedRouterName, routerImportPath, routerKey } of routers) {
    if (
      fileAST.program.body.some(
        (s) =>
          t.ImportDeclaration.check(s) &&
          s.specifiers &&
          t.ImportSpecifier.check(s.specifiers[0]) &&
          t.Identifier.check(s.specifiers[0].imported) &&
          s.specifiers[0].imported.name === exportedRouterName,
      )
    ) {
      console.log(`${exportedRouterName} already imported. Skipping`);
    } else {
      const importStatement = b.importDeclaration(
        [
          b.importSpecifier(
            b.identifier(exportedRouterName),
            b.identifier(exportedRouterName),
          ),
        ],
        b.stringLiteral(routerImportPath),
      );
      fileAST.program.body.unshift(importStatement);
    }

    const authProperty = b.objectProperty(
      b.identifier(routerKey),
      b.identifier(exportedRouterName),
    );

    for (const statement of fileAST.program.body) {
      if (t.ExportNamedDeclaration.check(statement)) {
        if (t.VariableDeclaration.check(statement.declaration)) {
          const declarator = statement.declaration.declarations.find(
            (d): d is t.VariableDeclarator =>
              t.VariableDeclarator.check(d) &&
              t.Identifier.check(d.id) &&
              d.id.name === "appRouter",
          );

          if (t.CallExpression.check(declarator?.init)) {
            const firstArg = declarator.init.arguments[0];
            if (t.ObjectExpression.check(firstArg)) {
              if (
                firstArg.properties.some(
                  (p) =>
                    t.ObjectProperty.check(p) &&
                    t.Identifier.check(p.key) &&
                    p.key.name === routerKey,
                )
              ) {
                console.log(`"${routerKey}" property already exists. Skipping`);
                break;
              }
              firstArg.properties.push(authProperty);
            } else {
              throw new Error(
                "Expected createTRPCRouter argument to be an object expression",
              );
            }
          } else {
            throw new Error("Expected appRouter to be declared");
          }
        }
      }
    }
  }

  return fileAST;
};

/**
 * Required to unwrap constructors in recast types
 */
/* eslint-disable @typescript-eslint/prefer-function-type, @typescript-eslint/no-explicit-any */
type ConstructedObject<T extends { new (...args: any[]): any }> =
  T extends new (...args: any[]) => infer R ? R : any;
/* eslint-enable */

type NodePath<T extends recast.types.ASTNode> = ConstructedObject<
  typeof recast.types.NodePath<T>
>;

export const addImports = (fileAST: t.File, importTemplate: string) => {
  const importAST = recast.parse(importTemplate, {
    parser: typescriptParser,
  }) as t.File;

  const existingLocalImports = new Set<string>();

  const existingImportsMap = new Map<
    string,
    {
      importSpecifier:
        | recast.types.namedTypes.ImportSpecifier
        | recast.types.namedTypes.ImportDefaultSpecifier
        | recast.types.namedTypes.ImportNamespaceSpecifier;
      source: recast.types.namedTypes.Literal;
      isType: boolean;
    }
  >();

  const existingImportDeclarationsMap = new Map<
    string,
    recast.types.namedTypes.ImportDeclaration[]
  >();

  let lastImportDeclaration:
    | NodePath<recast.types.namedTypes.ImportDeclaration>
    | undefined;

  function getName(identifierKind: k.IdentifierKind | undefined | null) {
    if (!identifierKind) return;
    if (typeof identifierKind.name === "string") return identifierKind.name;

    return getName(identifierKind.name);
  }

  recast.visit(fileAST, {
    visitImportDeclaration(path) {
      const source = path.node.source;
      lastImportDeclaration = path;

      if (!t.StringLiteral.check(source)) {
        console.log(
          "Skipping import declaration with dynamic source",
          source.value,
        );
        return false;
      }

      const existingImportDeclarations =
        existingImportDeclarationsMap.get(source.value) ?? [];

      existingImportDeclarationsMap.set(source.value, [
        ...existingImportDeclarations,
        path.node,
      ]);

      const isTypeDeclaration = path.node.importKind === "type";

      function getKey(localName: string, exportedName: string) {
        return `${source.value?.toString()}${exportedName}${localName}`;
      }

      recast.visit(path.node, {
        visitImportSpecifier(path) {
          const importedName = getName(path.node.imported);
          const localName = getName(path.node.local) ?? importedName;

          if (!localName) return false;
          if (!importedName) return false;

          existingLocalImports.add(localName);

          existingImportsMap.set(getKey(localName, importedName), {
            importSpecifier: path.node,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            source: path.parentPath.node.source,
            isType:
              isTypeDeclaration ||
              (path.node as unknown as { importKind: string }).importKind ===
                "type",
          });

          return false;
        },
        visitImportDefaultSpecifier(path) {
          const localName = getName(path.node.local);

          if (!localName) return false;

          existingLocalImports.add(localName);

          existingImportsMap.set(getKey(localName, localName), {
            importSpecifier: path.node,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            source: path.parentPath.node.source,
            isType: isTypeDeclaration,
          });

          return false;
        },
        visitImportNamespaceSpecifier(path) {
          const localName = getName(path.node.local);

          if (!localName) return false;

          existingLocalImports.add(localName);

          existingImportsMap.set(getKey(localName, "*"), {
            importSpecifier: path.node,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            source: path.parentPath.node.source,
            isType: isTypeDeclaration,
          });

          return false;
        },
      });

      return false;
    },
  });

  const importsToAppend: t.ImportDeclaration[] = [];

  recast.visit(importAST, {
    visitImportDeclaration(path) {
      const source = path.node.source;

      if (!t.StringLiteral.check(source)) {
        console.log(
          "Skipping import declaration with dynamic source",
          source.value,
        );
        return false;
      }

      const importKind = path.node.importKind;
      const isTypeDeclaration = importKind === "type";

      const matchingDeclarations = existingImportDeclarationsMap.get(
        source.value,
      );

      if (
        matchingDeclarations === undefined ||
        matchingDeclarations.length === 0
      ) {
        importsToAppend.push(path.node);
        return false;
      }

      let firstMatchingImportDeclaration = matchingDeclarations.find(
        (x) =>
          x.importKind === importKind ||
          (x.importKind === "value" && isTypeDeclaration),
      );
      let firstSpecifier = firstMatchingImportDeclaration?.specifiers?.[0];

      if (!firstMatchingImportDeclaration && matchingDeclarations[0]) {
        firstMatchingImportDeclaration = matchingDeclarations[0];
        firstMatchingImportDeclaration.importKind = "value";
        firstSpecifier = firstMatchingImportDeclaration.specifiers?.[0];
      }

      if (!firstMatchingImportDeclaration) {
        return false;
      }

      function getKey(localName: string, exportedName: string) {
        return `${source.value?.toString()}${exportedName}${localName}`;
      }

      recast.visit(path.node, {
        visitImportSpecifier(path) {
          const importedName = getName(path.node.imported);
          const localName = getName(path.node.local) ?? importedName;

          if (!localName) return false;
          if (!importedName) return false;

          const existing = existingImportsMap.get(
            getKey(localName, importedName),
          );

          if (existing) {
            return false;
          }

          if (existingLocalImports.has(localName)) {
            throw new Error(`Local import "${localName}" already exists`);
          }

          if (firstSpecifier?.type === "ImportSpecifier") {
            firstMatchingImportDeclaration.specifiers?.push(path.node);
          } else {
            importsToAppend.push(b.importDeclaration([path.node], source));
          }

          return false;
        },
        visitImportDefaultSpecifier(path) {
          const localName = getName(path.node.local);

          if (!localName) return false;

          const existing = existingImportsMap.get(getKey(localName, localName));

          if (existing) {
            return false;
          }

          if (existingLocalImports.has(localName)) {
            throw new Error(`Local import "${localName}" already exists`);
          }

          if (firstSpecifier?.type === "ImportSpecifier") {
            firstMatchingImportDeclaration.specifiers?.push(
              b.importSpecifier(
                b.identifier(localName),
                b.identifier("default"),
              ),
            );
          } else {
            importsToAppend.push(b.importDeclaration([path.node], source));
          }

          return false;
        },
        visitImportNamespaceSpecifier(path) {
          const localName = getName(path.node.local);

          if (!localName) return false;

          const existing = existingImportsMap.get(getKey(localName, "*"));

          if (existing) {
            return false;
          }

          if (existingLocalImports.has(localName)) {
            throw new Error(`Local import "${localName}" already exists`);
          }

          importsToAppend.push(b.importDeclaration([path.node], source));

          return false;
        },
      });

      return false;
    },
  });

  if (lastImportDeclaration && importsToAppend.length > 0) {
    lastImportDeclaration.insertAfter(...importsToAppend);
  }
};

export const appendTailwindPlugin = (
  ast: t.File,
  node: k.ExpressionKind | t.RestElement | t.SpreadElement | null,
) => {
  recast.visit(ast, {
    visitExportDefaultDeclaration(path) {
      recast.visit(path.node, {
        visitObjectExpression(path) {
          recast.visit(path.node, {
            visitObjectProperty(path) {
              if (
                t.Identifier.check(path.node.key) &&
                path.node.key.name === "plugins"
              ) {
                if (t.ArrayExpression.check(path.node.value)) {
                  path.node.value.elements.push(node);
                }
              }

              return false;
            },
          });
          return false;
        },
      });
      return false;
    },
  });
};