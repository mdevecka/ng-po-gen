import { TextObject, ButtonObject, PageObject } from 'puppeteer-page-objects';

export class FooterObject extends PageObject {
  get itemsLeft() { return this.createChild(TextObject, 'div > div > div[_items_left]'); }
  get filterButtonList() { return this.createList(ButtonObject, 'div > div > button[_filter_button_list]'); }
  // custom
  get filterAllButton() { return this.filterButtonList.get(0); }
  get filterActiveButton() { return this.filterButtonList.get(1); }
  get filterCompletedButton() { return this.filterButtonList.get(2); }
}
