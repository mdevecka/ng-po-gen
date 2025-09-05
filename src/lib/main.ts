import { findComponents } from './utils.js';
import { TemplateParser } from './template-parser.js';
import { PageObjectBuilder } from './page-object-builder.js';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import pc from 'picocolors';

export interface CmdLineOptions {
  sourceDir: string;
  outputDir?: string;
  eol?: 'unix' | 'win';
  attributePrefix?: string;
  selectorPrefix?: string;
  lib?: string;
  overwrite?: boolean;
}

const cmdLineUsage = [
  {
    header: 'Angular Page Object Generator',
  },
  {
    header: 'Usage',
    content: [
      'ng-po-gen {underline source-dir} ...',
    ]
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'help',
        description: 'Print this usage guide.',
        typeLabel: ' '
      },
      {
        name: 'output-dir',
        description: 'Output directory. \nIf not specified source directory will be used.'
      },
      {
        name: 'eol',
        description: 'End of line characters, either "unix" or "win". Default is "unix".'
      },
      {
        name: 'attribute-prefix',
        description: 'Prefix of template attribute used by generator. Default is "_".'
      },
      {
        name: 'selector-prefix',
        description: 'Optional prefix of angular component tags.'
      },
      {
        name: 'lib',
        description: 'Import library name used for core page objects. Default is "puppeteer-page-objects".'
      },
      {
        name: 'overwrite',
        type: Boolean,
        description: 'Overwrite generated files instead of merge. Default is false.'
      },
    ]
  }
];

async function main() {
  if (process.argv.length < 3 || ['--help', '-h'].includes(process.argv[2])) {
    const usage = commandLineUsage(cmdLineUsage);
    console.log(usage);
    return;
  }
  const opt = commandLineArgs([
    { name: 'source-dir', defaultOption: true },
    { name: 'output-dir' },
    { name: 'eol' },
    { name: 'attribute-prefix' },
    { name: 'selector-prefix' },
    { name: 'lib' },
    { name: 'overwrite', type: Boolean },
  ], { camelCase: true }) as CmdLineOptions;
  if (opt.eol != null && !['unix', 'win'].includes(opt.eol))
    throw new Error(`unsupported eol '${opt.eol}'`);
  const parser = new TemplateParser({ attributePrefix: opt.attributePrefix ?? '_' });
  const builder = new PageObjectBuilder({
    outputDir: opt.outputDir ?? opt.sourceDir,
    eol: opt.eol ?? 'unix',
    selectorPrefix: opt.selectorPrefix ?? '',
    lib: opt.lib ?? 'puppeteer-page-objects',
    overwrite: opt.overwrite,
  });
  const comps = findComponents(opt.sourceDir);
  const compMap = new Map(comps.map(c => [c.className, c]));
  for (const comp of comps) {
    try {
      const root = parser.parse(comp);
      console.log(pc.greenBright(`• ${comp.name}`));
      await builder.createPageObject(root, compMap);
    }
    catch (err) {
      if (!Array.isArray(err))
        throw err;
      console.log(pc.redBright(`• ${comp.name}`));
      for (const error of err) {
        console.log(pc.whiteBright(error.msg));
      }
    }
  }
}

main().catch(err => console.error(err));
