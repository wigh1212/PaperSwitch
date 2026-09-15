export function wifiPayload({ssid,password='',security='WPA',hidden=false}){
 if(!ssid||new TextEncoder().encode(ssid).length>32||!['WPA','WEP','nopass'].includes(security)||(security!=='nopass'&&!password))throw Error('Enter a network name and password, or choose an open network.');
 const escape=value=>value.replace(/[\\;,:"]/g,c=>'\\'+c);
 return 'WIFI:T:'+security+';S:'+escape(ssid)+';P:'+escape(security==='nopass'?'':password)+';H:'+hidden+';;';
}
