import { TextInputObject, CheckboxObject, RadioButtonObject, DropdownObject, TextAreaObject, ButtonObject, PageObject } from 'puppeteer-objects';

export class BasicObject extends PageObject {
  get main() { return this.createChild(BasicMainObject, 'main[_main]'); }
}

export class BasicMainObject extends PageObject {
  get nameInput() { return this.createChild(TextInputObject, '> input[_nameInput]'); }
  get hasCarCheckbox() { return this.createChild(CheckboxObject, '> input[_hasCarCheckbox]'); }
  get yesRadioButton() { return this.createChild(RadioButtonObject, '> input[_yesRadioButton]'); }
  get noRadioButton() { return this.createChild(RadioButtonObject, '> input[_noRadioButton]'); }
  get favoriteFood() { return this.createChild(DropdownObject, '> select[_favoriteFood]'); }
  get comment() { return this.createChild(TextAreaObject, '> textarea[_comment]'); }
  get okButton() { return this.createChild(ButtonObject, '> button[_okButton]'); }
}
