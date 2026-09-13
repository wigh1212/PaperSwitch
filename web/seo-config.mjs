export const SITE_ORIGIN='https://paperswitch.saerokbit.com';
export const locales=[
 {language:'en',prefix:'',name:'English'},
 {language:'ko',prefix:'ko',name:'한국어'},
 {language:'ja',prefix:'ja',name:'日本語'},
 {language:'zh-CN',prefix:'zh-cn',name:'简体中文'}
];
export function localizedPath(base,language){
 const locale=locales.find(l=>l.language===language)||locales[0];
 return locale.prefix?'/'+locale.prefix+(base==='/'?'/':base):base;
}
export function splitPath(path){
 const match=path.match(/^\/(en|ko|ja|zh-cn)(?:\/|$)/i);
 let language='en',base=path;
 if(match){language=locales.find(l=>l.prefix===match[1].toLowerCase())?.language||'en';base='/'+path.slice(match[0].length);}
 base=base.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/+$/,'')||'/';
 return {language,base};
}
export function structuredData(base,title,language){
 const home=SITE_ORIGIN+localizedPath('/',language),url=SITE_ORIGIN+localizedPath(base,language);
 return base==='/'?{'@context':'https://schema.org','@type':'WebSite',name:'Paper Switch',url,inLanguage:language}
 :{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
 {'@type':'ListItem',position:1,name:'Paper Switch',item:home},
 {'@type':'ListItem',position:2,name:title,item:url}
 ]};
}
