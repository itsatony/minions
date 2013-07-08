var Minions = require('../lib/minions.js');
minions = new Minions();


var testObject = {
  a: [ 
		'1', 
		'b', 
		new Buffer('hallo'), 
		new RegExp('abc', 'gi'), 
		Math.random(100), 
		function(x) { return x; }, 
		new Date(), 
		'testOver', 
		false, 
		{ 
			a:1, 
			b: [
				'z',
				'v',
				3,
				{ b:2 } 
			] 
		} 
	],
  b: {
    n: 1,
    y: 'testY',
    mySubObject: {
      a: new RegExp('def', 'g'),
      b: function(k) { return 2*k; },
      c: false
    }
  },
  c: true,
  d: new Buffer('crazyObjectTest'),
  e: [ 1, 2, 3, 4, 'baeh' ],
  f: new Date(),
  g: 'IRRE!',
  h: /ghi/,
  i: function(n) { return 17; }
};


var testCopy = minions.extendDeep(false, {}, testObject);
console.log(testCopy);

console.log('--- testing Object ---');
testCopy.b.n = false;
console.log(testCopy.b);
console.log(testObject.b);

console.log('--- testing subObject ---');
testCopy.b.mySubObject.b = false;
console.log(testCopy.b.mySubObject.b);
console.log(testObject.b.mySubObject.b);

console.log('--- testing Buffer property with delete ---');
delete testObject.d;
console.log(testCopy.d);
console.log(testObject.d);

console.log('--- testing Array ---');
testCopy.e[3] = 'i';
console.log(testCopy.e);
console.log(testObject.e);

console.log('--- testing Buffer in Array ---');
testCopy.a[2].write('xxxx');
console.log(testCopy.a[2]);
console.log(testObject.a[2]);

console.log('--- testing RegExp in Array ---');
testCopy.a[3] = new RegExp('ddd', 'i');
console.log(testCopy.a[3]);
console.log(testObject.a[3]);

console.log('--- testing Function ---');
testCopy.i = function() { return 42; };
console.log(testCopy.i());
console.log(testObject.i());



