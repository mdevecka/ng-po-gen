import { PageObject } from 'puppeteer-objects';
import { HeaderObject } from '@my-lib/header.po';
import { TextInputObject } from '@my-lib/text-input.po';
import { ButtonObject } from 'puppeteer-objects';

export class MergeImportsObject extends PageObject {
  get header() { return this.createChild(HeaderObject, 'header[_header]'); }
  get main() { return this.createChild(MergeImportsMainObject, 'main[_main]'); }
  get footer() { return this.createChild(FooterObject, 'footer[_footer]'); }
}

export class MergeImportsMainObject extends PageObject {
  get nameInput() { return this.createChild(TextInputObject, '> input[_nameInput]'); }
  get okButton() { return this.createChild(ButtonObject, '> button[_okButton]'); }
}
