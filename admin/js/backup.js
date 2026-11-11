// GUIDA-SVILUPPO: caricato per ULTIMO da admin/index.html. Backup/ripristino del sito (logica portata da alfoliotemplate1/admin/admin-backup.js).
// COSA FA: un backup = un branch "backup-AAAA-MM-GG-HHMM" che punta al commit attuale di main (2 chiamate API, istantaneo, nessuna copia di file).
// Ripristino = NUOVO commit sopra main con l'albero (tree) del backup, aggiornamento SENZA force: la cronologia non si perde e se main e' cambiato
//   nel frattempo GitHub rifiuta e non si sovrascrive niente. Prima del ripristino si crea in automatico "...-pre-ripristino" (annullabile).
// PUNTI CRITICI: (1) mai force:true su main. (2) il ripristino annulla TUTTO cio' che e' stato fatto dopo il backup (anche articoli dall'admin).
//   (3) se il backup differisce nei file di .github/workflows GitHub puo' rifiutare senza il permesso "workflow" sul token: l'errore e' mostrato com'e'.
//   (4) dopo il ripristino il sito si ricostruisce (2-3 minuti). (5) Elimina cancella SOLO il branch backup, il sito non cambia.
(function(){
const $=id=>document.getElementById(id);
const h=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const p2=n=>(n<10?'0':'')+n;
let BRN='main',LIST=[],INFO={},NEW=null;
async function api(m,path,body){
  const r=await fetch('https://api.github.com/repos/'+REPO+path,{method:m,headers:{'Authorization':'token '+tok(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  let j=null; try{j=await r.json();}catch(e){}
  if(!r.ok){const e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e;}
  return j;
}
const msg=(t,c)=>showMsg('msg-backup',t,c||'');
const stamp=()=>{const d=new Date();return 'backup-'+d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes());};
const headSha=async()=>(await api('GET','/git/ref/heads/'+BRN)).object.sha;
const fmt=iso=>{if(!iso)return '';const d=new Date(iso);return isNaN(d)?'':p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear()+' '+p2(d.getHours())+':'+p2(d.getMinutes());};
// data/ora = ultimo commit del backup (cache per sha, uno sha non cambia mai); richieste a gruppi di 6
async function loadInfo(list){
  const u=[]; list.forEach(b=>{if(!(b.sha in INFO)&&u.indexOf(b.sha)<0)u.push(b.sha);});
  for(let i=0;i<u.length;i+=6)await Promise.all(u.slice(i,i+6).map(s=>api('GET','/git/commits/'+s).then(c=>{INFO[s]={when:c.committer&&c.committer.date,msg:(c.message||'').split('\n')[0]};},()=>{})));
}
function when(b){
  const m=/(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(?!\d)/.exec(b.name);
  if(m)return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]).getTime();
  const t=new Date((INFO[b.sha]||{}).when||0).getTime(); return isNaN(t)?0:t;
}
window.caricaBackup=async function(){
  const el=$('lista-backup'); if(!el)return;
  if(!tok()){el.innerHTML='<em style="color:#646970;font-size:13px">Token mancante.</em>';return;}
  el.innerHTML='<em style="color:#646970;font-size:13px">Caricamento...</em>';
  try{
    BRN=(await api('GET','')).default_branch||'main';
    const head=await headSha();
    LIST=(await api('GET','/git/matching-refs/heads/backup-?per_page=100')).map(r=>({name:r.ref.replace('refs/heads/',''),sha:r.object.sha}));
    // matching-refs puo' essere in ritardo di qualche secondo dopo la creazione: unisco il backup appena creato se manca
    if(NEW&&!LIST.some(b=>b.name===NEW.name))LIST.push(NEW);
    await loadInfo(LIST);
    LIST.sort((a,b)=>{const d=when(b)-when(a);return d||(a.name<b.name?1:-1);});
    let undo=-1; LIST.forEach((b,i)=>{if(undo<0&&/-pre-ripristino$/.test(b.name)&&b.sha!==head)undo=i;});
    const rows=LIST.map((b,i)=>{
      const same=b.sha===head,inf=INFO[b.sha]||{},pre=/-pre-ripristino$/.test(b.name),parts=[fmt(inf.when),b.sha.slice(0,7)];
      if(pre)parts.unshift('stato prima di un ripristino'); if(same)parts.push('identico allo stato attuale'); if(inf.msg)parts.push(inf.msg);
      return '<tr><td>'+h(b.name)+'<div class="wp-n" style="font-size:12px">'+h(parts.filter(Boolean).join(' \u00b7 '))+'</div></td><td style="white-space:nowrap;text-align:right">'
        +(same?'':'<button class="btn btn-danger btn-sm" data-a="r" data-i="'+i+'">'+(pre?'Torna avanti':'Ripristina')+'</button> ')
        +'<button class="btn btn-secondary btn-sm" data-a="d" data-i="'+i+'">Elimina</button></td></tr>';
    }).join('');
    el.innerHTML=(undo<0?'':'<p style="margin:0 0 12px"><button class="btn btn-danger btn-sm" data-a="r" data-i="'+undo+'">\u21b6 Annulla ultimo ripristino</button></p>')
      +(rows?'<table class="wp-list"><tbody>'+rows+'</tbody></table>':'<em style="color:#646970;font-size:13px">Nessun backup.</em>');
    el.querySelectorAll('button[data-a]').forEach(b=>b.onclick=()=>(b.dataset.a==='r'?ripristina:elimina)(+b.dataset.i));
  }catch(e){el.innerHTML='<em style="color:#646970;font-size:13px">Errore: '+h(e.message)+'</em>';}
};
window.nuovoBackup=async function(){
  if(!tok())return msg('Token mancante.','err');
  const nm=stamp(); msg('Creo il backup...');
  try{
    BRN=(await api('GET','')).default_branch||'main';
    const sh=await headSha(); await api('POST','/git/refs',{ref:'refs/heads/'+nm,sha:sh}); NEW={name:nm,sha:sh};
    msg('Backup creato: '+nm,'ok'); window.caricaBackup();
  }catch(e){msg(e.status===422?'Esiste gia\' un backup di questo minuto ('+nm+')':'Errore: '+e.message,'err');}
};
async function elimina(i){
  const b=LIST[i]; if(!b||b.name.indexOf('backup-')!==0||b.name===BRN)return;
  if(!confirm('Eliminare il backup "'+b.name+'"?\n\nIl sito non cambia. Non potrai piu\' ripristinare questo backup dall\'admin.'))return;
  try{await api('DELETE','/git/refs/heads/'+b.name);if(NEW&&NEW.name===b.name)NEW=null;msg('Backup eliminato: '+b.name,'ok');window.caricaBackup();}
  catch(e){msg('Errore: '+e.message,'err');}
}
async function ripristina(i){
  const b=LIST[i]; if(!b)return; const pre=stamp()+'-pre-ripristino';
  try{
    const head=await headSha();
    if(b.sha===head)return msg('Il backup e\' identico allo stato attuale: niente da ripristinare.','');
    let ahead=null; try{ahead=(await api('GET','/compare/'+b.sha+'...'+head)).ahead_by;}catch(e){}
    if(!confirm('Ripristinare "'+b.name+'"?\n\n'+(ahead!=null?'Verranno annullati '+ahead+' commit fatti dopo questo backup (articoli, modifiche, foto).\n':'Verra\' annullato tutto quello fatto dopo questo backup.\n')+'Prima viene creato un backup dello stato attuale ('+pre+'), cosi\' puoi tornare indietro.'))return;
    msg('Ripristino in corso...');
    await api('POST','/git/refs',{ref:'refs/heads/'+pre,sha:head});
    const c=await api('GET','/git/commits/'+b.sha);
    const nc=await api('POST','/git/commits',{message:'admin: ripristina '+b.name,tree:c.tree.sha,parents:[head]});
    await api('PATCH','/git/refs/heads/'+BRN,{sha:nc.sha,force:false});
    msg('Ripristinato '+b.name+': il sito si aggiorna tra 2-3 minuti.','ok'); window.caricaBackup();
    try{startDeployPolling();}catch(e){}
  }catch(e){msg('Non ripristinato: '+e.message+'. Il sito non e\' stato modificato.','err');}
}
})();
