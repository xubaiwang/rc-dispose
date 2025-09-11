function rc<T extends Disposable | AsyncDisposable>(
  value: T,
  options?: RcOptionsSimple,
): T;
function rc<T extends object>(
  value: T,
  options?: RcOptionsDispose,
): T & Disposable;
function rc<T extends object>(
  value: T,
  options?: RcOptionsAsyncDispose,
): T & AsyncDisposable;
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
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("count must be positive integer");
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
            Reflect.apply(dispose, target, []);
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
          } else {
            Reflect.apply(asyncDispose, target, []);
          }
        };
      } else {
        // fallback to object
        return Reflect.get(target, prop, receiver);
      }
    },
  }) as (T & (Disposable | AsyncDisposable));
}

export { rc };

export type RcOptions =
  | RcOptionsSimple
  | RcOptionsDispose
  | RcOptionsAsyncDispose;

export interface RcOptionsSimple {
  count?: number;
}

export interface RcOptionsDispose {
  count?: number;
  dispose?(): void;
}

export interface RcOptionsAsyncDispose {
  count?: number;
  asyncDispose?(): Promise<void>;
}
