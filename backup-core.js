(function(root){
  const keys=['kcal','protein','carbs','fat','sodium','calcium','potassium','magnesium','phosphorus'];
  function fail(){throw new Error('This file is not a valid Daily Intake Tracker backup. Nothing was changed.');}
  function num(v,positive=false){if(typeof v!=='number'||!Number.isFinite(v)||(positive?v<=0:v<0))fail();return v;}
  function str(v,max=10000){if(typeof v!=='string'||v.length>max)fail();return v;}
  function name(v){const s=str(v,120);if(!s.trim())fail();return s;}
  function unit(v){if(!['serve','gram'].includes(v))fail();return v;}
  function values(v){if(!v||typeof v!=='object')fail();return Object.fromEntries(keys.map((k,i)=>[k,i>=4&&v[k]==null?null:num(v[k])]));}
  function item(v){if(!v)fail();return {name:name(v.name),unit:unit(v.unit),reference:num(v.reference,true),values:values(v.values),comment:str(v.comment??'')};}
  function portion(v){const x={...item(v),amount:num(v.amount,true)};for(const k of keys)if(x.values[k]!=null&&!Number.isFinite(x.values[k]*x.reference/x.amount))fail();return x;}
  function array(v,fn){if(!Array.isArray(v)||v.length>100000)fail();return v.map(fn);}
  function unique(items,key){if(new Set(items.map(key)).size!==items.length)fail();return items;}
  function validate(data){
    if(!data||typeof data!=='object')fail();
    const targets=Object.fromEntries(keys.slice(0,4).map(k=>[k,num(data.targets?.[k],true)]));
    const foods=unique(array(data.foods,item),x=>x.name.toLocaleLowerCase());
    const logs=unique(array(data.logs,v=>{const date=str(v.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)fail();return {...portion(v),id:name(v.id),date,...(v.source==='recipe'?{source:'recipe'}:{})};}),x=>x.id);
    const recipes=unique(array(data.recipes??[],v=>{const ingredients=array(v.ingredients,portion);if(!ingredients.length)fail();return {id:name(v.id),name:name(v.name),unit:unit(v.unit),yield:num(v.yield,true),comment:str(v.comment??''),ingredients};}),x=>x.id);
    for(const list of [logs,...recipes.map(r=>r.ingredients)])for(const k of keys)if(!Number.isFinite(list.reduce((sum,x)=>sum+(x.values[k]??0),0)))fail();
    return {targets,foods,logs,recipes};
  }
  function encode(data){return JSON.stringify({app:'daily-intake-tracker',version:1,exportedAt:new Date().toISOString(),data:validate(data)},null,2);}
  function decode(text){let v;try{v=JSON.parse(text);}catch{fail();}if(v?.app!=='daily-intake-tracker'||v.version!==1)fail();return validate(v.data);}
  const api={validate,encode,decode};if(typeof module!=='undefined')module.exports=api;root.TrackerBackup=api;
})(typeof window==='undefined'?globalThis:window);
