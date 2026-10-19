let pendingRestore=null;
function backupMessage(message){$('backupStatus').textContent=message;}
function downloadBackup(){
  try{const blob=new Blob([TrackerBackup.encode(state)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='daily-intake-tracker-'+dateKey(new Date())+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);backupMessage('Backup prepared. Save the JSON file to Files or another safe location.');}catch(e){backupMessage(e.message);}
}
$('exportBackup').onclick=downloadBackup;
$('restoreBackup').onclick=()=>$('backupFile').click();
$('backupFile').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  try{if(file.size>20*1024*1024)throw Error('Choose a backup smaller than 20 MB.');pendingRestore=TrackerBackup.decode(await file.text());$('restoreSummary').textContent=`Replace current data with ${pendingRestore.logs.length} diary entries, ${pendingRestore.foods.length} saved foods, ${pendingRestore.recipes.length} recipes, and the backed-up targets? Unsaved form changes will be cleared. A local undo copy will be saved first.`;$('restoreDialog').showModal();}catch(e){pendingRestore=null;backupMessage(e.message);}
};
$('cancelRestore').onclick=()=>{$('restoreDialog').close();pendingRestore=null;};
function refreshAfterRestore(){restoreEntry();reset();ingredients=[];editingRecipeId=null;$('recipeEditor').hidden=true;render();renderRecipes();refreshRecipeSelect();showPage('backup');}
$('confirmRestore').onclick=()=>{
  if(!pendingRestore)return;
  try{localStorage.setItem(storageKey+'.beforeRestore',TrackerBackup.encode(state));if(!persist(pendingRestore))throw Error('Storage is full or unavailable. Restore was not applied.');pendingRestore=null;$('restoreDialog').close();refreshAfterRestore();$('undoRestore').hidden=false;backupMessage('Backup restored. Your historical entries were imported as saved snapshots.');}catch(e){$('restoreDialog').close();backupMessage(e.message);}
};
$('undoRestore').onclick=()=>{
  try{const previous=TrackerBackup.decode(localStorage.getItem(storageKey+'.beforeRestore'));if(!persist(previous))throw Error('Could not save the previous data.');refreshAfterRestore();localStorage.removeItem(storageKey+'.beforeRestore');$('undoRestore').hidden=true;backupMessage('Restored the data saved before your last import.');}catch(e){backupMessage(e.message);}
};
try{$('undoRestore').hidden=!localStorage.getItem(storageKey+'.beforeRestore');}catch{}
