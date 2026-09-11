// Resolve the CSS cascade in an isolated shadow tree. No SVG CSS is injected
// into the application, and no relaxation of extension CSP is needed.
const properties=[
  'color','fill','fill-opacity','fill-rule','stroke','stroke-opacity','stroke-width',
  'stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset',
  'opacity','display','visibility','clip-path','clip-rule','mask','filter',
  'stop-color','stop-opacity','flood-color','flood-opacity',
  'font-family','font-size','font-style','font-weight','text-anchor','dominant-baseline',
  'letter-spacing','word-spacing','paint-order'
];
function localReference(value){
  return value.replace(/url\(["']?[^)"']*#([^\s)"']+)["']?\)/g,'url(#$1)');
}
export function resolveSVGStyles(original,width,height){
  const host=document.createElement('div');
  host.setAttribute('aria-hidden','true');
  host.style.position='fixed';host.style.left='-100000px';host.style.top='0';host.style.pointerEvents='none';
  const shadow=host.attachShadow({mode:'closed'});
  const svg=document.importNode(original,true);
  svg.setAttribute('data-conversion-root','');
  svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
  const sheets=[];
  for(const node of svg.querySelectorAll('style')){
    const sheet=new CSSStyleSheet();sheet.replaceSync(node.textContent);
    function rewrite(rules){for(const rule of rules){if(rule.selectorText)rule.selectorText=rule.selectorText.replace(/:root\b/g,'[data-conversion-root]');if(rule.cssRules)rewrite(rule.cssRules);}}
    rewrite(sheet.cssRules);sheets.push(sheet);node.remove();
  }
  const nodes=[svg,...svg.querySelectorAll('*')];
  // DOMParser can retain the style attribute while CSP leaves node.style empty.
  // Read the raw declaration as CSS data rather than trusting that declaration.
  const inline=nodes.map(node=>{
    const sheet=new CSSStyleSheet();sheet.replaceSync(`x { ${node.getAttribute('style')||''} }`);
    const style=sheet.cssRules[0]?.style;
    return Array.from(style||[]).map(name=>[name,style.getPropertyValue(name),style.getPropertyPriority(name)]);
  });
  nodes.forEach(node=>node.removeAttribute('style'));
  shadow.adoptedStyleSheets=sheets;shadow.append(svg);document.body.append(host);
  try{
    nodes.forEach((node,i)=>{for(const [name,value,priority] of inline[i])node.style.setProperty(name,value,priority);});
    // Read every computed value before modifying the tree: inheritance must not
    // change while styles are being flattened.
    const resolved=nodes.map(node=>{const style=getComputedStyle(node);return properties.map(name=>[name,localReference(style.getPropertyValue(name))]);});
    const result=svg.cloneNode(true),output=[result,...result.querySelectorAll('*')];
    output.forEach((node,i)=>{
      node.removeAttribute('style');node.removeAttribute('class');
      for(const [name,value] of resolved[i])if(value)node.setAttribute(name,value);
    });
    result.removeAttribute('data-conversion-root');return result;
  }finally{host.remove();}
}
