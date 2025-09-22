import { build, emptyDir } from "jsr:@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  compilerOptions: {
    lib: ["ESNext"],
  },
  package: {
    // package.json properties
    name: "@xubaiwang/rc-dispose",
    version: Deno.args[0],
    description:
      "Reference counted explicit resource management in TypeScript.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/xubaiwang/rc-dispose.git",
    },
    bugs: {
      url: "https://github.com/xubaiwang/rc-dispose/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
