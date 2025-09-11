# rc-dispose

[![JSR](https://jsr.io/badges/@xubaiwang/rc-dispose)](https://jsr.io/@xubaiwang/rc-dispose)

Reference counted explicit resource management in TypeScript.

## Usage

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

## Comparison with other approaches

- `FinalizationRegistry`: not guranteed to be called
- ordinary `using`: cannot span across scopes

## Ceveats

- identity from ownership to refcount is not guranteed (c.f. Rust `Rc`)
- all known ceveats from `Proxy`
