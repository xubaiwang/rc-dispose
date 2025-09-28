import { assertEquals } from "@std/assert";
import { clone, rc } from "./mod.ts";

Deno.test("dispose clone", () => {
  let called = 0;

  const a = {
    [Symbol.dispose]() {
      called += 1;
    },
  };

  const a1 = rc(a);
  const a2 = a1[clone]();

  {
    using _a = a1;
  }
  assertEquals(called, 0);

  {
    using _a = a2;
  }
  assertEquals(called, 1);
});

Deno.test("asyncDispose clone", async () => {
  let called = 0;

  const a = {
    // deno-lint-ignore require-await
    async [Symbol.asyncDispose]() {
      called += 1;
    },
  };

  const a1 = rc(a);
  const a2 = a1[clone]();

  {
    await using _a = a1;
  }
  assertEquals(called, 0);

  {
    await using _a = a2;
  }
  assertEquals(called, 1);
});
