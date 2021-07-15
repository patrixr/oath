import { Oath } from '../index'
import it from 'ava'

it('resolves the oath with the value', async (t) => {
  const res = await new Oath(
    (done) => done(3)
  )
  t.is(res, 3);
})

it('passes the value to the then callback', async (t) => {
  const res = await new Oath<number>(
    (done) => done(3)
  ).then(res => {
    return res + 1;
  })

  t.is(res, 4);
})

it('allows asynchronous logic', async (t) => {
  const res = await new Oath<number>(
    (done) => {
      setTimeout(() => done(3), 5)
    }
  ).then(res => {
    return res + 1;
  })

  t.is(res, 4);
})

it('allows returning another Oath in the then statement', async (t) => {
  const res = await new Oath<number>(
    (done) => done(3)
  ).then(val => {
    return new Oath((done) => {
      setTimeout(() => done(val + 97), 5)
    })
  }).then((val) => {
    t.is(val, 100);
    return val + 1;
  })

  t.is(res, 101);
})

it('creates a rejected oath with Oath.reject', async (t) => {
  let err : any

  try {
    await Oath.reject('hi')
  } catch (e) {
    err = e;
  }

  t.is(err, 'hi');
})

it('creates a resolved oath with Oath.resolve', async (t) => {
  const res = await Oath.resolve('hi').then((str) => {
    return str + '!'
  })
  t.is(res, 'hi!');
})

it('creates a resolved oath by passing an oath to Oath.resolve', async (t) => {
  const oath = new Oath(good => good('hi'))

  const res = await Oath.resolve(oath).then((str) => {
    return str + '!'
  })
  t.is(res, 'hi!');
})

it('passes thrown errors to the catch statement', async (t) => {
  const res = await new Oath(
    () => { throw 'hi' }
  ).catch(err => {
    return err;
  })

  t.is(res, 'hi');
})
