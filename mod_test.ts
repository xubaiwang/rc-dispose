import { assertEquals } from "@std/assert";
import { increase, rc } from "@xubaiwang/rc-dispose";

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
    // deno-lint-ignore require-await
    async [Symbol.asyncDispose]() {
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

Deno.test("dispose increment", () => {
  let called = 0;
  const a = {
    [Symbol.dispose]() {
      called += 1;
    },
  };
  const rcA = rc(a, { count: 2, increase });
  {
    using _a1 = rcA;
    rcA[increase]();
    using _a2 = rcA;
  }
  assertEquals(called, 0);
  {
    using _a3 = rcA;
  }
  assertEquals(called, 1);
});

Deno.test("async dispose increment", async () => {
  let called = 0;
  const a = {
    // deno-lint-ignore require-await
    async [Symbol.asyncDispose]() {
      called += 1;
    },
  };
  const rcA = rc(a, { count: 2, increase });
  {
    await using _a1 = rcA;
    rcA[increase]();
    await using _a2 = rcA;
  }
  assertEquals(called, 0);
  {
    await using _a3 = rcA;
  }
  assertEquals(called, 1);
});
