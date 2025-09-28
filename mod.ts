const cloneSymbol = Symbol.for("rc-dispose.clone");
const countSymbol = Symbol.for("rc-dispose.count");

export { cloneSymbol as clone, countSymbol as count };

type RcManagement<T> = {
  /**
   * This is dangerous.
   */
  [countSymbol](n?: number): number;
  [cloneSymbol](): T;
};

/**
 * Rc wrapped value.
 */
export type Rc<T> =
  & T
  & RcManagement<T>;

/**
 * Extra options of {@link rc}.
 */
export interface RcOptions {
  /** The initial count of rc. */
  count?: number;
}

/**
 * Wrap a disposable or async disposable value in RC,
 * so that it have to be disposed multiple times to actually dispose it.
 *
 * @param value the value to wrap
 * @param options extra options, see {@link RcOptions}
 * @returns reference counted disposable or async disposable
 */
export function rc<T extends object, const O extends RcOptions>(
  value: T,
  options?: O,
): Rc<T> {
  const validated = validateOptions(options);
  const state = { ...validated };

  const proxy = new Proxy(value, {
    get(target, prop, receiver) {
      switch (prop) {
        // dispose
        case Symbol.dispose: {
          const dispose = Reflect.get(target, prop, receiver) as
            | (() => void)
            | undefined;
          if (!dispose) return dispose;
          return function () {
            if (state.count > 0) {
              state.count -= 1;
            }
            if (state.count == 0) {
              return Reflect.apply(dispose, target, []);
            }
          };
        }
        // async dispose
        case Symbol.asyncDispose: {
          const asyncDispose = Reflect.get(
            target,
            prop,
            receiver,
          ) as (() => Promise<void> | undefined);
          if (!asyncDispose) return asyncDispose;
          return function () {
            if (state.count > 0) {
              state.count -= 1;
            }
            if (state.count == 0) {
              return Reflect.apply(asyncDispose, target, []);
            }
          };
        }
        // Symbol.for("rc-dispose.clone")
        case cloneSymbol: {
          return function (): Rc<T> {
            state.count += 1;
            return proxy;
          };
        }
        // Symbol.for("rc-dispose.count")
        case countSymbol: {
          return function (n?: number | ((_: number) => number)): number {
            // no n => getter
            if (!n) return state.count;

            if (n instanceof Function) {
              const result = n(state.count);
              if (!Number.isInteger(result) || result < 0) {
                throw new RangeError("n must return non negative integer");
              }
              state.count = result;
              return state.count;
            } else {
              if (!Number.isInteger(n) || n < 0) {
                throw new RangeError("n must be non negative integer");
              }
              state.count = n;
              return state.count;
            }
          };
        }
        // fallback to object
        default: {
          return Reflect.get(target, prop, receiver);
        }
      }
    },
  }) as Rc<T>;

  return proxy;
}

/**
 * Validate rc options.
 */
function validateOptions(options?: RcOptions): Required<RcOptions> {
  const count = options?.count ?? 1;
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be non negative integer");
  }
  return {
    count,
  };
}
