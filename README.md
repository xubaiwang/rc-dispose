# rc-dispose

Reference counted explicit resource management in TypeScript.

```typescript
import { rc } from "@xubaiwang/rc-dispose";

// foo is a disposable object
const foo = {
  [Symbol.dispose]() {
    console.log("this is disposed");
  }
}

// wrap it in rc
const rcFoo = rc(foo, { count: 2 });

// now foo need two using to dispose
using foo1 = rcFoo;
using foo2 = rcFoo;
```
