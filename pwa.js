// Restrict gesture handling to the installed app; Safari retains normal zoom.
const installedDisplay=window.matchMedia('(display-mode: standalone)');
function isInstalledTracker(){return navigator.standalone===true||installedDisplay.matches;}
function updateInstalledGestures(){document.documentElement.classList.toggle('installed-tracker',isInstalledTracker());}
updateInstalledGestures();
installedDisplay.addEventListener('change',updateInstalledGestures);
function preventInstalledPinch(event){
  if(isInstalledTracker()&&event.cancelable&&(event.type.startsWith('gesture')||event.touches?.length>1))event.preventDefault();
}
for(const type of ['gesturestart','gesturechange','gestureend','touchstart','touchmove']){
  document.addEventListener(type,preventInstalledPinch,{passive:false});
}
// Some iOS versions still smart-zoom card content despite touch-action.
// Cancel only the second stationary tap on non-interactive content.
let trackerTapStart=null,trackerLastTap=null;
function isTrackerControl(target){return !!target?.closest?.('input,textarea,select,button,a,label,summary,[contenteditable]:not([contenteditable="false"]),[role="button"]');}
document.addEventListener('touchstart',event=>{
  trackerTapStart=null;
  if(!isInstalledTracker()||event.touches.length!==1||isTrackerControl(event.target)){trackerLastTap=null;return;}
  const touch=event.touches[0];
  trackerTapStart={x:touch.clientX,y:touch.clientY,time:event.timeStamp};
},{passive:true});
document.addEventListener('touchmove',event=>{
  if(!trackerTapStart)return;
  const touch=event.touches[0];
  if(event.touches.length!==1||Math.hypot(touch.clientX-trackerTapStart.x,touch.clientY-trackerTapStart.y)>10){trackerTapStart=null;trackerLastTap=null;}
},{passive:true});
document.addEventListener('touchcancel',()=>{trackerTapStart=null;trackerLastTap=null;},{passive:true});
document.addEventListener('touchend',event=>{
  const start=trackerTapStart;trackerTapStart=null;
  if(!isInstalledTracker()||!start||event.touches.length||event.changedTouches.length!==1||isTrackerControl(event.target)){trackerLastTap=null;return;}
  const touch=event.changedTouches[0],now=event.timeStamp;
  if(now-start.time>350||Math.hypot(touch.clientX-start.x,touch.clientY-start.y)>10){trackerLastTap=null;return;}
  const samePlace=trackerLastTap&&Math.hypot(touch.clientX-trackerLastTap.x,touch.clientY-trackerLastTap.y)<32;
  if(samePlace&&now-trackerLastTap.time<350&&event.cancelable)event.preventDefault();
  trackerLastTap={x:touch.clientX,y:touch.clientY,time:now};
},{passive:false});
document.addEventListener('dblclick',event=>{
  if(isInstalledTracker()&&!isTrackerControl(event.target)&&event.cancelable)event.preventDefault();
},{passive:false});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{const registration=await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;$('offlineStatus').textContent='Ready for offline use on this device.';
      function updateNotice(){if(registration.waiting)$('offlineStatus').textContent='Update downloaded. Close all tracker windows and reopen to apply it. Save any draft first.';}
      updateNotice();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',updateNotice);});
    }catch{$('offlineStatus').textContent='Offline setup failed. Connect to the internet and reopen the app to retry.';}
  });
}else $('offlineStatus').textContent='Offline installation requires a supported browser and HTTPS.';
