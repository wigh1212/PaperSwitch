export const modes={pdf:{input:'pdf',output:'svg'},svg:{input:'svg',output:'pdf'},'pdf-webp':{input:'pdf',output:'webp'},'webp-pdf':{input:'webp',output:'pdf'},'pdf-jpg':{input:'pdf',output:'jpg'},'jpg-pdf':{input:'jpg',output:'pdf'},'pdf-png':{input:'pdf',output:'png'},'png-pdf':{input:'png',output:'pdf'},'pdf-txt':{input:'pdf',output:'txt'},'txt-pdf':{input:'txt',output:'pdf'},'pdf-tiff':{input:'pdf',output:'tiff'},'tiff-pdf':{input:'tiff',output:'pdf'}};
export const svgFormats=['pdf','png','jpg','webp','tiff'];
modes['pdf-merge']={input:'pdf',output:'pdf',operation:'merge'};
for(const output of svgFormats)modes[`svg-${output}`]={input:'svg',output};
for(const input of svgFormats)modes[`${input}-svg`]={input,output:'svg'};
export const jpgFormats=['pdf','svg','png','webp','tiff'];
for(const format of jpgFormats){
  modes[`jpg-tab-jpg-${format}`]={input:'jpg',output:format};
  modes[`jpg-tab-${format}-jpg`]={input:format,output:'jpg'};
}

export const pngFormats=["pdf","svg","jpg","webp","tiff"];
for(const format of pngFormats){modes[`png-tab-png-${format}`]={input:'png',output:format};modes[`png-tab-${format}-png`]={input:format,output:'png'};}

export const sourceTabs=["pdf","svg","jpg","png","webp","tiff"];
for(const source of ['webp','tiff'])for(const format of sourceTabs.filter(f=>f!==source)){modes[`${source}-tab-${source}-${format}`]={input:source,output:format};modes[`${source}-tab-${format}-${source}`]={input:format,output:source};}
