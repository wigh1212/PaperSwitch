export const SITE_ORIGIN='https://paperswitch.saerokbit.com';
export const DEFAULT_LANGUAGE='ko';
export const locales=[
 {language:'en',prefix:'en',name:'English'},
 {language:'ko',prefix:'',name:'한국어'},
 {language:'ja',prefix:'ja',name:'日本語'},
 {language:'zh-CN',prefix:'zh-cn',name:'简体中文'}
];
export function localizedPath(base,language){
 const locale=locales.find(l=>l.language===language)||locales.find(l=>l.language===DEFAULT_LANGUAGE);
 return locale.prefix?'/'+locale.prefix+(base==='/'?'/':base):base;
}
export function splitPath(path){
 const match=path.match(/^\/(en|ko|ja|zh-cn)(?:\/|$)/i);
 let language=DEFAULT_LANGUAGE,base=path;
 if(match){language=match[1].toLowerCase()==='ko'?'ko':locales.find(l=>l.prefix===match[1].toLowerCase())?.language||DEFAULT_LANGUAGE;base='/'+path.slice(match[0].length);}
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
