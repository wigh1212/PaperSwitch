export const frames=[
{id:'none',name:'No frame'}, {id:'classic',name:'Classic',bg:'#ffffff',ink:'#203a2d',radius:0},
{id:'rounded',name:'Rounded',bg:'#edf3f0',ink:'#203a2d',radius:28},
{id:'forest',name:'Forest',bg:'#28684f',ink:'#ffffff',radius:24},
{id:'midnight',name:'Midnight',bg:'#182b49',ink:'#ffffff',radius:24},
{id:'ticket',name:'Ticket',bg:'#fff4df',ink:'#674517',radius:8},
{id:'sunshine',name:'Sunshine',bg:'#ffdb69',ink:'#403514',radius:24},
{id:'rose',name:'Rose',bg:'#f8e4ea',ink:'#752a48',radius:24},
{id:'outline',name:'Outline',bg:'#ffffff',ink:'#203a2d',radius:16}
];
export function frameQR(qr,{frame='none',title='',description=''}={}){
 const style=frames.find(f=>f.id===frame)||frames[1];if(style.id==='none')return qr;
 const pad=Math.max(24,Math.round(qr.width*.065)),caption=title||description?Math.max(110,Math.round(qr.width*.24)):pad;
 const c=document.createElement('canvas');c.width=qr.width+pad*2;c.height=qr.height+pad*2+caption;const x=c.getContext('2d');
 x.fillStyle='#ffffff';x.fillRect(0,0,c.width,c.height);x.fillStyle=style.bg;x.beginPath();x.roundRect(4,4,c.width-8,c.height-8,style.radius);x.fill();
 x.strokeStyle=style.ink;x.lineWidth=3;if(style.id==='outline')x.setLineDash([10,8]);x.stroke();x.setLineDash([]);
 // Draw the entire QR, including its original four-module white quiet zone.
 x.drawImage(qr,pad,pad);
 const top=qr.height+pad*1.5;
 if(style.id==='classic'||style.id==='ticket'){x.beginPath();if(style.id==='ticket')x.setLineDash([8,8]);x.moveTo(pad,top);x.lineTo(c.width-pad,top);x.stroke();x.setLineDash([]);}
 x.fillStyle=style.ink;x.textAlign='center';x.textBaseline='middle';
 function line(value,y,size,bold){if(!value)return;let px=size;const font=()=> (bold?'700 ':'400 ')+px+'px Arial, "Noto Sans KR", "Noto Sans JP", "Microsoft YaHei", sans-serif';x.font=font();while(x.measureText(value).width>c.width-pad*2&&px>10){px--;x.font=font();}x.fillText(value,c.width/2,y,c.width-pad*2);}
 line(title,top+caption*.32,Math.max(24,qr.width*.06),true);line(description,top+caption*.7,Math.max(18,qr.width*.04),false);return c;
}
