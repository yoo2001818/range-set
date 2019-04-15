# range-set
Javascript library for modifying a set of ranges

Each range is represented using the following structure:
```ts
{
  min: T,
  max: T,
  minEqual: boolean,
  maxEqual: boolean,
}
```

You can manipulate the range set using `and`, `or`, `not`.

```ts
let createRangeset = require('rangeset');
let rangeset = createRangeset({
  compare: (a: number, b: number) => a - b,
  isPositiveInfinity: (v: number) => v === Infinity,
  isNegativeInfinity: (v: number) => v === -Infinity,
  positiveInfinity: Infinity,
  negativeInfinity: -Infinity,
});
let setA = rangeset.and(
  rangeset.eq(1),
  rangeset.eq(2),
  rangeset.lt(3),
  rangeset.gt(1),
);
console.log(setA);

let setB = rangeset.or(
  rangeset.and(
    rangeset.gte(1),
    rangeset.lte(10),
  ),
  rangeset.and(
    rangeset.gt(15),
    rangeset.lt(20),
  ),
  rangeset.eq(30),
);
console.log(setB);

let setC = rangeset.or(
  rangeset.gte(1),
  rangeset.lte(1),
);
console.log(setC);

let setD = rangeset.and(
  rangeset.gte(5),
  rangeset.lte(1),
);
console.log(setD);

rangeset.test(setA, 30); // false
```
