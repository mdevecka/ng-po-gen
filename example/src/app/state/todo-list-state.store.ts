import { Injectable, signal, computed, effect } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TodoItem } from '../data';
import { DbService } from '../services';
import { produce } from 'immer';

export type ItemFilterType = "all" | "active" | "completed";

export interface TodoListState {
  items: TodoItem[];
  newTaskName: string;
  filter: ItemFilterType;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoListStateStore extends ComponentStore<TodoListState> {

  readonly items = this.selectSignal(x => x.items);
  readonly loading = this.selectSignal(x => x.loading);
  readonly filter = this.selectSignal(x => x.filter);
  readonly newTaskName = this.selectSignal(x => x.newTaskName);

  readonly incompleteCount = computed(() => this.items().countOf(i => !i.completed));
  readonly filteredItems = computed(() => {
    const filter = this.filter();
    const items = this.items();
    if (filter === "active") {
      return items.filter(i => !i.completed);
    } else if (filter === "completed") {
      return items.filter(i => i.completed);
    }
    return items;
  });

  constructor(private db: DbService) {
    super({
      items: null,
      newTaskName: "",
      filter: "all",
      loading: false,
    });
  }

  addItem(item: TodoItem) {
    this.setState(produce(state => { state.items.push(item); }));
  }

  createItem(text: string) {
    this.setState(produce(state => {
      let maxId = state.items.max(i => i.id);
      state.items.push({ id: maxId + 1, text: text, completed: false });
    }));
  }

  removeItem(id: number) {
    this.setState(produce(state => {
      let item = state.items.find(i => i.id === id);
      state.items.remove(item);
    }));
  }

  changeItemComplete(id: number, value: boolean) {
    this.setState(produce(state => {
      let item = state.items.find(i => i.id === id);
      item.completed = value;
    }));
  }

  changeItemText(id: number, text: string) {
    this.setState(produce(state => {
      let item = state.items.find(i => i.id === id);
      item.text = text;
    }));
  }

  toggleCompleteAll() {
    this.setState(produce(state => {
      let allCompleted = state.items.every(i => i.completed);
      for (let item of state.items) {
        item.completed = !allCompleted;
      }
    }));
  }

  changeFilter(filter: ItemFilterType) {
    this.setState(produce(state => { state.filter = filter; }));
  }

  setNewTaskName(text: string) {
    this.setState(produce(state => {
      state.newTaskName = text;
    }));
  }

  saveItems(items: TodoItem[]) {
    this.db.saveItems(items).subscribe({
      next: () => {
      },
      error: err => {
      }
    });
  }

  loadItems(reload = true) {
    if (!reload && this.items() != null)
      return;
    this.setState(produce(state => { state.loading = true }));
    this.db.getItems().subscribe({
      next: items => {
        this.setState(produce(state => {
          state.items = items;
          state.loading = false;
        }));
      },
      error: err => {
        this.setState(produce(state => { state.loading = false }));
      }
    });
  }

}
