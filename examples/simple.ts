import { rc } from "../mod.ts";

class LogWhenDispose {
  constructor(public name: string) {}
  [Symbol.dispose]() {
    console.log(`${this.name} is disposed`);
  }
}

using _a = new LogWhenDispose("a");

// b need two using to dispose.
const b = rc(new LogWhenDispose("b"), { count: 2 });
using _b1 = b;
using _b2 = b;
