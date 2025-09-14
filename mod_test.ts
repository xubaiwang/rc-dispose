import { assertEquals } from "@std/assert";
import { rc } from "@xubaiwang/rc-dispose";

Deno.test("dispose", () => {
  let called = 0;
  const a = {
    [Symbol.dispose]() {
      called += 1;
    },
  };
  const rcA = rc(a, { count: 2 });
  {
    using _a1 = rcA;
    using _a2 = rcA;
  }
  assertEquals(called, 1);
});

Deno.test("async dispose", async () => {
  let called = 0;
  const a = {
    [Symbol.asyncDispose]() {
      called += 1;
    },
  };
  const rcA = rc(a, { count: 2 });
  {
    await using _a1 = rcA;
    await using _a2 = rcA;
  }
  assertEquals(called, 1);
});
