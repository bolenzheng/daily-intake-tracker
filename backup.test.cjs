const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const B=require('./backup-core.js');
const values={kcal:150,protein:5,carbs:20,fat:4,sodium:0,calcium:null,potassium:20,magnesium:null,phosphorus:null};
const item={name:'Apple',unit:'gram',reference:100,values,comment:'Test'};
const original={targets:{kcal:1850,protein:170,carbs:160,fat:59},foods:[],logs:[],recipes:[]};
const imported={...original,foods:[item],logs:[{...item,id:'log1',date:'2026-10-20',amount:100,source:'recipe'}],recipes:[{id:'r1',name:'Mix',yield:2,unit:'serve',comment:'',ingredients:[{...item,amount:100}]}]};
assert.deepEqual(B.decode(B.encode(imported)),imported);
for(const change of [x=>x.logs[0].date='2026-02-30',x=>x.foods[0].values.kcal=-1,x=>x.targets.kcal=0,x=>x.recipes[0].ingredients=[],x=>x.logs.push(x.logs[0]),x=>x.foods[0].values.protein='5']){const x=structuredClone(imported);change(x);assert.throws(()=>B.encode(x));}
for(const text of ['{broken','{"app":"other","version":1}','{"app":"daily-intake-tracker","version":2}'])assert.throws(()=>B.decode(text));
const elements={},store=new Map();let full=false;
const context={TrackerBackup:B,state:original,storageKey:'test',Date,console,setTimeout,localStorage:{setItem:(k,v)=>{if(full)throw Error('Storage full');store.set(k,v);},getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)},$:id=>elements[id]??=( {hidden:true,showModal(){this.open=true;},close(){this.open=false;}}),restoreEntry(){},reset(){},render(){},renderRecipes(){},refreshRecipeSelect(){},showPage(){}};
context.persist=next=>{context.state=next;return true;};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/backup.js','utf8'),context);
(async()=>{
 const choose=()=>elements.backupFile.onchange({target:{files:[{size:1000,text:async()=>B.encode(imported)}]}});
 await choose();assert.equal(context.state,original);assert.equal(elements.restoreDialog.open,true);
 elements.cancelRestore.onclick();assert.equal(context.state,original);
 await choose();full=true;elements.confirmRestore.onclick();assert.equal(context.state,original);
 full=false;await choose();elements.confirmRestore.onclick();assert.deepEqual(JSON.parse(JSON.stringify(context.state)),imported);
 elements.undoRestore.onclick();assert.deepEqual(JSON.parse(JSON.stringify(context.state)),original);
 console.log('Backup round-trip, invalid file rejection, confirmation/cancel, storage failure, restore and undo checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
