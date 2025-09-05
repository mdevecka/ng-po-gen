import { TextInputObject, CheckboxObject, RadioButtonObject, DropdownObject, TextAreaObject, ButtonObject, PageObject } from 'puppeteer-objects';

export class BasicExplicitObject extends PageObject {
  get main() { return this.createChild(BasicExplicitMainObject, 'main[_main]'); }
}

export class BasicExplicitMainObject extends PageObject {
  get nameInput() { return this.createChild(TextInputObject, '> custom-text-input[_nameInput]'); }
  get hasCarCheckbox() { return this.createChild(CheckboxObject, '> custom-checkbox[_hasCarCheckbox]'); }
  get yesRadioButton() { return this.createChild(RadioButtonObject, '> custom-radio-button[_yesRadioButton]'); }
  get noRadioButton() { return this.createChild(RadioButtonObject, '> custom-radio-button[_noRadioButton]'); }
  get favoriteFood() { return this.createChild(DropdownObject, '> custom-dropdown[_favoriteFood]'); }
  get comment() { return this.createChild(TextAreaObject, '> custom-textarea[_comment]'); }
  get okButton() { return this.createChild(ButtonObject, '> custom-button[_okButton]'); }
}
