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
  { type: 'range', min: 1, max: 3, minEq: false, maxEq: false, excludes: [] }, 
]
*/

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
/*
[
  { type: 'range', min: 1, max: 10, minEq: true, maxEq: true, excludes: [] }, 
  { type: 'range', min: 15, max: 20, minEq: false, maxEq: false, excludes: [] }, 
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
