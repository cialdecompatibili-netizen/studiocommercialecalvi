// GUIDA-SVILUPPO: caricato per ULTIMO da admin/index.html. Cestino per Articoli e Pagine.
// COSA FA: "Elimina" di Articoli/Pagine non cancella piu': sposta il file in _cestino/<percorso originale>
//   (es. _cestino/_posts/x.md, _cestino/en/_pages/y.md). Jekyll ignora le cartelle con _ iniziale, quindi non va online.
// Voce menu "Cestino": elenco, Ripristina (rimette il file dov'era), Elimina definitivamente.
// Ridefinisce window.eliminaArticolo / window.eliminaPagina (chiamate dagli elenchi di wp-elenchi.js).
// NON toccare: i path sono quelli REALI restituiti da GitHub (lingua inclusa), nessun rimappaggio.
(function(){
const $=id=>document.getElementById(id);
const h=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const T='_cestino/';
const api=(m,p,b)=>fetch('https://api.github.com/repos/'+REPO+'/contents/'+p,{method:m,headers:{'Authorization':'token '+tok(),'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});
const msg=(id,t,c)=>{if($(id))showMsg(id,t,c);};
const deploy=()=>{try{startDeployPolling();}catch(e){}};

// Sposta path -> _cestino/path (copia il contenuto base64 tale e quale, poi cancella l'originale)
async function sposta(path,nome,mid,ricarica){
  if(!tok())return msg(mid,'Token mancante.','err');
  if(!confirm('Spostare "'+nome+'" nel cestino?\n\nPotrai ripristinarlo dalla voce Cestino.'))return;
  msg(mid,'Spostamento nel cestino...','');
  try{
    const r=await api('GET',path); if(!r.ok)throw new Error('lettura '+r.status);
    const d=await r.json();
    const e=await api('GET',T+path); const old=e.ok?(await e.json()).sha:undefined;
    const b={message:'Cestino: '+nome,content:d.content.replace(/\n/g,'')}; if(old)b.sha=old;
    const w=await api('PUT',T+path,b); if(!w.ok)throw new Error('copia '+w.status);
    const x=await api('DELETE',path,{message:'Sposta nel cestino: '+nome,sha:d.sha}); if(!x.ok)throw new Error('rimozione '+x.status);
    msg(mid,'Spostato nel cestino.','ok'); ricarica(); deploy();
  }catch(err){msg(mid,'Errore: '+err.message,'err');}
}
window.eliminaArticolo=(path,sha,nome)=>sposta(path,nome,'msg-art',()=>window.caricaLista&&window.caricaLista());
window.eliminaPagina=(path,sha,nome)=>sposta(path,nome,'msg-pag',()=>window.caricaPagine&&window.caricaPagine());

async function walk(p,out){
  const r=await api('GET',p); if(!r.ok)return;
  for(const f of await r.json()){if(f.type==='dir')await walk(f.path,out);else out.push(f);}
}
window.caricaCestino=async function(){
  const el=$('lista-cestino'); if(!el)return;
  if(!tok()){el.innerHTML='<em style="color:#646970;font-size:13px">Token mancante.</em>';return;}
  el.innerHTML='<em style="color:#646970;font-size:13px">Caricamento...</em>';
  const out=[]; try{await walk('_cestino',out);}catch(e){}
  if(!out.length){el.innerHTML='<em style="color:#646970;font-size:13px">Il cestino e\' vuoto.</em>';return;}
  out.sort((a,b)=>a.path.localeCompare(b.path));
  el.innerHTML='<table class="wp-list"><thead><tr><th>File</th><th>Tipo</th><th>Lingua</th><th></th></tr></thead><tbody>'+out.map(f=>{
    const rel=f.path.slice(T.length), tipo=/(^|\/)_posts\//.test(rel)?'Articolo':'Pagina', m=rel.match(/^([a-z]{2})\//);
    return '<tr><td>'+h(f.name)+'</td><td>'+tipo+'</td><td>'+(m?m[1]:'base')+'</td><td style="white-space:nowrap">'
      +'<button class="btn btn-secondary btn-sm" data-a="r" data-p="'+h(f.path)+'">Ripristina</button> '
      +'<button class="btn btn-danger btn-sm" data-a="d" data-p="'+h(f.path)+'">Elimina definitivamente</button></td></tr>';
  }).join('')+'</tbody></table>';
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>(b.dataset.a==='r'?ripristina:eliminaDef)(b.dataset.p));
};
async function ripristina(p){
  const orig=p.slice(T.length);
  msg('msg-cestino','Ripristino...','');
  try{
    const ex=await api('GET',orig);
    if(ex.ok&&!confirm('Esiste gia\' un file "'+orig+'". Sovrascriverlo?'))return msg('msg-cestino','','');
    const old=ex.ok?(await ex.json()).sha:undefined;
    const r=await api('GET',p); if(!r.ok)throw new Error('lettura '+r.status);
    const d=await r.json();
    const b={message:'Ripristina: '+orig,content:d.content.replace(/\n/g,'')}; if(old)b.sha=old;
    const w=await api('PUT',orig,b); if(!w.ok)throw new Error('ripristino '+w.status);
    const x=await api('DELETE',p,{message:'Ripristinato dal cestino: '+orig,sha:d.sha}); if(!x.ok)throw new Error('pulizia '+x.status);
    msg('msg-cestino','Ripristinato: '+orig,'ok'); window.caricaCestino(); deploy();
    if(window.caricaLista)window.caricaLista(); if(window.caricaPagine)window.caricaPagine();
  }catch(err){msg('msg-cestino','Errore: '+err.message,'err');}
}
async function eliminaDef(p){
  if(!confirm('Eliminare DEFINITIVAMENTE "'+p.slice(T.length)+'"?\n\nQuesta azione non e\' reversibile.'))return;
  try{
    const r=await api('GET',p); if(!r.ok)throw new Error('lettura '+r.status);
    const x=await api('DELETE',p,{message:'Elimina definitivamente: '+p.slice(T.length),sha:(await r.json()).sha}); if(!x.ok)throw new Error('eliminazione '+x.status);
    msg('msg-cestino','Eliminato definitivamente.','ok'); window.caricaCestino();
  }catch(err){msg('msg-cestino','Errore: '+err.message,'err');}
}
})();
