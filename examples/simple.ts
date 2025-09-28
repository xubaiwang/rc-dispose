import { clone, rc } from "../mod.ts";

class LogWhenDispose {
  constructor(public name: string) {}
  [Symbol.dispose]() {
    console.log(`${this.name} is disposed`);
  }
}

using a = rc(new LogWhenDispose("a"));
using _b = a[clone]();
