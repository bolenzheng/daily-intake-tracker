if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{const registration=await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;$('offlineStatus').textContent='Ready for offline use on this device.';
      function updateNotice(){if(registration.waiting)$('offlineStatus').textContent='Update downloaded. Close all tracker windows and reopen to apply it. Save any draft first.';}
      updateNotice();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',updateNotice);});
    }catch{$('offlineStatus').textContent='Offline setup failed. Connect to the internet and reopen the app to retry.';}
  });
}else $('offlineStatus').textContent='Offline installation requires a supported browser and HTTPS.';
