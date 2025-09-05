import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { TodoListStateStore } from '../../state';
import { ItemFilterType } from '../../state';

interface ButtonModel {
  text: string;
  filter: ItemFilterType;
}

@Component({
  selector: 'footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {

  readonly incompleteCount = this.todoListState.incompleteCount;
  readonly filter = this.todoListState.filter;
  readonly plural = computed(() => this.incompleteCount() !== 1);
  readonly hasItems = computed(() => this.todoListState.items() != null);

  readonly buttons: ButtonModel[] = [{ text: "All", filter: "all" }, { text: "Active", filter: "active" }, { text: "Completed", filter: "completed" }];

  constructor(private todoListState: TodoListStateStore) {
  }

  onFilterChange(filter: ItemFilterType) {
    this.todoListState.changeFilter(filter);
  }

}
