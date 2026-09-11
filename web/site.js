import {initLanguages,registerTranslations} from '/assets/i18n.js';
import {rows} from '/copy.js';
registerTranslations(rows);
const menus=[...document.querySelectorAll('.format-menu')];
const closeMenus=except=>menus.forEach(menu=>{if(menu!==except)menu.open=false;});
for(const menu of menus){
 let openedByHover=false;
 menu.querySelector("summary").addEventListener("click",event=>{if(openedByHover&&event.detail>0){event.preventDefault();openedByHover=false;}});
 menu.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){closeMenus(menu);menu.open=true;openedByHover=true;}});
 menu.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'&&!menu.contains(document.activeElement))menu.open=false;});
 menu.addEventListener('toggle',()=>{if(menu.open)closeMenus(menu);});
}
document.addEventListener('click',event=>{if(!event.target.closest('.format-menu'))closeMenus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const active=menus.find(m=>m.open);closeMenus();active?.querySelector('summary').focus();}});
document.addEventListener('focusin',event=>{if(!event.target.closest('.format-menu'))closeMenus();});
const tabs=[...document.querySelectorAll('[data-source]')];
function choose(tab){for(const item of tabs){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;}}
for(const [index,tab] of tabs.entries()){
 tab.onclick=()=>choose(tab);
 tab.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;choose(tabs[next]);tabs[next].focus();}};
}
const engine=document.body.dataset.engine;
if(engine)await import('/assets/'+engine+'.js');else initLanguages();
document.body.dataset.ready='true';
