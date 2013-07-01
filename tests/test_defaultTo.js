var Minions = require('./lib/minions');
minions = new Minions(['node']);

bla();

function bla(c) {
	console.log(minions.defaultTo(c, 'abc'));
return c;
};
