import { Component, ChangeDetectionStrategy, Injector, WritableSignal, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header';
import { FooterComponent } from './footer';
import { TodoItemComponent } from './todo-item';
import { TodoListStateStore } from '../state';
import { TodoItem } from '../data';

@Component({
  selector: 'todo-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {

  readonly items = this.todoListState.filteredItems;
  readonly loading = this.todoListState.loading;

  constructor(private todoListState: TodoListStateStore) {
  }

  ngOnInit() {
    this.todoListState.loadItems(false);
  }

  onTextChanged(item: TodoItem, text: string) {
    this.todoListState.changeItemText(item.id, text);
  }

  onCompletedChanged(item: TodoItem, completed: boolean) {
    this.todoListState.changeItemComplete(item.id, completed);
  }

  onItemDelete(item: TodoItem) {
    this.todoListState.removeItem(item.id);
  }

}
