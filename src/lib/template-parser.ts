import { parse } from 'angular-html-parser';
import { Node, Element } from 'angular-html-parser/lib/compiler/src/ml_parser/ast.js';
import { readFileSync } from 'fs';
import { ComponentInfo, convertName, capitalize } from './utils.js';

export interface NodeInfo {
  propName: string;
  className: string;
  nodeType: string;
  typeAttr?: string;
  namePath: string[];
  selector?: string;
  selectorPath: string[];
  options: string[];
  children: NodeInfo[];
  node?: Element;
}

export interface TemplateParserOptions {
  attributePrefix: string;
}

export class TemplateParser {

  constructor(private opt: TemplateParserOptions) {
  }

  parse(info: ComponentInfo) {
    const contents = readFileSync(info.path, 'utf8');
    return this.parseTemplate(info.name, contents);
  }

  parseTemplate(templateName: string, templateText: string) {
    const { rootNodes, errors } = parse(templateText);
    if (errors.length > 0)
      throw errors;
    const nodeName = convertName(templateName);
    const root: NodeInfo = {
      propName: nodeName,
      className: this.getClassName([nodeName]),
      nodeType: 'body',
      namePath: [nodeName],
      selectorPath: [],
      options: [],
      children: [],
    };
    this.parseNodes(root, rootNodes);
    return root;
  }

  private parseNodes(parent: NodeInfo, nodes: Node[], path: string[] = []) {
    for (const node of nodes) {
      if (node instanceof Element) {
        const prefix = this.opt.attributePrefix;
        const idAttr = node.attrs.find(attr => attr.name.startsWith(prefix));
        const typeAttr = node.attrs.find(attr => attr.name === 'type');
        if (node.name === 'ng-container' || idAttr?.name === '__ignore') {
          this.parseNodes(parent, node.children, path);
        } else if (idAttr != null) {
          const name = convertName(idAttr.name.substring(prefix.length).replace(/_list$/, ''));
          const selector = `${node.name}[${idAttr.name}]`;
          const options = (idAttr.value ?? '').split(',').map(i => i.trim());
          const namePath = [...parent.namePath, name];
          const item: NodeInfo = {
            propName: name,
            className: this.getClassName(namePath),
            nodeType: node.name,
            typeAttr: typeAttr?.value,
            selector: idAttr.name,
            options: options,
            node: node,
            namePath: namePath,
            selectorPath: [...path, selector],
            children: [],
          };
          parent.children.push(item);
          this.parseNodes(item, node.children, ['']);
        } else {
          const selector = node.name;
          this.parseNodes(parent, node.children, [...path, selector]);
        }
      }
    }
  }

  private getClassName(namePath: string[]) {
    const name = namePath.map(p => capitalize(p)).join('');
    return name + 'Object';
  }

}
