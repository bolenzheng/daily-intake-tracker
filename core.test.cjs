const assert=require('node:assert/strict'),C=require('./core.js');
const food={kcal:131,protein:30,carbs:0,fat:0,sodium:null,calcium:0,potassium:100,magnesium:null,phosphorus:null};
assert.equal(C.scale(food,0.5).kcal,65.5);assert.equal(C.scale(food,0.5).protein,15);assert.equal(C.scale(food,2).protein,60);
assert.equal(C.scale(food,250/500).potassium,50);assert.equal(C.scale(food,2).sodium,null);assert.equal(C.scale(food,2).calcium,0);
assert.ok(Math.abs(C.kcal(548.104,'kJ')-131)<1e-10);assert.ok(Math.abs(C.energy(131,'kJ')-548.104)<1e-10);
assert.equal(C.percent(3700,1850),200);assert.equal(C.percent(975,1850),53);assert.equal(C.percent(925,1850),50);
assert.deepEqual(C.matches([{name:'Protein water citrus'},{name:'Pear'},{name:'Apple'}],'p').map(x=>x.name),['Pear','Protein water citrus']);
assert.equal(C.matches([{name:'Protein water citrus'},{name:'Pear'}],'protein wa').length,1);assert.equal(C.matches([{name:'Pear'}],'').length,0);
assert.equal(C.total([{values:food},{values:C.scale(food,0.5)}]).protein,45);assert.equal(C.total([{values:food}]).sodium,null);assert.equal(C.total([]).kcal,0);
console.log('17 nutrition, conversion, autocomplete and aggregation assertions passed.');

