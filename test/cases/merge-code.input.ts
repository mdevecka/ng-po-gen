import { TextObject, TextInputObject, PageObject } from 'puppeteer-objects';

export class MergeCodeObject extends PageObject {
  get header() { return this.createChild(TextObject, 'header[_header]'); }
  get main() { return this.createChild(MergeCodeMainObject, 'main[_main]'); }
}

export class MergeCodeMainObject extends PageObject {
  get itemList() { return this.createList(MergeCodeMainItemObject, '> div[_item_list]'); }
  // custom
  get firstItem() { return this.itemList.get(0); }
  get secondItem() { return this.itemList.get(1); }
}

export class MergeCodeMainItemObject extends PageObject {
  get nameInput() { return this.createChild(TextInputObject, '> input[_nameInput]'); }
}
