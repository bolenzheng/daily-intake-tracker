let trendMode='week',trendAnchor=$('day').value,trendSelectedDay=$('day').value;
for(const metric of C.keys)$('trendMetric').add(new Option(title(metric)+(metric==='kcal'?' (kcal)':C.electrolytes.includes(metric)?' (mg)':' (g)'),metric));
function renderTrends(){
 if(trendSelectedDay!==$('day').value){trendSelectedDay=$('day').value;trendAnchor=trendSelectedDay;}
 const metric=$('trendMetric').value||'kcal',unit=metric==='kcal'?'kcal':C.electrolytes.includes(metric)?'mg':'g';
 const points=TrackerHistory.buckets(state.logs,trendAnchor,trendMode,metric),valid=points.filter(p=>p.value!==null);
 const label=date=>TrackerHistory.parse(date).toLocaleDateString('en-AU',{day:'numeric',month:'short'});
 $('trendPeriod').textContent=label(points[0].start)+' – '+label(points.at(-1).end)+' '+points.at(-1).end.slice(0,4);
 $('trendDetail').textContent=valid.length?'Tap a point to see its value.':'No recorded '+title(metric).toLowerCase()+' in this period.';
 const host=$('trendChart');host.replaceChildren();
 const ns='http://www.w3.org/2000/svg';function svg(tag,attrs,text){const node=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));if(text!==undefined)node.textContent=text;return node;}
 const chart=svg('svg',{viewBox:'0 0 350 215',role:'img','aria-label':title(metric)+' '+(trendMode==='week'?'daily totals':'average daily intake')});
 const max=Math.max(1,...valid.map(p=>p.value))*1.1;
 for(let i=0;i<=4;i++){const y=15+i*40;chart.append(svg('line',{x1:8,x2:302,y1:y,y2:y,stroke:'#363636','stroke-dasharray':'3 4'}),svg('text',{x:307,y:y+4,fill:'#aaa','font-size':10},fmt(max*(4-i)/4)));}
 const x=i=>10+i*288/(points.length-1),y=value=>175-value/max*160;
 let segment=[];function flush(){if(segment.length>1)chart.append(svg('polyline',{points:segment.join(' '),fill:'none',stroke:'#b4ca8b','stroke-width':2.5}));segment=[];}
 points.forEach((p,i)=>{if(p.value===null){flush();return;}segment.push(x(i)+','+y(p.value));});flush();
 const list=el('div','trend-values');
 points.forEach((p,i)=>{
  const caption=trendMode==='months'?TrackerHistory.parse(p.start).toLocaleDateString('en-AU',{month:'short'}):trendMode==='week'?TrackerHistory.parse(p.start).toLocaleDateString('en-AU',{weekday:'short'}):label(p.start);
  if(points.length===7||i%2===0||i===points.length-1)chart.append(svg('text',{x:x(i),y:199,fill:'#aaa','font-size':9,'text-anchor':i===0?'start':i===points.length-1?'end':'middle'},caption));
  const detail=label(p.start)+(p.end!==p.start?' – '+label(p.end):'')+': '+(p.value===null?'No data':fmt(p.value)+' '+unit+(trendMode==='week'?'':' daily average · '+p.days+' recorded days'));
  const select=()=>{$('trendDetail').textContent=detail;};
  if(p.value!==null){chart.append(svg('circle',{cx:x(i),cy:y(p.value),r:4,fill:'#b4ca8b'}));const hit=svg('circle',{cx:x(i),cy:y(p.value),r:14,fill:'transparent'});hit.onclick=select;chart.append(hit);}
  const button=el('button','subtle',caption+' · '+(p.value===null?'—':fmt(p.value)));button.setAttribute('aria-label',detail);button.onclick=select;list.append(button);
 });
 host.append(chart);const details=el('details');details.append(el('summary','','View values'),list);host.append(details);
}
for(const [id,mode] of [['trendWeek','week'],['trendWeeks','weeks'],['trendMonths','months']])$(id).onclick=()=>{trendMode=mode;for(const other of ['trendWeek','trendWeeks','trendMonths'])$(other).setAttribute('aria-pressed',String(other===id));renderTrends();};
$('trendMetric').onchange=renderTrends;
function moveTrend(direction){const date=TrackerHistory.parse(trendAnchor);trendAnchor=TrackerHistory.key(trendMode==='months'?new Date(date.getFullYear(),date.getMonth()+direction*12,1,12):TrackerHistory.add(date,direction*(trendMode==='week'?7:84)));renderTrends();}
$('trendPrevious').onclick=()=>moveTrend(-1);$('trendNext').onclick=()=>moveTrend(1);renderTrends();
