import { TextObject, PageObject } from 'puppeteer-page-objects';
import { HeaderObject } from './header/header.po';
import { TodoItemObject } from './todo-item/todo-item.po';
import { FooterObject } from './footer/footer.po';

export class TodoListObject extends PageObject {
  get header() { return this.createChild(HeaderObject, 'div > header[_header]'); }
  get itemList() { return this.createList(TodoItemObject, 'div > main > li > todo-item[_item_list]'); }
  get loadingText() { return this.createChild(TextObject, 'div > main > div[_loading_text]'); }
  get footer() { return this.createChild(FooterObject, 'div > footer[_footer]'); }
  // custom
  get completeCount() { return this.itemList.map(i => i.completed).then(l => l.filter(l => l).length); }
}
