export const frames=[{id:'none',name:'No frame'},{id:'classic',name:'Polaroid'},{id:'rounded',name:'Speech bubble'},{id:'forest',name:'Signboard'},{id:'midnight',name:'Arch'},{id:'ticket',name:'Ticket'},{id:'sunshine',name:'Ribbon'},{id:'rose',name:'Postcard'},{id:'outline',name:'Corner marks'}];
export function frameQR(qr,{frame='none',title='',description=''}={}){
 if(frame==='none')return qr;
 const q=qr.width,p=Math.max(28,Math.round(q*.09)),w=q+2*p,h=q+2*p+Math.round(q*.32),c=document.createElement('canvas');c.width=w;c.height=h;
 const x=c.getContext('2d');let ink='#263a34',textY=q+p*1.7+q*.05;
 const box=(a,b,c,d,r,fill,stroke)=>{x.beginPath();x.roundRect(a,b,c,d,r);if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.strokeStyle=stroke;x.lineWidth=3;x.stroke();}};
 x.fillStyle='white';x.fillRect(0,0,w,h);
 if(frame==='classic'){box(10,10,w-20,h-20,2,'#faf7ef','#d4cbb8');box(p-5,p-5,q+10,q+10,0,null,'#c5baa5');x.fillStyle='#b5a48b';x.fillRect(w*.36,0,w*.28,19);}
 if(frame==='rounded'){box(5,5,w-10,h-30,30,'#e8f1ed','#28684f');x.beginPath();x.moveTo(w*.65,h-30);x.lineTo(w*.72,h-3);x.lineTo(w*.82,h-30);x.fillStyle='#e8f1ed';x.fill();x.strokeStyle='#28684f';x.stroke();}
 if(frame==='forest'){box(4,4,w-8,h-8,8,'#203f36');box(p-8,p-8,q+16,q+16,4,'white');ink='white';x.strokeStyle='#a4c5ac';x.lineWidth=2; x.strokeRect(14,14,w-28,h-28);for(const a of [21,w-21])for(const b of [21,h-21]){x.beginPath();x.arc(a,b,3,0,7);x.fillStyle='#c9dccd';x.fill();}}
 if(frame==='midnight'){box(8,8,w-16,h-16,[w/2,w/2,14,14],'#ece7f6');x.strokeStyle='#665080';x.lineWidth=4;x.beginPath();x.arc(w/2,p+q*.35,w*.43,Math.PI,0);x.stroke();ink='#57416e';}
 if(frame==='ticket'){box(8,8,w-16,h-16,8,'#fff2d8','#806340');x.setLineDash([8,8]);x.strokeStyle='#806340';x.beginPath();x.moveTo(10,q+p*1.4);x.lineTo(w-10,q+p*1.4);x.stroke();x.setLineDash([]);for(const a of [8,w-8]){x.beginPath();x.arc(a,q+p*1.4,15,0,7);x.fillStyle='white';x.fill();}ink='#684b25';}
 if(frame==='sunshine'){box(12,12,w-24,h-24,16,'#fff8e8','#dbba69');x.fillStyle='#c88128';const y=q+p*1.4;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.lineTo(w-13,y+28);x.lineTo(w,y+56);x.lineTo(0,y+56);x.lineTo(13,y+28);x.closePath();x.fill();textY=y+28;ink='#593b17';}
 if(frame==='rose'){box(8,8,w-16,h-16,0,'#fff7f2','#b78273');x.strokeStyle='#d7a99d';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(p,q+p*1.8+28*i);x.lineTo(w-p,q+p*1.8+28*i);x.stroke();}x.fillStyle='#b8796c';x.beginPath();x.arc(w-p,22,7,0,7);x.fill();ink='#78483d';}
 if(frame==='outline'){x.strokeStyle='#243d4f';x.lineWidth=7;for(const [a,b,dx,dy] of [[9,9,1,1],[w-9,9,-1,1],[9,h-9,1,-1],[w-9,h-9,-1,-1]]){x.beginPath();x.moveTo(a,b+dy*32);x.lineTo(a,b);x.lineTo(a+dx*32,b);x.stroke();}}
 // Preserve the complete white QR quiet zone at integer pixel size.
 x.drawImage(qr,p,p);x.textAlign='center';x.textBaseline='middle';
 function line(value,y,size,bold,color){x.fillStyle=color;let px=size;do{x.font=(bold?'700 ':'400 ')+px+'px Arial, "Noto Sans KR", "Microsoft YaHei", sans-serif';if(x.measureText(value).width<=w-2*p)break;px--;}while(px>10);x.fillText(value,w/2,y,w-2*p);}
 line(title,textY,Math.round(q*.062),true,frame==='sunshine'?'white':ink);line(description,textY+Math.round(q*.105),Math.round(q*.042),false,ink);return c;
}
