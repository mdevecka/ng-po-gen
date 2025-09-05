import { Component, ChangeDetectionStrategy, HostListener, ElementRef, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoListStateStore } from '../../state';

@Component({
  selector: 'header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

  taskName = this.todoListState.newTaskName;
  inputText = viewChild<ElementRef>("input");

  constructor(private todoListState: TodoListStateStore) {
  }

  @HostListener('document:keydown.enter', ["$event"])
  documentKeyDown(event: KeyboardEvent) {
    if (event.target !== this.inputText().nativeElement || this.taskName() === "")
      return;
    this.todoListState.createItem(this.taskName());
    this.todoListState.setNewTaskName("");
  }

  toggleComplete() {
    this.todoListState.toggleCompleteAll();
  }

  setTaskName(text: string) {
    this.todoListState.setNewTaskName(text);
  }

}
