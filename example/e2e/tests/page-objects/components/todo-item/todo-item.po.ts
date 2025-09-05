import { ButtonObject, TextInputObject, TextObject, PageObject } from 'puppeteer-page-objects';

export class TodoItemObject extends PageObject {
  get statusButton() { return this.createChild(ButtonObject, 'div > div > button[_status_button]'); }
  get nameInput() { return this.createChild(TextInputObject, 'div > div > div > div > input[_name_input]'); }
  get nameText() { return this.createChild(TextObject, 'div > div > div > div > div[_name_text]'); }
  get editButton() { return this.createChild(ButtonObject, 'div > div > button[_edit_button]'); }
  get deleteButton() { return this.createChild(ButtonObject, 'div > div > button[_delete_button]'); }
  // custom
  get completed() { return this.statusButton.hasClass('fa-ok'); }
}
