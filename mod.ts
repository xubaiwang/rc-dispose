/**
 * Wrap a disposable or async disposable value in RC,
 * so that it have to be disposed multiple times to actually dispose it.
 *
 * @param value the value to wrap
 * @param options extra options, see {@link RcOptionsSimple}
 * @returns reference counted disposable or async disposable
 */
function rc<T extends Disposable | AsyncDisposable>(
  value: T,
  options?: RcOptionsSimple,
): T;
/**
 * Wrap a disposable or async disposable value in RC,
 * so that it have to be disposed multiple times to actually dispose it.
 *
 * @param value the value to wrap
 * @param options extra options, see {@link RcOptionsDispose}
 * @returns reference counted disposable or async disposable, with dispose overridden
 */
function rc<T extends object>(
  value: T,
  options?: RcOptionsDispose,
): T & Disposable;
/**
 * Wrap a disposable or async disposable value in RC,
 * so that it have to be disposed multiple times to actually dispose it.
 *
 * @param value the value to wrap
 * @param options extra options, see {@link RcOptionsDispose}
 * @returns reference counted disposable or async disposable, with asyncDispose overridden
 */
function rc<T extends object>(
  value: T,
  options?: RcOptionsAsyncDispose,
): T & AsyncDisposable;
/**
 * Wrap a disposable or async disposable value in RC,
 * so that it have to be disposed multiple times to actually dispose it.
 *
 * @param value the value to wrap
 * @param options extra options, see {@link RcOptionsDispose}
 * @returns reference counted disposable or async disposable, with both dispose and asyncDispose overridden
 */
function rc<T extends object>(
  value: T,
  options?: RcOptionsDispose & RcOptionsAsyncDispose,
): T & Disposable & AsyncDisposable;
function rc<T extends object>(
  value: T,
  options?: RcOptions,
): T & (Disposable | AsyncDisposable) {
  // validate count
  let count = options?.count ?? 1;
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be non negative integer");
  }

  // record dispose functions
  let optionDispose: (() => void) | undefined;
  let optionAsyncDispose: (() => Promise<void>) | undefined;
  if (options) {
    if ("dispose" in options) {
      optionDispose = options.dispose;
    }
    if ("asyncDispose" in options) {
      optionAsyncDispose = options.asyncDispose;
    }
  }

  return new Proxy(value, {
    // intercept Symbol.dispose or Symbol.asyncDispose
    get(target, prop, receiver) {
      if (prop === Symbol.dispose) {
        const dispose = optionDispose ??
          Reflect.get(target, prop, receiver) as (() => void) | undefined;
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
        const asyncDispose = optionAsyncDispose ??
          Reflect.get(
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
      } else if (options?.increment && prop == options.increment) {
        // TODO: need type
        return function (n: number = 1) {
          if (!Number.isInteger(n) || n < 0) {
            throw new RangeError("n must be non negative integer");
          }
          count += n;
        };
      } else {
        // fallback to object
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as (T & (Disposable | AsyncDisposable));
}

export { rc };

/**
 * Extra options of {@link rc}.
 */
export type RcOptions =
  | RcOptionsSimple
  | RcOptionsDispose
  | RcOptionsAsyncDispose;

export interface RcOptionsBase {
  /** The initial count of rc. */
  count?: number;
  /** Where to expose increment symbol. */
  increment?: string | symbol;
}

/**
 * Extra options of {@link rc}, simple options.
 */
export interface RcOptionsSimple extends RcOptionsBase {
}

/**
 * Extra options of {@link rc}, with dispose override.
 */
export interface RcOptionsDispose extends RcOptionsBase {
  /** Use custom `dispose` instead of the value's `Symbol.dispose`. */
  dispose?(): void;
}

/**
 * Extra options of {@link rc}, with async dispose override.
 */
export interface RcOptionsAsyncDispose extends RcOptionsBase {
  /** Use custom `asyncDispose` instead of the value's `Symbol.asyncDispose`. */
  asyncDispose?(): Promise<void>;
}
