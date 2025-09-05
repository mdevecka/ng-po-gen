import { ButtonObject, TextInputObject, PageObject } from 'puppeteer-page-objects';

export class HeaderObject extends PageObject {
  get toggleCompleteButton() { return this.createChild(ButtonObject, 'div > div > button[_toggle_complete_button]'); }
  get newTaskName() { return this.createChild(TextInputObject, 'div > div > input[_new_task_name]'); }
}
