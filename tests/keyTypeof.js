var minionsModule = require('..');
var minions = new minionsModule();

//testobject

var aTest = {
	arr : [],
	a : {
		aNumber : 1,
		aString : 'test',
		aBool : true
	},
	bNumber : 1,
	bString : 'test',
	bBool  : false
}
var bTest = {
	a : {
		b : 1
	}

}
aTest.arr.push(1);
aTest.arr.push('test');
aTest.arr.push(true);
aTest.arr.push(bTest);

var result, counter = 1;
var testings = {
	'arr[0]' : 'number',
	'arr[1]' : 'string',
	'arr[2]' : 'boolean',
	'arr[3]' : 'object',
	'arr[3].a.b' : 'number',
	'arr[3].b.a' : 'undefined',
	'arr[4]' : 'undefined',
	'a.aNumber' : 'number',
	'a.aString' : 'string',
	'a.aBool' : 'boolean',
	'a.nothing' : 'undefined',
	'bNumber' : 'number',
	'bString' : 'string',
	'bBool' : 'boolean',
	'nothing' : 'undefined',
	'really.no.object' : 'undefined'
}



console.log('----------- testing object -------------');
console.log(JSON.stringify(aTest));
console.log();

for (var testParameter in testings){
	result = minions.keyTypeof(aTest, testParameter),
	console.log(counter+'. Test ('+testParameter+"):\t", result === testings[testParameter]);
	counter++;
}