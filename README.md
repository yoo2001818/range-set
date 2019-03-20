# range-set
Javascript library for modifying a set of ranges

```ts
let rangeset = require('rangeset');
let setA = rangeset.and(
  rangeset.eq(1),
  rangeset.eq(2),
  rangeset.lt(3),
  rangeset.gt(1),
);
console.log(setA);
/*
[
  { type: '>', value: 1 },
  { type: '<', value: 3 },
]
*/

let setB = rangeset.or(
  rangeset.and(
    rangeset.gte(1),
    rangeset.lte(10),
  ),
  rangeset.eq(30),
);
console.log(setB);
/*
[
  { type: '>=', value: 1 },
  { type: '<=', value: 10 },
  { type: '=', value: 30 },
]
*/

let setC = rangeset.or(
  rangeset.gte(1),
  rangeset.lte(1),
);
console.log(setC);
/* true */

let setD = rangeset.and(
  rangeset.gte(5),
  rangeset.lte(1),
);
console.log(setD);
/* false */

rangeset.test(setA, 30); // false
```
