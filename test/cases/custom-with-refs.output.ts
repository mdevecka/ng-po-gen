import { TextObject, PageObject } from 'puppeteer-objects';
import { SpecialFooterObject } from './special/footer/special-footer.po';

export class CustomWithRefsObject extends PageObject {
  get header() { return this.createChild(HeaderObject, 'header[_header]'); }
  get main() { return this.createChild(TextObject, 'main[_main]'); }
  get footer() { return this.createChild(SpecialFooterObject, 'footer[_footer]'); }
}
