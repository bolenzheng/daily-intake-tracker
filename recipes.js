let editingRecipeId=null,ingredients=[],ingredientIndex=null,logMode='food';
const entry=$('sharedEntry'),homeEntryParent=entry.parentNode,homeEntryNext=entry.nextSibling;
function showPage(page){
 for(const name of ['home','diary','recipe','backup']){
  $(name+'Page').hidden=name!==page;
  if(name===page)$(name+'Tab').setAttribute('aria-current','page');else $(name+'Tab').removeAttribute('aria-current');
 }
 if(ingredientIndex!==null&&page!=='recipe'){restoreEntry();reset();}
 if(page==='recipe')renderRecipes();
}
for(const page of ['home','diary','recipe','backup'])$(page+'Tab').onclick=()=>showPage(page);
$('diaryDate').onclick=()=>{showPage('home');$('calendarPanel').hidden=false;$('calendarToggle').setAttribute('aria-expanded','true');$('calendarToggle').focus();};
function restoreEntry(){homeEntryParent.insertBefore(entry,homeEntryNext);ingredientIndex=null;$('logMode').hidden=false;setLogMode('food');$('foodForm').querySelector('[type=submit]').textContent='＋ Add to daily log';$('clearForm').textContent='Clear form';}
function setLogMode(mode){logMode=mode;reset();$('foodMode').setAttribute('aria-pressed',String(mode==='food'));$('recipeMode').setAttribute('aria-pressed',String(mode==='recipe'));$('recipeChooser').hidden=mode!=='recipe';$('entryTitle').textContent=mode==='recipe'?'Log from recipe':'Log a food';$('name').readOnly=mode==='recipe';for(const k of C.keys)$(k).readOnly=mode==='recipe';$('reference').readOnly=false;$('name').closest('label').hidden=mode==='recipe';$('comment').readOnly=mode==='recipe';$('energyUnit').disabled=mode==='recipe';$('foodForm').querySelector('[type=submit]').textContent=mode==='recipe'?'＋ Log recipe portion':'＋ Add to daily log';$('portionUnit').disabled=mode==='recipe';if(mode==='recipe')refreshRecipeSelect();}
$('foodMode').onclick=()=>setLogMode('food');$('recipeMode').onclick=()=>setLogMode('recipe');
function recipeValues(recipe){return C.total(recipe.ingredients);}
function refreshRecipeSelect(){const selected=$('recipeSelect').value;$('recipeSelect').replaceChildren(new Option('Select a recipe',''));for(const recipe of [...state.recipes].sort((a,b)=>a.name.localeCompare(b.name)))$('recipeSelect').add(new Option(recipe.name,recipe.id));if(state.recipes.some(x=>x.id===selected))$('recipeSelect').value=selected;}
$('recipeSelect').onchange=()=>{const recipe=state.recipes.find(x=>x.id===$('recipeSelect').value);if(recipe)selectFood({name:recipe.name,unit:recipe.unit,reference:recipe.yield,values:recipeValues(recipe),comment:recipe.comment});else reset();};
function handleRecipeEntry(food,log){
 if(ingredientIndex!==null){
  const foods=state.foods.filter(f=>f.name.toLocaleLowerCase()!==food.name.toLocaleLowerCase());foods.push(food);
  if(!persist({...state,foods}))return true;
  const item={name:log.name,unit:log.unit,amount:log.amount,reference:log.reference,values:{...log.values},comment:log.comment};
  if(ingredientIndex<ingredients.length)ingredients[ingredientIndex]=item;else ingredients.push(item);
  restoreEntry();reset();renderIngredients();toast('Ingredient added & remembered');return true;
 }
 if(logMode==='recipe'){
  if(!state.recipes.some(x=>x.id===$('recipeSelect').value)){$('formError').textContent='Choose a saved recipe first.';return true;}
  if(persist({...state,logs:[...state.logs,{...log,source:'recipe'}]})){reset();$('recipeSelect').value='';render();toast('Recipe portion logged as a snapshot');}return true;
 }
 return false;
}
function beginIngredient(index){restoreEntry();reset();ingredientIndex=index;$('ingredientHost').append(entry);$('logMode').hidden=true;$('entryTitle').textContent=index<ingredients.length?'Edit ingredient':'Add ingredient';$('foodForm').querySelector('[type=submit]').textContent='Save ingredient';$('clearForm').textContent='Cancel ingredient';if(index<ingredients.length){const item=ingredients[index];selectFood({...item,values:C.scale(item.values,item.reference/item.amount)});$('amount').value=item.amount;setValues(item.values);}entry.scrollIntoView({behavior:'smooth',block:'start'});}
$('clearForm').onclick=()=>{if(ingredientIndex!==null){restoreEntry();renderIngredients();}reset();};
$('addIngredient').onclick=()=>beginIngredient(ingredients.length);
function editRecipe(recipe=null){restoreEntry();reset();editingRecipeId=recipe?.id??null;ingredients=recipe?structuredClone(recipe.ingredients):[];$('recipeName').value=recipe?.name??'';$('recipeYield').value=recipe?.yield??1;$('recipeUnit').value=recipe?.unit??'serve';$('recipeComment').value=recipe?.comment??'';$('recipeEditorTitle').textContent=recipe?'Edit recipe':'New recipe';$('recipeEditor').hidden=false;$('recipeError').textContent='';renderIngredients();}
$('newRecipe').onclick=()=>editRecipe();
$('cancelRecipe').onclick=()=>{restoreEntry();reset();$('recipeEditor').hidden=true;ingredients=[];};
function renderIngredients(){$('ingredientList').replaceChildren();ingredients.forEach((item,index)=>{const row=el('div','ingredient-row');row.append(el('strong','',item.name),el('p','',`${fmt(item.amount)} / ${fmt(item.reference)} ${item.unit} · ${fmt(item.values.kcal)} kcal`));const actions=el('div','recipe-actions'),edit=el('button','subtle','Edit ingredient'),remove=el('button','subtle recipe-delete','Remove ingredient');edit.onclick=()=>beginIngredient(index);remove.onclick=()=>{if(ingredientIndex!==null){restoreEntry();reset();}ingredients.splice(index,1);renderIngredients();};actions.append(edit,remove);row.append(actions);$('ingredientList').append(row);});const total=C.total(ingredients);$('recipeTotal').textContent=`Batch total: ${fmt(total.kcal)} kcal · P ${fmt(total.protein)} g · C ${fmt(total.carbs)} g · F ${fmt(total.fat)} g`;}
$('saveRecipe').onclick=()=>{const name=$('recipeName').value.trim(),yieldAmount=Number($('recipeYield').value);if(ingredientIndex!==null){$('recipeError').textContent='Save or cancel the ingredient being edited first.';return;}if(!name||!ingredients.length||!Number.isFinite(yieldAmount)||yieldAmount<=0){$('recipeError').textContent='Enter a recipe name, positive batch yield, and at least one ingredient.';return;}const recipe={id:editingRecipeId??crypto.randomUUID(),name,yield:yieldAmount,unit:$('recipeUnit').value,comment:$('recipeComment').value,ingredients:structuredClone(ingredients)};if(persist({...state,recipes:[...state.recipes.filter(x=>x.id!==recipe.id),recipe]})){$('recipeEditor').hidden=true;renderRecipes();refreshRecipeSelect();toast('Recipe saved. Past logs are unchanged.');}};
function renderRecipes(){$('recipeManager').replaceChildren();if(!state.recipes.length)$('recipeManager').append(el('p','muted','No recipes yet. Combine your ingredients into a reusable meal.'));for(const recipe of [...state.recipes].sort((a,b)=>a.name.localeCompare(b.name))){const card=el('article','card');card.append(el('h2','',recipe.name),el('p','muted',`${recipe.ingredients.length} ingredients · ${fmt(recipe.yield)} ${recipe.unit} · ${fmt(recipeValues(recipe).kcal)} kcal per batch`));const actions=el('div','recipe-actions');for(const [label,action] of [['Log',()=>{showPage('diary');setLogMode('recipe');$('recipeSelect').value=recipe.id;$('recipeSelect').onchange();entry.scrollIntoView({behavior:'smooth'});} ],['Edit recipe',()=>editRecipe(recipe)],['Duplicate',()=>{const copy={...structuredClone(recipe),id:crypto.randomUUID(),name:recipe.name+' (copy)'};if(persist({...state,recipes:[...state.recipes,copy]})){renderRecipes();toast('Recipe duplicated');}}],['Remove recipe',()=>{requestRecipeDelete(recipe);}]]){const b=el('button','subtle'+(label==='Remove recipe'?' recipe-delete':''),label);b.onclick=action;actions.append(b);}card.append(actions);$('recipeManager').append(card);}}
renderRecipes();
let pendingRecipeDelete=null;
const deleteDialog=el('dialog'),deleteHeading=el('h2','','Delete recipe?'),deleteText=el('p','muted','Past diary entries will stay unchanged.'),deleteConfirm=el('button','primary','Delete recipe'),deleteCancel=el('button','subtle full','Keep recipe');
deleteDialog.append(deleteHeading,deleteText,deleteConfirm,deleteCancel);document.body.append(deleteDialog);
function requestRecipeDelete(recipe){pendingRecipeDelete=recipe.id;deleteDialog.showModal();}
deleteCancel.onclick=()=>deleteDialog.close();
deleteConfirm.onclick=()=>{const id=pendingRecipeDelete;if(persist({...state,recipes:state.recipes.filter(x=>x.id!==id)})){if(editingRecipeId===id){restoreEntry();$('recipeEditor').hidden=true;}deleteDialog.close();renderRecipes();refreshRecipeSelect();toast('Recipe deleted. Past logs are unchanged.');}};

