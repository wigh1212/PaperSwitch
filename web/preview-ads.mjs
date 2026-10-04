// Only remove our marked, generated markup; preserve conversion scripts and content.
export function withoutPreviewAds(html){
 return html.replace(/<script\b(?=[^>]*\bdata-site-ad(?:[\s=>]))[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<aside class="home-ad"[^>]*>[\s\S]*?<\/aside>/gi,'');
}
