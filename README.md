# Description

Allows to auto-generate page objects from Angular templates.<br>
Uses special HTML attributes to create named bindings for page objects.<br>
By default the attribute is prefixed by '_'.<br>
Options may be passed as a value to the attribute to denote usage.<br>
Currently available options are 'text', 'text-input', 'text-area', 'button', 'checkbox', 'radio-button', 'dropdown', 'select', 'class', 'class={class name}' and 'list'.<br>
The generator will try to auto detect the type from the html element (e.g. `<input type='checkbox'>` will automatically be resolved as CheckboxObject).<br>
Attribute names ending with '_list' will treated as list of items.<br>
Imports and custom code is preserved by default.<br>
Custom code needs to be separated by a single line comment.<br>
If you are using Puppeteer you can use package `npm i puppeteer-page-objects` for the base classes.<br>
Otherwise you need to implement base classes for PageObject, ObjectList, TextObject, ButtonObject, CheckboxObject, RadioButtonObject, DropdownObject, TextInputObject and TextAreaObject.<br>
For more information, please check the test cases inside the test folder or example todo-list application with e2e tests.<br>

## Installation

```bash
npm i ng-po-gen
```

## Usage

```bash
npx ng-po-gen ./src/app --target-dir ./e2e/page-objects
```
```
Angular Page Object Generator

Usage

  ng-po-gen source-dir ...

Options

  --help                      Print this usage guide.
  --output-dir string         Output directory.
                              If not specified source directory will be used.
  --eol string                End of line characters, either "unix" or "win".
                              Default is "unix".
  --attribute-prefix string   Prefix of template attribute used by generator.
                              Default is "_".
  --selector-prefix string    Optional prefix of angular component tags.
  --lib string                Import library name used for core page objects.
                              Default is "puppeteer-page-objects".
  --overwrite                 Overwrite generated files instead of merge.
                              Default is false.

```

## Result

### Source Angular Template
```html
  <header class="header" _header='class'></header>
  <main class="items">
    @if(!loading()){
      <li class="item-wrapper">
        @for(item of items();track item.id){
          <todo-item class="item" [text]="item.text" [completed]="item.completed" 
                     (textChange)="onTextChanged(item,$event)" (completedChange)="onCompletedChanged(item,$event)" 
                     (delete)="onItemDelete(item)" _item_list></todo-item>
        }
      </li>
    } @else {
      <div class="loading" _loading_text>
        LOADING...
      </div>
    }
  </main>
  <footer class="footer" _footer='class'></footer>
```

### Generated Page Object
```typescript
import { TextObject, PageObject } from 'puppeteer-page-objects';
import { HeaderObject } from './header/header.po';
import { TodoItemObject } from './todo-item/todo-item.po';
import { FooterObject } from './footer/footer.po';

export class TodoListObject extends PageObject {
  get header() { return this.createChild(HeaderObject, 'div > header[_header]'); }
  get itemList() { return this.createList(TodoItemObject, 'div > main > li > todo-item[_item_list]'); }
  get loadingText() { return this.createChild(TextObject, 'div > main > div[_loading_text]'); }
  get footer() { return this.createChild(FooterObject, 'div > footer[_footer]'); }
}
```

### Example Test
```typescript
  ...
  const app = new TodoListObject(new ObjectContext(page, ['todo-list']));
  await waitUntil(async () => !(await app.loadingText.visible));
  await waitUntil(async () => (await app.itemList.length) > 0);
  ...
  await app.header.newTaskName.type('wash car\n');
  await retry([
    () => expect(app.itemList.length).resolves.toEqual(4),
    () => expect(app.footer.itemsLeft.text).resolves.toEqual('3 items left'),
    () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'do laundry', 'order new sofa', 'wash car']),
    () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([false, true, false, false]),
  ]);
```

For more information check the full todo-list example app with e2e tests in the GitHub repository.
