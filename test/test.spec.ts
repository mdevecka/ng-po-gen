import { TemplateParser } from '../src/lib/template-parser.js';
import { PageObjectBuilder } from '../src/lib/page-object-builder.js';
import { ComponentInfo } from '../src/lib/utils.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

async function testFunc(name: string, template: string, inputSource: string | null, outputSource: string, componentRef: Map<string, ComponentInfo> = new Map()) {
  const parser = new TemplateParser({ attributePrefix: '_' });
  const builder = new PageObjectBuilder({ outputDir: '_', eol: 'unix', selectorPrefix: '', lib: 'puppeteer-objects' });
  const root = parser.parseTemplate(name, template);
  const res = await builder.getSourceCode(inputSource, root, componentRef);
  expect(res).toBe(outputSource);
}

async function testFromFiles(name: string, componentRef: Map<string, ComponentInfo> = new Map()) {
  const dir = join(process.cwd(), 'test', 'cases');
  const filePath = join(dir, `${name}.html`);
  const inputFile = join(dir, `${name}.input.ts`);
  const outputFile = join(dir, `${name}.output.ts`);
  const template = readFileSync(filePath, 'utf8');
  const inputSource = (existsSync(inputFile)) ? readFileSync(inputFile, 'utf8') : null;
  const outputSource = readFileSync(outputFile, 'utf8');
  await testFunc(name, template, inputSource, outputSource, componentRef);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testGenOutput(name: string, componentRef: Map<string, ComponentInfo> = new Map()) {
  const dir = join(process.cwd(), 'test', 'cases');
  const filePath = join(dir, `${name}.html`);
  const inputFile = join(dir, `${name}.input.ts`);
  const outputFile = join(dir, `${name}.output.ts`);
  const template = readFileSync(filePath, 'utf8');
  const inputSource = (existsSync(inputFile)) ? readFileSync(inputFile, 'utf8') : null;
  const parser = new TemplateParser({ attributePrefix: '_' });
  const builder = new PageObjectBuilder({ outputDir: '_', eol: 'unix', selectorPrefix: '', lib: 'puppeteer-objects' });
  const root = parser.parseTemplate(name, template);
  const res = await builder.getSourceCode(inputSource, root, componentRef);
  writeFileSync(outputFile, res);
}

describe('angular page object generator', function() {

  it('basic', async function() {
    await testFromFiles('basic');
    await testFromFiles('basic-explicit');
  });

  it('list', async function() {
    await testFromFiles('list');
  });

  it('custom', async function() {
    await testFromFiles('custom');
    await testFromFiles('custom-with-refs', new Map([
      ['CustomWithRefsObject', {
        name: 'custom',
        className: 'CustomWithRefsObject',
        pathItems: [],
        path: '_',
      }],
      ['SpecialFooterObject', {
        name: 'special-footer',
        className: 'SpecialFooterObject',
        pathItems: ['special', 'footer'],
        path: '_',
      }]
    ]));
  });

  it('merge-imports', async function() {
    await testFromFiles('merge-imports');
  });

  it('merge-code', async function() {
    await testFromFiles('basic');
  });

});
