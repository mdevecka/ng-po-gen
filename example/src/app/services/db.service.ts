import { Injectable } from '@angular/core';
import { of, timer } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { TodoItem } from '../data';

@Injectable({ providedIn: 'root' })
export class DbService {

  private data: TodoItem[];

  constructor() {
    this.data = [
      { id: 1, text: "buy bannanas", completed: false },
      { id: 2, text: "do laundry", completed: true },
      { id: 3, text: "order new sofa", completed: false },
    ];
  }

  getItems() {
    return of(this.data).pipe(delay(1000));
  }

  saveItems(items: TodoItem[]) {
    return timer(1000).pipe(tap(() => {
      this.data = items;
    }), map(() => ({ result: "success" })));
  }

}
