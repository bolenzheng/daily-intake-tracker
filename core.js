(function(root){
 const keys=['kcal','protein','carbs','fat','sodium','calcium','potassium','magnesium','phosphorus'];
 const electrolytes=keys.slice(4);
 const defaults={kcal:1850,protein:170,carbs:160,fat:59};
 function scale(values,ratio){return Object.fromEntries(keys.map(k=>[k,values[k]==null?null:values[k]*ratio]));}
 function kcal(value,unit){return unit==='kJ'?value/4.184:value;}
 function energy(value,unit){return unit==='kJ'?value*4.184:value;}
 function total(logs){return Object.fromEntries(keys.map(k=>{const known=logs.filter(x=>x.values[k]!=null);return [k,known.length?known.reduce((s,x)=>s+x.values[k],0):(electrolytes.includes(k)?null:0)];}));}
 function matches(foods,q){return q.trim()?foods.filter(f=>f.name.toLocaleLowerCase().startsWith(q.trim().toLocaleLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)):[];}
 function percent(value,target){return Math.round(value/target*100);}
 const api={keys,electrolytes,defaults,scale,kcal,energy,total,matches,percent};
 if(typeof module!=='undefined')module.exports=api;root.MacroCore=api;
})(typeof window==='undefined'?globalThis:window);
