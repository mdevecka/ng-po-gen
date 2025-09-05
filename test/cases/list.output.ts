import { TextObject, TextInputObject, ButtonObject, PageObject } from 'puppeteer-objects';

export class ListObject extends PageObject {
  get header() { return this.createChild(TextObject, 'header[_header]'); }
  get main() { return this.createChild(ListMainObject, 'main[_main]'); }
  get footer() { return this.createChild(TextObject, 'footer[_footer]'); }
}

export class ListMainObject extends PageObject {
  get itemList() { return this.createList(ListMainItemObject, '> div[_item_list]'); }
}

export class ListMainItemObject extends PageObject {
  get nameInput() { return this.createChild(TextInputObject, '> input[_nameInput]'); }
  get okButton() { return this.createChild(ButtonObject, '> button[_okButton]'); }
}
