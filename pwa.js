// Restrict gesture handling to the installed app; Safari retains normal zoom.
const installedDisplay=window.matchMedia('(display-mode: standalone)');
function isInstalledTracker(){return navigator.standalone===true||installedDisplay.matches;}
function preventInstalledPinch(event){
  if(isInstalledTracker()&&event.cancelable&&(event.type.startsWith('gesture')||event.touches?.length>1))event.preventDefault();
}
for(const type of ['gesturestart','gesturechange','gestureend','touchstart','touchmove']){
  document.addEventListener(type,preventInstalledPinch,{passive:false});
}
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{const registration=await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;$('offlineStatus').textContent='Ready for offline use on this device.';
      function updateNotice(){if(registration.waiting)$('offlineStatus').textContent='Update downloaded. Close all tracker windows and reopen to apply it. Save any draft first.';}
      updateNotice();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',updateNotice);});
    }catch{$('offlineStatus').textContent='Offline setup failed. Connect to the internet and reopen the app to retry.';}
  });
}else $('offlineStatus').textContent='Offline installation requires a supported browser and HTTPS.';
