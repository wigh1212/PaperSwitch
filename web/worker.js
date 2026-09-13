import {tools} from './tools.mjs';
import {SITE_ORIGIN,locales,localizedPath,splitPath} from './seo-config.mjs';
const routes=new Set(['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy']);
export default {
 async fetch(request,env){
  const url=new URL(request.url),primary=new URL(SITE_ORIGIN);
  if(url.hostname==='www.'+primary.hostname||(url.hostname===primary.hostname&&url.protocol!=='https:')){
   const target=new URL(url.pathname+url.search,SITE_ORIGIN);return Response.redirect(target.href,301);
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
