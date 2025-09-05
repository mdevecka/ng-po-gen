import { TypescriptParser, NamedImport, ClassDeclaration } from 'typescript-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ComponentInfo, convertName, capitalize, ensureDir } from './utils.js';
import { NodeInfo } from './template-parser.js';
import htmlTags from 'html-tags';

interface PageObjectCodeInfo {
  importedSymbols: Set<string>;
  importedCode: string[];
  keepCode: Map<string, string>;
}

export interface PageObjectBuilderOptions {
  outputDir: string;
  eol: 'unix' | 'win';
  selectorPrefix: string;
  lib: string;
  overwrite?: boolean;
}

export class PageObjectBuilder {

  readonly eolChar: string;

  constructor(private opt: PageObjectBuilderOptions) {
    this.eolChar = (opt.eol === 'win') ? '\r\n' : '\n';
  }

  async createPageObject(root: NodeInfo, componentRef: Map<string, ComponentInfo>) {
    const ref = componentRef.get(root.className);
    const dir = join(this.opt.outputDir, ...ref!.pathItems);
    const path = join(dir, `${ref!.name}.po.ts`);
    const sourceCode = (!this.opt.overwrite && existsSync(path)) ? readFileSync(path, 'utf8') : null;
    const res = await this.getSourceCode(sourceCode, root, componentRef);
    ensureDir(dir);
    writeFileSync(path, res);
  }

  async getSourceCode(pageObjectCode: string | null, root: NodeInfo, componentRef: Map<string, ComponentInfo>) {
    const ref = componentRef.get(root.className);
    let codeInfo: PageObjectCodeInfo = { importedSymbols: new Set(), importedCode: [], keepCode: new Map() };
    if (pageObjectCode != null) {
      codeInfo = await this.parsePageObject(pageObjectCode);
    }
    let res = '';
    const usedClasses = this.getUsedClasses(root);
    const coreImports = Array.from(usedClasses.core).concat('PageObject').filter(i => !codeInfo.importedSymbols.has(i));
    const otherImports = Array.from(usedClasses.imported).filter(i => !codeInfo.importedSymbols.has(i));
    for (const code of codeInfo.importedCode) {
      res += code + this.eolChar;
    }
    if (coreImports.length > 0) {
      res += `import { ${coreImports.join(', ')} } from '${this.opt.lib}';` + this.eolChar;
    }
    for (const name of otherImports) {
      const cref = componentRef.get(name);
      if (cref != null) {
        const relPath = this.createRelativePath(ref!.pathItems, cref.pathItems);
        res += `import { ${name} } from '${relPath}/${cref.name}.po';` + this.eolChar;
      }
    }
    const visitNodes = (nodeInfo: NodeInfo) => {
      if (nodeInfo.children.length > 0) {
        res += this.eolChar;
        res += this.createClass(nodeInfo, codeInfo.keepCode.get(nodeInfo.className));
      }
      for (const child of nodeInfo.children) {
        visitNodes(child);
      }
    };
    visitNodes(root);
    return res;
  }

  private createClass(info: NodeInfo, mergeCode?: string) {
    let res = `export class ${info.className} extends PageObject {` + this.eolChar;
    for (const child of info.children) {
      const isList = (child.selector && child.selector.endsWith('_list')) || child.options.includes('list');
      const funcName = (isList) ? 'this.createList' : 'this.createChild';
      const name = (isList) ? `${child.propName}List` : child.propName;
      const selector = child.selectorPath.join(' > ').trim();
      const className = this.getTargetClassInfo(child)[0];
      res += `  get ${name}() { return ${funcName}(${className}, '${selector}'); }` + this.eolChar;
    }
    if (mergeCode != null) {
      res += mergeCode + this.eolChar;
    } else {
      res += "}" + this.eolChar;
    }
    return res;
  }

  private async parsePageObject(sourceCode: string): Promise<PageObjectCodeInfo> {
    const parser = new TypescriptParser();
    const comments = Array.from(sourceCode.matchAll(/[ \t]*\/\/.*\r?\n/g));
    const codeInfo = await parser.parseSource(sourceCode);
    const importedSymbols = new Set<string>();
    const importedCode: string[] = [];
    for (const item of codeInfo.imports) {
      if (item instanceof NamedImport) {
        for (const specifier of item.specifiers) {
          importedSymbols.add(specifier.alias ?? specifier.specifier);
        }
        importedCode.push(sourceCode.substring(item.start!, item.end!));
      }
    }
    const keepCode = new Map<string, string>();
    for (const decl of codeInfo.declarations) {
      if (decl instanceof ClassDeclaration) {
        const firstClassComment = comments.find(c => c.index >= decl.start! && c.index <= decl.end!);
        if (firstClassComment != null) {
          keepCode.set(decl.name, sourceCode.substring(firstClassComment.index, decl.end!));
        }
      }
    }
    return { importedSymbols, importedCode, keepCode };
  }

  private getUsedClasses(root: NodeInfo) {
    const core = new Set<string>();
    const imported = new Set<string>();
    const visitNodes = (nodeInfo: NodeInfo) => {
      const [targetClass, origin] = this.getTargetClassInfo(nodeInfo);
      if (origin === 'core') {
        core.add(targetClass);
      } else if (origin === 'import') {
        imported.add(targetClass);
      }
      for (const child of nodeInfo.children) {
        visitNodes(child);
      }
    };
    visitNodes(root);
    return { core, imported };
  }

  private getTargetClassInfo(info: NodeInfo): [string, 'new' | 'core' | 'import'] {
    const classMap = new Map([
      ['text', 'TextObject'],
      ['text-input', 'TextInputObject'],
      ['text-area', 'TextAreaObject'],
      ['button', 'ButtonObject'],
      ['checkbox', 'CheckboxObject'],
      ['radio-button', 'RadioButtonObject'],
      ['dropdown', 'DropdownObject'],
      ['select', 'DropdownObject'],
    ]);
    const classAlias = info.options.find(opt => classMap.has(opt));
    if (classAlias != null)
      return [classMap.get(classAlias)!, 'core'];
    const classOption = info.options.find(o => o.startsWith('class='));
    if (classOption != null) {
      const className = classOption.substring(6).trim();
      return [className, 'import'];
    }
    if (!htmlTags.includes(info.nodeType as any) || info.options.includes('class')) {
      const prefix = this.opt.selectorPrefix;
      return [capitalize(convertName(info.nodeType.substring(prefix.length))) + 'Object', 'import'];
    }
    if (info.children.length === 0) {
      if (info.nodeType === 'input') {
        if (info.typeAttr === 'checkbox')
          return ['CheckboxObject', 'core'];
        if (info.typeAttr === 'radio')
          return ['RadioButtonObject', 'core'];
        return ['TextInputObject', 'core'];
      }
      if (info.nodeType === 'button') {
        return ['ButtonObject', 'core'];
      }
      if (info.nodeType === 'textarea') {
        return ['TextAreaObject', 'core'];
      }
      if (info.nodeType === 'select') {
        return ['DropdownObject', 'core'];
      }
      return ['TextObject', 'core'];
    }
    return [info.className, 'new'];
  }

  private createRelativePath(path1: string[], path2: string[]) {
    const count = this.comparePathItems(path1, path2);
    const diff = path1.length - count;
    const prefix = (diff === 0) ? './' : '../'.repeat(diff);
    return prefix + path2.slice(count).join('/');
  }

  private comparePathItems(path1: string[], path2: string[]) {
    let i = 0;
    while (path1.length > i && path2.length > i && path1[i] === path2[i]) { i++; }
    return i;
  }

}
