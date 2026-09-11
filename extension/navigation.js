export function initNavigation(){
  const tabs=['convert','utilities'];
  function select(name){
    for(const tab of tabs){
      const selected=tab===name,button=document.getElementById(`${tab}-tab`);
      button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      document.getElementById(`${tab}-section`).hidden=!selected;
    }
  }
  for(const tab of tabs){
    const button=document.getElementById(`${tab}-tab`);
    button.onclick=()=>{select(tab);history.replaceState(null,'',tab==='utilities'?'#utilities':location.pathname);};
    button.onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?'convert':event.key==='End'?'utilities':tabs.find(value=>value!==tab);
      document.getElementById(`${next}-tab`).click();document.getElementById(`${next}-tab`).focus();
    };
  }
  const sync=()=>select(location.hash==='#utilities'?'utilities':'convert');
  window.addEventListener('hashchange',sync);sync();
}
