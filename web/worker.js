import {tools} from './tools.mjs';
import {SITE_ORIGIN,locales,localizedPath,splitPath} from './seo-config.mjs';
const routes=new Set(['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy','/terms']);
export default {
 async fetch(request,env){
  const url=new URL(request.url),primary=new URL(SITE_ORIGIN);
  const normalized=splitPath(url.pathname);
  const redirectPath=routes.has(normalized.base)?localizedPath(normalized.base,normalized.language):url.pathname;
  const rootAlias=['saerokbit.com','www.saerokbit.com'].includes(url.hostname);
  if(url.pathname==='/ads.txt'&&(rootAlias||url.hostname===primary.hostname||url.hostname==='www.'+primary.hostname)){
   const response=await env.ASSETS.fetch(new Request(new URL('/ads.txt',SITE_ORIGIN),request));
   const result=new Response(response.body,response);result.headers.set('Content-Type','text/plain; charset=utf-8');result.headers.delete('X-Robots-Tag');return result;
  }
  if(rootAlias&&url.pathname==='/robots.txt')return new Response('User-agent: *\nAllow: /\nSitemap: '+SITE_ORIGIN+'/sitemap-index.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
  if(rootAlias)return Response.redirect(new URL(redirectPath+url.search,SITE_ORIGIN).href,301);
  if(url.hostname==='www.'+primary.hostname||(url.hostname===primary.hostname&&url.protocol!=='https:')){
   const target=new URL(redirectPath+url.search,SITE_ORIGIN);return Response.redirect(target.href,301);
  }
  const preview=url.hostname!==primary.hostname;
  if(url.pathname==='/robots.txt'&&preview&&!['localhost','127.0.0.1'].includes(url.hostname))return new Response('User-agent: *\nDisallow: /\n',{headers:{'content-type':'text/plain; charset=utf-8'}});
  const {language,base}=splitPath(url.pathname),canonicalPath=localizedPath(base,language);
  if(routes.has(base)&&url.pathname!==canonicalPath){url.pathname=canonicalPath;return Response.redirect(url.href,301);}
  const response=await env.ASSETS.fetch(request);
  if(preview||url.pathname.startsWith('/assets/')||response.status===404){
   const updated=new Response(response.body,response);updated.headers.set('X-Robots-Tag','noindex');return updated;
  }
  return response;
 }
};
