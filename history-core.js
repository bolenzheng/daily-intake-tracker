(function(root){
 const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const parse=s=>new Date(s+'T12:00:00');
 const add=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,12);
 function targetsAt(state,date){return [...(state.targetHistory||[])].filter(x=>x.date<=date).sort((a,b)=>b.date.localeCompare(a.date))[0]?.targets||state.targets;}
 function setTargets(state,date,targets,today){return {...state,targetHistory:[...(state.targetHistory||[]).filter(x=>x.date!==date),{date,targets:{...targets}}].sort((a,b)=>a.date.localeCompare(b.date))};}
 function buckets(logs,date,mode,metric){
  const anchor=parse(date),monday=add(anchor,-(anchor.getDay()+6)%7);let starts;
  if(mode==='week')starts=Array.from({length:7},(_,i)=>add(monday,i));
  else if(mode==='weeks')starts=Array.from({length:12},(_,i)=>add(monday,(i-11)*7));
  else starts=Array.from({length:12},(_,i)=>new Date(anchor.getFullYear(),anchor.getMonth()+i-11,1,12));
  return starts.map(start=>{const end=mode==='week'?add(start,1):mode==='weeks'?add(start,7):new Date(start.getFullYear(),start.getMonth()+1,1,12);const days=new Map();for(const log of logs)if(log.date>=key(start)&&log.date<key(end)&&log.values[metric]!=null)days.set(log.date,(days.get(log.date)||0)+log.values[metric]);const sum=[...days.values()].reduce((a,b)=>a+b,0);return {start:key(start),end:key(add(end,-1)),days:days.size,value:days.size?(mode==='week'?sum:sum/days.size):null};});
 }
 const api={key,parse,add,targetsAt,setTargets,buckets};root.TrackerHistory=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
