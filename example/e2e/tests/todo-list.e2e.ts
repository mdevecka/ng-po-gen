import { Browser, Page, launch } from 'puppeteer';
import { ObjectContext, waitUntil, retry } from 'puppeteer-page-objects';
import { TodoListObject } from './page-objects/components/todo-list.po';

describe('todo-list', function() {

  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page?.close();
  });

  afterAll(async () => {
    await browser?.close();
  });

  async function createDefaultState() {
    await page.goto('http://localhost:4200/todo-list?filter=all');
    await page.setViewport({ width: 1080, height: 1024 });
    const app = new TodoListObject(new ObjectContext(page, ['todo-list']));
    await waitUntil(async () => !(await app.loadingText.visible));
    await waitUntil(async () => (await app.itemList.length) > 0);
    return app;
  }

  it('default state', async function() {
    const app = await createDefaultState();
    expect(await app.itemList.map(i => i.nameText.text)).toStrictEqual(['buy bannanas', 'do laundry', 'order new sofa']);
    expect(await app.itemList.map(i => i.completed)).toStrictEqual([false, true, false]);
    expect(await app.footer.itemsLeft.text).toBe('2 items left');
  });

  it('test task complete', async function() {
    const app = await createDefaultState();
    await app.itemList.get(0).statusButton.click();
    await retry([
      () => expect(app.completeCount).resolves.toEqual(2),
      () => expect(app.footer.itemsLeft.text).resolves.toEqual('1 item left'),
      () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'do laundry', 'order new sofa']),
      () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([true, true, false]),
    ]);
  });

  it('test task delete', async function() {
    const app = await createDefaultState();
    app.itemList.get(2).deleteButton.click();
    await retry([
      () => expect(app.itemList.length).resolves.toEqual(2),
      () => expect(app.footer.itemsLeft.text).resolves.toEqual('1 item left'),
      () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'do laundry']),
      () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([false, true]),
    ]);
  });

  it('test create task', async function() {
    const app = await createDefaultState();
    await app.header.newTaskName.type('wash car\n');
    await retry([
      () => expect(app.itemList.length).resolves.toEqual(4),
      () => expect(app.footer.itemsLeft.text).resolves.toEqual('3 items left'),
      () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'do laundry', 'order new sofa', 'wash car']),
      () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([false, true, false, false]),
    ]);
  });

  it('test edit task name', async function() {
    const app = await createDefaultState();
    const item = app.itemList.get(0);
    await item.editButton.click();
    await waitUntil(() => item.nameInput.focused);
    await item.nameInput.type('2\n');
    await retry(() => expect(item.nameText.text).resolves.toEqual('buy bannanas2'));
  });

  it('test filter active', async function() {
    const app = await createDefaultState();
    await app.footer.filterActiveButton.click();
    await retry([
      () => expect(app.itemList.length).resolves.toEqual(2),
      () => expect(app.completeCount).resolves.toEqual(0),
      () => expect(app.footer.itemsLeft.text).resolves.toEqual('2 items left'),
      () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'order new sofa']),
      () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([false, false]),
    ]);
  });

  it('test toggle complete all', async function() {
    const app = await createDefaultState();
    await app.header.toggleCompleteButton.click();
    await retry([
      () => expect(app.itemList.length).resolves.toEqual(3),
      () => expect(app.completeCount).resolves.toEqual(3),
      () => expect(app.footer.itemsLeft.text).resolves.toEqual('0 items left'),
      () => expect(app.itemList.map(i => i.nameText.text)).resolves.toStrictEqual(['buy bannanas', 'do laundry', 'order new sofa']),
      () => expect(app.itemList.map(i => i.completed)).resolves.toStrictEqual([true, true, true]),
    ]);
  });

});
