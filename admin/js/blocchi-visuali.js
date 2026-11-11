// GUIDA-SVILUPPO: caricato per ULTIMO da admin/index.html. Editor VISUALE (WYSIWYG) delle sezioni (box) di Home e Pagine, per chi non conosce l'HTML.
// COSA FA: ridefinisce window.renderPagBlocchi e window.aggiungiPagBlocco (definite nello script inline). Ogni sezione = una riga (frecce, nome, Attivo, cestino)
//   + pulsante Modifica che apre UN SOLO editor: un iframe con gli stessi CSS del sito (main.css, gaming.css, home.css) e il contenuto della sezione
//   modificabile direttamente (contenteditable). Barra: Grassetto, Corsivo, Titolo, Testo, Elenco, Link, Togli link, Cambia foto (clic sulla foto), Annulla/Ripeti.
// COME SALVA: ad ogni modifica riscrive _pagBlocchi[i].html; il salvataggio resta quello di salvaPagina(). Se non si scrive nulla l'HTML resta identico.
// ATTENZIONE: __BASEURL__ nelle foto viene sostituito con l'URL reale solo per la visualizzazione e rimesso in salvataggio (prep/unprep). Il <video> di sfondo
//   diventa un segnaposto non modificabile e viene rimesso uguale (vids[]). Box con Liquid ({% / {{) -> solo modalita' avanzata (HTML).
(function(){
const BASE=location.origin+location.pathname.replace(/\/admin\/?.*$/,'/'), BS=BASE.replace(/\/$/,'');
const mk=(t,c,html)=>{const e=document.createElement(t);if(c)e.className=c;if(html!=null)e.innerHTML=html;return e;};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const OPEN=new Set(),ADV=new Set(),DYN=/\{%|\{\{/;
const st=document.createElement('style');
st.textContent='.vb{border:1px solid #dcdcde;border-radius:6px;margin-bottom:10px;background:#fff}.vb.off{opacity:.65}.vb-h{display:flex;gap:8px;align-items:center;padding:8px 10px;flex-wrap:wrap}'
+'.vb-b{padding:10px 12px 14px;border-top:1px solid #dcdcde;background:#fafafa;border-radius:0 0 6px 6px}.vb-hint{font-size:13px;color:#646970;margin:0 0 10px}'
+'.vf-tb{display:flex;gap:6px;flex-wrap:wrap;position:sticky;top:0;z-index:3;background:#f0f0f1;padding:6px;border-radius:4px;margin:0 0 8px;align-items:center}.vf-tb span{font-size:12px;color:#646970;margin-left:6px}'
+'.vb-fr{width:100%;border:1px solid #8c8f94;border-radius:4px;background:#fff;display:block;min-height:160px}.vf-note{font-size:12px;color:#646970;margin:8px 0}';
document.head.appendChild(st);

// html del box -> html da mostrare nell'iframe (video -> segnaposto, __BASEURL__ nelle foto -> URL reale)
function prep(html){
  const vids=[];
  let d=(html||'').replace(/<video[\s\S]*?<\/video>/gi,m=>{vids.push(m);return '<div data-vph="'+(vids.length-1)+'" contenteditable="false" class="vph">Video di sfondo (gestito dal sito)</div>';});
  d=d.replace(/(src|poster)="__BASEURL__/g,'$1="'+BS);
  return {d,vids};
}
// html dell'iframe -> html del box (operazione inversa, ripulita dagli attributi dell'editor)
function unprep(s,vids){
  s=s.replace(/<div[^>]*data-vph="(\d+)"[^>]*>[\s\S]*?<\/div>/g,(m,i)=>vids[+i]||'');
  s=s.replace(new RegExp('(src|poster)="'+esc(BS),'g'),'$1="__BASEURL__');
  return s.replace(/\scontenteditable="[^"]*"/g,'').replace(/\sdata-sel="[^"]*"/g,'');
}
window._vbTest={prep,unprep};

function editor(body,b,rerender){
  const {d,vids}=prep(b.html);
  const ifr=mk('iframe','vb-fr'), tb=mk('div','vf-tb');
  let D=null,W=null,curImg=null;
  // ANTI-LOOP: si misura body.offsetHeight (NON documentElement.scrollHeight, che e' sempre >= altezza iframe e non scende mai: con elementi in vh/100% l'iframe cresceva all'infinito).
  // Si aggiorna solo se cambia di oltre 3px e c'e' un tetto massimo (MAXH) di sicurezza.
  const MAXH=1600;
  const fit=()=>{if(!D||!D.body)return;const h=Math.min(MAXH,Math.max(160,D.body.offsetHeight+4));if(Math.abs(h-(parseInt(ifr.style.height)||0))>3)ifr.style.height=h+'px';};
  const commit=()=>{b.html=unprep(D.body.innerHTML,vids);fit();};
  const cmd=(c,v)=>{W.focus();D.execCommand(c,false,v);commit();};
  const up=n=>{while(n&&n.nodeType!==1)n=n.parentNode;return n;};
  const anc=(tag)=>{const s=W.getSelection();let n=s&&s.anchorNode?up(s.anchorNode):null;while(n&&n!==D.body){if(n.tagName&&n.tagName.toLowerCase()===tag)return n;n=n.parentNode;}return null;};
  const btn=(label,title,fn)=>{const x=mk('button','btn btn-secondary btn-sm',label);x.type='button';x.title=title;x.onmousedown=e=>e.preventDefault();x.onclick=()=>{if(D)fn();};tb.appendChild(x);};
  btn('<b>G</b>','Grassetto (parole selezionate)',()=>cmd('bold'));
  btn('<i>C</i>','Corsivo',()=>cmd('italic'));
  btn('Titolo','Trasforma il paragrafo in titolo',()=>{cmd('formatBlock','h2');const h=anc('h2');if(h&&!h.className){h.className='gc-h2';commit();}});
  btn('Testo','Trasforma in paragrafo normale',()=>cmd('formatBlock','p'));
  btn('\u2022 Elenco','Elenco puntato',()=>cmd('insertUnorderedList'));
  btn('Link','Link sulle parole selezionate (o cambia il link dove sei)',()=>{
    const a=anc('a'), cur=a?(a.getAttribute('href')||'').replace(/^__BASEURL__/,''):'';
    const u=prompt('Dove deve portare il link? (es. /contatti/ oppure https://...)',cur);
    if(u==null||!u.trim())return; const v=/^\/(?!\/)/.test(u.trim())?'__BASEURL__'+u.trim():u.trim();
    if(a){a.setAttribute('href',v);commit();}else cmd('createLink',v);
  });
  btn('Togli link','Rimuove il link',()=>cmd('unlink'));
  btn('Cambia foto','Prima clicca su una foto nella sezione',()=>{
    if(!curImg)return alert('Clicca prima su una foto nella sezione, poi su "Cambia foto".');
    if(!window.openMediaLib)return alert('Libreria foto non disponibile.');
    window.openMediaLib({mode:'pick',onSelect:(it,alt)=>{const full=window.FOTOLIB.url(it.f);curImg.setAttribute('src',full);if(alt)curImg.setAttribute('alt',alt);commit();}});
  });
  btn('\u21B6','Annulla',()=>cmd('undo'));
  btn('\u21B7','Ripeti',()=>cmd('redo'));
  tb.appendChild(mk('span',null,'Scrivi direttamente nella sezione. Per le foto: clicca la foto, poi "Cambia foto".'));
  body.appendChild(tb);body.appendChild(ifr);
  const css=['assets/css/main.css','assets/css/gaming.css','assets/css/home.css'].map(x=>'<link rel="stylesheet" href="'+BASE+x+'">').join('')
    +'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">';
  ifr.srcdoc='<!doctype html><html><head><meta charset="utf-8">'+css
    +'<style>html,body{margin:0;background:#fff;height:auto!important;min-height:0!important}section,.ent-hero,.gc-sec,[class*=hero]{min-height:0!important;height:auto!important;max-height:none!important}.ent-vid{display:none!important}body{outline:none;cursor:text}'
    +'.vph{background:#eef1fb;border:1px dashed #99a;padding:14px;text-align:center;font:13px sans-serif;color:#556;margin:8px}a{cursor:text}img{cursor:pointer}img[data-sel]{outline:3px solid #2271b1;outline-offset:2px}</style></head>'
    +'<body contenteditable="true">'+d+'</body></html>';
  ifr.onload=()=>{
    D=ifr.contentDocument;W=ifr.contentWindow;fit();
    D.addEventListener('input',commit);
    D.addEventListener('click',e=>{
      const a=up(e.target)&&up(e.target).closest&&up(e.target).closest('a'); if(a)e.preventDefault();
      D.querySelectorAll('img[data-sel]').forEach(x=>x.removeAttribute('data-sel'));
      const im=e.target.tagName==='IMG'?e.target:null; curImg=im; if(im)im.setAttribute('data-sel','1');
    });
    D.addEventListener('paste',e=>{e.preventDefault();D.execCommand('insertText',false,(e.clipboardData||W.clipboardData).getData('text/plain'));});
    try{new ResizeObserver(fit).observe(D.body);}catch(e){}
    D.querySelectorAll('img').forEach(i=>i.addEventListener('load',fit));
  };
}

function renderBody(body,b,rerender){
  body.innerHTML='';
  const dyn=DYN.test(b.html||'');
  if(dyn||ADV.has(b.id)){
    body.appendChild(mk('p','vf-note',dyn?'Questa sezione contiene elementi dinamici del sito: si modifica solo in HTML.':'Modalita\' avanzata: HTML della sezione.'));
    const ta=mk('textarea');ta.style.cssText='width:100%;min-height:220px;font-family:monospace;font-size:12px;box-sizing:border-box';ta.value=b.html||'';
    ta.onchange=()=>{b.html=ta.value;};body.appendChild(ta);
    if(!dyn){const bt=mk('button','btn btn-secondary btn-sm','Torna all\'editor visuale');bt.style.marginTop='8px';bt.onclick=()=>{b.html=ta.value;ADV.delete(b.id);rerender();};body.appendChild(bt);}
    return;
  }
  editor(body,b,rerender);
  const av=mk('button','btn btn-secondary btn-sm','Modifica HTML (avanzato)');av.type='button';av.style.marginTop='10px';
  av.onclick=()=>{ADV.add(b.id);rerender();};body.appendChild(av);
}

window.renderPagBlocchi=function(){
  const el=document.getElementById('lista-pag-blocchi'); if(!el)return;
  el.innerHTML='';
  if(!_pagBlocchi.length){el.innerHTML='<span style="color:#bbb;font-size:13px">Nessuna sezione. Aggiungine una qui sotto.</span>';return;}
  el.appendChild(mk('p','vb-hint','Ogni riga e\' una sezione della pagina. Clicca <b>Modifica</b> per scrivere direttamente nella sezione. Le frecce la spostano, <b>Attivo</b> la mostra o la nasconde nel sito.'));
  _pagBlocchi.forEach((b,i)=>{
    if(!b.id)b.id='box'+i;
    const box=mk('div','vb'+(b.enabled?'':' off')), hd=mk('div','vb-h'), body=mk('div','vb-b');
    body.style.display=OPEN.has(b.id)?'block':'none';
    const ar=mk('div');ar.style.cssText='display:flex;flex-direction:column;gap:2px';
    [['\u25B2','pagBlockSu',i===0],['\u25BC','pagBlockGiu',i===_pagBlocchi.length-1]].forEach(([s,fn,dis])=>{const x=mk('button','btn btn-secondary btn-sm',s);x.style.cssText='padding:1px 7px;font-size:11px;line-height:1';x.disabled=dis;x.onclick=()=>window[fn](i);ar.appendChild(x);});
    const nm=mk('input');nm.type='text';nm.value=b.nome||b.id||'';nm.placeholder='Nome sezione';nm.style.cssText='flex:1;min-width:140px;font-weight:600';nm.onchange=()=>{b.nome=nm.value;};
    const lb=mk('label');lb.style.cssText='display:flex;align-items:center;gap:5px;font-size:12px;color:#555;white-space:nowrap';
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!b.enabled;cb.style.width='auto';cb.onchange=()=>{b.enabled=cb.checked;box.classList.toggle('off',!cb.checked);};
    lb.appendChild(cb);lb.appendChild(document.createTextNode('Attivo'));
    const tg=mk('button','btn btn-primary btn-sm',OPEN.has(b.id)?'Chiudi':'Modifica');
    tg.onclick=()=>{if(OPEN.has(b.id)){OPEN.delete(b.id);body.style.display='none';body.innerHTML='';tg.textContent='Modifica';}else{OPEN.add(b.id);body.style.display='block';renderBody(body,b,()=>window.renderPagBlocchi());tg.textContent='Chiudi';}};
    const dl=mk('button','btn btn-danger btn-sm','\uD83D\uDDD1');dl.title='Elimina sezione';
    dl.onclick=()=>{if(confirm('Eliminare la sezione "'+(b.nome||b.id)+'"?')){_pagBlocchi.splice(i,1);window.renderPagBlocchi();}};
    [ar,nm,lb,tg,dl].forEach(x=>hd.appendChild(x));
    box.appendChild(hd);box.appendChild(body);el.appendChild(box);
    if(OPEN.has(b.id))renderBody(body,b,()=>window.renderPagBlocchi());   // l'editor si crea solo per le sezioni aperte
  });
};
window.aggiungiPagBlocco=function(){
  const id='box'+Date.now(); OPEN.add(id);
  _pagBlocchi.push({id,nome:'Nuova sezione',enabled:true,html:'<div class="gc"><section class="gc-sec"><div class="gc-wrap"><h2 class="gc-h2">Titolo della sezione</h2><p class="gc-lead">Scrivi qui il testo della sezione.</p></div></section></div>'});
  window.renderPagBlocchi();
};
document.querySelectorAll('button[onclick="aggiungiPagBlocco()"]').forEach(x=>{x.textContent='+ Nuova sezione';});
})();
