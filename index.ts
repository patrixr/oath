enum Status {
  PENDING,
  DONE,
  FAILED
}

type OathCallback<T> = (res: T) => any

type OathLogic<T> = (done: OathCallback<T>, fail: OathCallback<any>) => any

/**
 * The Promise implementation
 *
 * @export
 * @class Oath
 * @template T
 */
export class Oath<T = any> {

  status : Status = Status.PENDING
  result : T | null = null
  error  : any = null
  done = false

  successHandlers : OathCallback<T>[]   = []
  errorHandlers   : OathCallback<any>[] = []

  static isOath<D>(val : unknown) : val is Oath<D> {
    return !!val
      && (typeof val === 'object' || typeof val === 'function')
      && typeof (val as any).then === 'function'
  }

  static resolve<D>(val : D | Oath<D>) : Oath<D> {
    if (this.isOath<D>(val)) return val;
    return new Oath<D>((good) => good(val));
  }

  static reject(err: any) : Oath<any> {
    if (this.isOath<any>(err)) {
      return err
        .catch(e => this.reject(e))
        .then(e => this.reject(e))
    }

    return new Oath<any>((_, bad) => bad(err));
  }

  constructor(func: OathLogic<T>) {
    const resolve = (res: T | Oath<T>) => {
      if (Oath.isOath<T>(res)) {
        res.then(resolve).catch(reject)
        return;
      }

      if (!this.done) {
        this.status = Status.DONE
        this.result = res;
        this.done = true;
        this.successHandlers.forEach(h => h(res));
      }
    }

    const reject = (err: any) => {
      if (!this.done) {
        this.status = Status.FAILED
        this.error = err;
        this.done = true;
        this.errorHandlers.forEach(h => h(err));
      }
    }

    try {
      func(resolve, reject);
    } catch (err : any) {
      reject(err);
    }
  }

  onResult(success: OathCallback<T>, failure: OathCallback<any>) {
    if (this.status === Status.PENDING) {
      this.successHandlers.push(success)
      this.errorHandlers.push(failure)
      return;
    }

    if (this.status === Status.FAILED) {
      failure(this.error);
      return;
    }

    success(this.result!);
  }

  then(cb: OathCallback<T>) {
    return new Oath((good, bad) => {
      this.onResult(
        (res) => {
          try {
            good(cb(res));
          } catch (err: any) {
            bad(err);
          }
        },
        (err) => { bad(err) }
      )
    })
  }

  catch(cb: OathCallback<any>) {
    return new Oath((good, bad) => {
      this.onResult(
        (res) => { good(res) },
        (err) => {
          try {
            good(cb(err));
          } catch (e: any) {
            bad(e);
          }
        }
      )
    })
  }
}

