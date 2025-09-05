import { Component, ChangeDetectionStrategy, ElementRef, HostListener, input, model, output, computed, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoItem } from '../../data';

@Component({
  selector: 'todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {

  text = model("");
  completed = model(false);
  editing = signal(false);
  initFrame = signal(true);

  delete = output();

  inputText = viewChild<ElementRef<HTMLInputElement>>("input");

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => this.initFrame.set(false), 500);
  }

  @HostListener('document:keydown.enter', ["$event"])
  documentKeyDown(event: KeyboardEvent) {
    if (event.target !== this.inputText().nativeElement || this.text() === "")
      return;
    this.editing.set(false);
  }

  toggleComplete() {
    this.completed.update(value => !value);
  }

  onEdit() {
    if (this.completed())
      return;
    this.editing.set(true);
    setTimeout(() => this.inputText().nativeElement.focus());
  }

  onInputBlur() {
    this.editing.set(false);
  }

  onDelete() {
    this.delete.emit();
  }

}
