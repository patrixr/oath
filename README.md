# Oath

A Promise implementation. Just an experiment. *Do not use this in production*

[![forthebadge](https://forthebadge.com/images/badges/0-percent-optimized.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg)](https://forthebadge.com)


## Usage

Works exactly like normal promises

```js
new Oath((resolve, reject) => {
  setTimeout(() => resolve('yay'), 1000)
}).then((res) => {
  console.log(res);
})
```
