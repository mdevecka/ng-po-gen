interface ReadonlyArray<T> {
  at(index: number): T;
  copy(): T[];
  empty(): boolean;
  first(cond?: (item: T) => boolean): T;
  last(cond?: (item: T) => boolean): T;
  groupBy<S>(selector: (item: T) => S): Map<S, T[]>;
  orderBy(...funcs: { (item: T): number }[]): T[];
  distinct(): T[];
  countOf(filter: (item: T) => boolean): number;
  sum(selector: (item: T) => number): number;
  max(selector: (item: T) => number): number;
  min(selector: (item: T) => number): number;
  selectMax(selector: (item: T) => number): T;
  selectMin(selector: (item: T) => number): T;
  flat<S>(depth?: number): S[];
  flatMap<S>(selector: (item: T) => S[], index?: number, array?: T[]): S[];
}

interface Array<T> extends ReadonlyArray<T> {
  addFrom(arr: Iterable<T>): void;
  insert(index: number, item: T): void;
  removeAt(index: number): void;
  remove(item: T): boolean;
  removeWhere(cond: (item: T, index: number) => boolean): number;
  clear(): void;
}

interface ReadonlySet<T> {
  copy(): Set<T>;
  toArray(): T[];
  empty(): boolean;
  first(cond?: (item: T) => boolean): T;
  filter(cond: (item: T) => boolean): Set<T>;
  find(cond: (item: T) => boolean): T;
  some(cond: (item: T) => boolean): boolean;
  every(cond: (item: T) => boolean): boolean;
  countOf(filter: (item: T) => boolean): number;
  sum(selector: (item: T) => number): number;
  max(selector: (item: T) => number): number;
  min(selector: (item: T) => number): number;
  selectMax(selector: (item: T) => number): T;
  selectMin(selector: (item: T) => number): T;
}

interface Set<T> extends ReadonlySet<T> {
  addFrom(arr: Iterable<T>): void;
}

interface ReadonlyMap<K, V> {
  toArray(): [K, V][];
  empty(): boolean;
  find(filter: (item: [K, V]) => boolean): [K, V];
  mapValues<S>(func: (value: V) => S): Map<K, S>;
}

interface Map<K, V> extends ReadonlyMap<K, V> {
  ensure(key: K, initFunc: (key: K) => V): V;
  change(key: K, func: (value: V) => V);
}

Array.prototype.at = function(index: number) {
  let nindex = (index % this.length + this.length) % this.length;
  return this[nindex];
}

Array.prototype.copy = function() {
  return this.concat();
}

Array.prototype.empty = function() {
  return this.length === 0;
}

Array.prototype.first = function <T>(cond?: (item: T) => boolean) {
  for (let item of this) {
    if (cond == null || cond(item))
      return item;
  }
  return undefined;
}

Array.prototype.last = function <T>(cond?: (item: T) => boolean) {
  for (let i = this.length - 1; i >= 0; i--) {
    let item = this[i];
    if (cond == null || cond(item))
      return item;
  }
  return undefined;
}

Array.prototype.groupBy = function <T, S>(selector: (item: T) => S): Map<S, T[]> {
  let result = new Map<S, T[]>();
  for (let item of this) {
    let key = selector(item);
    let list = result.get(key);
    if (list == null) {
      list = [];
      result.set(key, list);
    }
    list.push(item);
  }
  return result;
}

Array.prototype.orderBy = function <T>(...funcs: { (item: T): number }[]): T[] {
  let list: T[] = Array.from(this);
  list.sort((i1, i2) => {
    for (let i = 0; i < funcs.length; i++) {
      let func = funcs[i];
      let diff = func(i1) - func(i2)
      if (diff !== 0)
        return diff;
    }
    return 0;
  });
  return list;
}

Array.prototype.distinct = function <T>(): T[] {
  return Array.from(new Set(this));
}

Array.prototype.countOf = function <T>(filter: (item: T) => boolean) {
  let count = 0;
  for (let item of this) {
    if (filter(item)) { count++; }
  }
  return count;
}

Array.prototype.sum = function <T>(selector: (item: T) => number) {
  let result = 0;
  for (let item of this) {
    result += selector(item);
  }
  return result;
}

Array.prototype.max = function <T>(selector: (item: T) => number) {
  if (this.length === 0)
    return undefined;
  let result = selector(this[0]);
  for (let i = 1; i < this.length; i++) {
    let item = selector(this[i]);
    if (item > result) { result = item; }
  }
  return result;
}

Array.prototype.min = function <T>(selector: (item: T) => number) {
  if (this.length === 0)
    return undefined;
  let result = selector(this[0]);
  for (let i = 1; i < this.length; i++) {
    let item = selector(this[i]);
    if (item < result) { result = item; }
  }
  return result;
}

Array.prototype.selectMax = function <T>(selector: (item: T) => number) {
  let best: T = undefined;
  let maxValue: number;
  for (let item of this) {
    let value = selector(item);
    if (value == null)
      continue;
    if (best == null || value > maxValue) {
      best = item;
      maxValue = value;
    }
  }
  return best;
}

Array.prototype.selectMin = function <T>(selector: (item: T) => number) {
  let best: T = undefined;
  let minValue: number;
  for (let item of this) {
    let value = selector(item);
    if (value == null)
      continue;
    if (best == null || value < minValue) {
      best = item;
      minValue = value;
    }
  }
  return best;
}

Array.prototype.addFrom = function <T>(arr: Iterable<T>) {
  for (const item of arr) {
    this.push(item);
  }
}

Array.prototype.insert = function <T>(index: number, item: T) {
  this.splice(index, 0, item);
}

Array.prototype.removeAt = function <T>(index: number) {
  for (let i = index; i < this.length - 1; i++) {
    this[i] = this[i + 1];
  }
  this.length = this.length - 1;
}

Array.prototype.remove = function <T>(item: T): boolean {
  let index = this.indexOf(item);
  if (index === -1)
    return false;
  this.removeAt(index);
  return true;
}

Array.prototype.removeWhere = function <T>(cond: (item: T, index: number) => boolean): number {
  let count = 0;
  let nindex = 0;
  for (let i = 0; i < this.length; i++) {
    let item = this[i];
    if (cond(item, i)) {
      count++;
      continue;
    }
    this[nindex] = item;
    nindex++;
  }
  this.length -= count;
  return count;
}

Array.prototype.clear = function() {
  this.length = 0;
}

if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth: number = 1) {
    const flatten = function(arr, depth) {
      if (depth < 1) {
        return arr.slice();
      }
      return arr.reduce(function(acc, val) {
        return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
      }, []);
    };
    return flatten(this, depth);
  };
}

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function <T, S>(selector: (item: T, index: number, array: T[]) => S[]) {
    let res: S[] = [];
    for (let i = 0; i < this.length; i++) {
      let items = selector(this[i], i, this);
      for (let item of items) {
        res.push(item);
      }
    }
    return res;
  };
}

Set.prototype.copy = function() {
  return new Set(this);
}

Set.prototype.toArray = function() {
  return Array.from(this);
}

Set.prototype.empty = function() {
  return this.size === 0;
}

Set.prototype.first = function <T>(cond?: (item: T) => boolean) {
  for (let item of this) {
    if (cond == null || cond(item))
      return item;
  }
  return undefined;
}

Set.prototype.filter = function <T>(cond: (item: T) => boolean) {
  let result = new Set<T>();
  for (let item of this) {
    if (cond(item)) {
      result.add(item);
    }
  }
  return result;
}

Set.prototype.find = function <T>(cond: (item: T) => boolean) {
  for (let item of this) {
    if (cond(item))
      return item;
  }
  return undefined;
}

Set.prototype.some = function <T>(cond: (item: T) => boolean) {
  for (let item of this) {
    if (cond(item))
      return true;
  }
  return false;
}

Set.prototype.every = function <T>(cond: (item: T) => boolean) {
  for (let item of this) {
    if (!cond(item))
      return false;
  }
  return true;
}

Set.prototype.countOf = function <T>(filter: (item: T) => boolean) {
  let count = 0;
  for (let item of this) {
    if (filter(item)) { count++; }
  }
  return count;
}

Set.prototype.sum = function <T>(selector: (item: T) => number) {
  let result = 0;
  for (let item of this) {
    result += selector(item);
  }
  return result;
}

Set.prototype.max = function <T>(selector: (item: T) => number) {
  let result: number = undefined;
  for (let item of this) {
    let value = selector(item);
    if (result == null || value > result) { result = item; }
  }
  return result;
}

Set.prototype.min = function <T>(selector: (item: T) => number) {
  let result: number = undefined;
  for (let item of this) {
    let value = selector(item);
    if (result == null || value < result) { result = item; }
  }
  return result;
}

Set.prototype.selectMax = function <T>(selector: (item: T) => number) {
  let best: T = undefined;
  let maxValue: number;
  for (let item of this) {
    let value = selector(item);
    if (value == null)
      continue;
    if (best == null || value > maxValue) {
      best = item;
      maxValue = value;
    }
  }
  return best;
}

Set.prototype.selectMin = function <T>(selector: (item: T) => number) {
  let best: T = undefined;
  let minValue: number;
  for (let item of this) {
    let value = selector(item);
    if (value == null)
      continue;
    if (best == null || value < minValue) {
      best = item;
      minValue = value;
    }
  }
  return best;
}

Set.prototype.addFrom = function <T>(arr: Iterable<T>) {
  for (const item of arr) {
    this.add(item);
  }
}

Map.prototype.toArray = function <K, V>() {
  return Array.from(this) as [K, V][];
}

Map.prototype.empty = function() {
  return this.size === 0;
}

Map.prototype.find = function <K, V>(filter: (item: [K, V]) => boolean): [K, V] {
  for (let pair of this) {
    if (filter(pair))
      return pair;
  }
  return undefined;
}

Map.prototype.mapValues = function <K, V, S>(func: (value: V) => S): Map<K, S> {
  const res = new Map<K, S>();
  for (let pair of this) {
    res.set(pair[0], func(pair[1]));
  }
  return res;
}

Map.prototype.ensure = function <K, V>(key: K, initFunc: (key: K) => V) {
  let value = this.get(key);
  if (value == null) {
    value = initFunc(key);
    this.set(key, value);
  }
  return value;
}

Map.prototype.change = function <K, V>(key: K, func: (value: V) => V) {
  let value = this.get(key);
  this.set(key, func(value));
}

