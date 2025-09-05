import { readdirSync, mkdirSync, existsSync, lstatSync } from 'fs';
import { join, parse } from 'path';

export interface ComponentInfo {
  name: string;
  className: string;
  pathItems: string[];
  path: string;
}

export function findComponents(basePath: string) {
  const result: ComponentInfo[] = [];
  const visit = (basePath: string, pathItems: string[]) => {
    const path = join(basePath, ...pathItems);
    const items = readdirSync(path);
    for (const item of items) {
      const { ext, name } = parse(item);
      const filePath = join(path, item);
      const stats = lstatSync(filePath);
      if (stats.isDirectory()) {
        visit(basePath, [...pathItems, item]);
        continue;
      }
      if (stats.isFile() && ext === '.html') {
        const componentName = name.replace(/\.component$/, '');
        const info: ComponentInfo = {
          name: componentName,
          className: capitalize(convertName(componentName)) + 'Object',
          pathItems: pathItems,
          path: filePath,
        };
        result.push(info);
      }
    }
  };
  visit(basePath, []);
  return result;
}

export function capitalize(name: string) {
  return (name.length === 0) ? name : name[0].toUpperCase() + name.substring(1);
}

export function convertName(name: string) {
  let result = "";
  let cap = false;
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    if (ch === '_' || ch === '-') {
      cap = (i !== 0);
      continue;
    }
    if (cap) {
      result += ch.toUpperCase();
      cap = false;
    } else {
      result += ch;
    }
  }
  return result;
}

export function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}
