import {tools} from './tools.mjs';
const paths=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy'];
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/robots.txt')return new Response('User-agent: *\nAllow: /\nDisallow: /assets/\nSitemap: '+url.origin+'/sitemap.xml\n',{headers:{'content-type':'text/plain; charset=utf-8'}});
  if(url.pathname==='/sitemap.xml')return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+url.origin+path+'</loc></url>').join('')+'</urlset>',{headers:{'content-type':'application/xml; charset=utf-8'}});
  let path=url.pathname.replace(/\/$/,'')||'/';
  if(path==='/index.html')path='/';
  else if(path.endsWith('.html'))path=path.slice(0,-5);
  if(paths.includes(path)&&path!==url.pathname){url.pathname=path;return Response.redirect(url.toString(),301);}
  const response=await env.ASSETS.fetch(request);
  if(url.pathname.startsWith('/assets/')){const asset=new Response(response.body,response);asset.headers.set('X-Robots-Tag','noindex');return asset;}
  if(response.status!==200||!paths.includes(path)||!response.headers.get('content-type')?.includes('text/html'))return response;
  const canonical=url.origin+path;
  return new HTMLRewriter().on('head',{element(el){el.append('<link rel="canonical" href="'+canonical+'"><meta property="og:url" content="'+canonical+'">',{html:true});}}).transform(response);
 }
};

