export const increase = Symbol.for("rc-dispose.increase");

type WithIncrease = { [increase]: (n?: number) => number };

/**
 * Rc wrapped value.
 */
export type Rc<T> =
  & T
  & WithIncrease;

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
 * @param options extra options, see {@link RcOptionsSimple}
 * @returns reference counted disposable or async disposable
 */
export function rc<T extends object, const O extends RcOptions>(
  value: T,
  options: O,
): Rc<T> {
  // validate count
  let count = options?.count ?? 0;
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be non negative integer");
  }

  return new Proxy(value, {
    // intercept Symbol.dispose or Symbol.asyncDispose
    get(target, prop, receiver) {
      if (prop === Symbol.dispose) {
        const dispose = Reflect.get(target, prop, receiver) as
          | (() => void)
          | undefined;
        if (!dispose) return dispose;
        return function () {
          if (count > 0) {
            count -= 1;
          }
          if (count == 0) {
            return Reflect.apply(dispose, target, []);
          }
        };
      } else if (prop === Symbol.asyncDispose) {
        const asyncDispose = Reflect.get(
          target,
          prop,
          receiver,
        ) as (() => Promise<void> | undefined);
        if (!asyncDispose) return asyncDispose;
        return function () {
          if (count > 0) {
            count -= 1;
          }
          if (count == 0) {
            return Reflect.apply(asyncDispose, target, []);
          }
        };
      } else if (prop === increase) {
        return function (n: number = 1) {
          if (!Number.isInteger(n) || n < 0) {
            throw new RangeError("n must be non negative integer");
          }
          count += n;
          return count;
        };
      } else {
        // fallback to object
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as Rc<T>;
}
