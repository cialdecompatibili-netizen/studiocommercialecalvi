// GUIDA-SVILUPPO: caricato per ULTIMO da admin/index.html. Editor VISUALE delle sezioni (box) di Home e Pagine, per chi non conosce l'HTML.
// COSA FA: ridefinisce window.renderPagBlocchi e window.aggiungiPagBlocco (definite nello script inline). Per ogni sezione legge l'HTML del box
//   (_pagBlocchi[i].html), lo analizza con DOMParser e mostra campi semplici: Titolo, Testo, Voce elenco (+/-), Pulsante (testo+link), Link, Immagine (scelta dalla libreria foto).
//   Modifica SOLO testi/attributi dei nodi esistenti e riscrive b.html: la struttura e le classi del sito non si toccano. Il salvataggio resta quello di salvaPagina().
// NON toccare: __BASEURL__ nei link/foto viene nascosto a video e rimesso da solo. Box con Liquid ({% / {{) -> solo modalita' avanzata (HTML).
// Se b.html non cambia (nessuna modifica) l'HTML originale resta identico: si riscrive solo quando l'utente scrive in un campo.
(function(){
const BASE=location.origin+location.pathname.replace(/\/admin\/?.*$/,'/');
const h=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const mk=(t,c,html)=>{const e=document.createElement(t);if(c)e.className=c;if(html!=null)e.innerHTML=html;return e;};
const OPEN=new Set(),ADV=new Set(),DYN=/\{%|\{\{/;
const st=document.createElement('style');
st.textContent='.vb{border:1px solid #dcdcde;border-radius:6px;margin-bottom:10px;background:#fff}.vb.off{opacity:.65}.vb-h{display:flex;gap:8px;align-items:center;padding:8px 10px;flex-wrap:wrap}'
+'.vb-b{padding:4px 14px 14px;border-top:1px solid #dcdcde;background:#fafafa;border-radius:0 0 6px 6px}.vb-hint{font-size:13px;color:#646970;margin:0 0 10px}'
+'.vf-l{display:block;font-size:11px;color:#646970;text-transform:uppercase;letter-spacing:.4px;margin:12px 0 3px}.vf{min-height:34px;border:1px solid #8c8f94;border-radius:4px;padding:6px 10px;font-size:14px;line-height:1.5;background:#fff;color:#1d2327}'
+'.vf:focus{outline:2px solid #2271b1;outline-offset:0}.vf-h{font-weight:600;font-size:16px}.vf-in{width:100%;box-sizing:border-box}.vf-r{display:flex;gap:8px;align-items:flex-start}.vf-r>*{flex:1}.vf-r>.btn{flex:none}'
+'.vf-tb{display:flex;gap:6px;flex-wrap:wrap;position:sticky;top:0;z-index:2;background:#f0f0f1;padding:6px;border-radius:4px;margin:10px 0 0;align-items:center}.vf-tb span{font-size:12px;color:#646970;margin-left:6px}'
+'.vf-im{width:120px;height:80px;object-fit:cover;border:1px solid #dcdcde;border-radius:4px;background:#f0f0f1;flex:none}.vf-note{font-size:12px;color:#646970;margin:8px 0}';
document.head.appendChild(st);

const parse=html=>new DOMParser().parseFromString('<body>'+html+'</body>','text/html');
const SKIP=/^(script|style|video|svg|iframe|form|noscript|source)$/, BLOCKY='p,h1,h2,h3,h4,h5,h6,li,ul,ol,div,section,article,aside,table,figure,blockquote,header,footer,nav';
function collect(root){
  const out=[];
  (function w(n){
    for(const c of n.children){
      const t=c.tagName.toLowerCase();
      if(SKIP.test(t))continue;
      if(t==='img'){out.push({k:'img',el:c});continue;}
      if(t==='a'){out.push({k:/btn|button/i.test(c.className)?'btn':'link',el:c});continue;}
      if(/^(h[1-6]|p|li|figcaption|blockquote|dt|dd|td|th)$/.test(t)&&!c.querySelector(BLOCKY)){
        if(c.querySelector('img')){w(c);continue;}
        if(c.textContent.trim())out.push({k:'rich',el:c,t});
        continue;
      }
      if(/^(b|strong|span|small|label|em|i)$/.test(t)&&!c.querySelector(BLOCKY)){
        const tx=c.textContent.trim();
        if(c.querySelector('a,img')){w(c);continue;}
        if(tx&&!/^[\d\s.+%\-]+$/.test(tx))out.push({k:'rich',el:c,t});
        continue;
      }
      w(c);
    }
  })(root);
  return out;
}
const lastText=a=>{const w=a.ownerDocument.createTreeWalker(a,NodeFilter.SHOW_TEXT);let l=null,n;while((n=w.nextNode())){if(n.nodeValue.trim())l=n;}return l;};
const hadBase=v=>/^__BASEURL__/.test(v||'');
const showUrl=v=>hadBase(v)?(v.slice(11)||'/'):(v||'');
const saveUrl=(val,had)=>(had&&/^\/(?!\/)/.test(val))?'__BASEURL__'+val:val;
function realSrc(v){
  if(!v)return '';
  if(hadBase(v))return BASE.replace(/\/$/,'')+v.slice(11);
  if(/^\/(?!\/)/.test(v))return location.origin+v;
  return v;
}
const inp=(val,ph)=>{const e=mk('input','vf-in');e.type='text';e.value=val||'';if(ph)e.placeholder=ph;return e;};
const lab=t=>mk('label','vf-l',h(t));

function addTextUrl(box,f,commit,tl,ul){
  const a=f.el, ln=lastText(a), lead=ln&&/^\s/.test(ln.nodeValue)?' ':'';
  box.appendChild(lab(tl));
  const t=inp(ln?ln.nodeValue.trim():'');
  t.oninput=()=>{let n=lastText(a);if(!n){n=a.ownerDocument.createTextNode('');a.appendChild(n);}n.nodeValue=lead+t.value;commit();};
  box.appendChild(t);
  box.appendChild(lab(ul));
  const had=hadBase(a.getAttribute('href')), u=inp(showUrl(a.getAttribute('href')),'es. /contatti/  oppure  https://...');
  u.oninput=()=>{a.setAttribute('href',saveUrl(u.value.trim(),had));commit();};
  box.appendChild(u);
}

function renderBody(body,b,i,rerender){
  const adv=ADV.has(b.id)||DYN.test(b.html||'');
  body.innerHTML='';
  if(adv){
    body.appendChild(mk('p','vf-note',DYN.test(b.html||'')?'Questa sezione contiene elementi dinamici del sito: si modifica solo in HTML.':'Modalita\' avanzata: HTML della sezione.'));
    const ta=mk('textarea');ta.style.cssText='width:100%;min-height:220px;font-family:monospace;font-size:12px;box-sizing:border-box';ta.value=b.html||'';
    ta.onchange=()=>{b.html=ta.value;};body.appendChild(ta);
    if(!DYN.test(b.html||'')){const bt=mk('button','btn btn-secondary btn-sm','Torna all\'editor semplice');bt.style.marginTop='8px';bt.onclick=()=>{b.html=ta.value;ADV.delete(b.id);rerender();};body.appendChild(bt);}
    return;
  }
  const doc=parse(b.html||''), fields=collect(doc.body), commit=()=>{b.html=doc.body.innerHTML;};
  // barra strumenti (agisce sul testo selezionato dentro un campo)
  const tb=mk('div','vf-tb');
  const act=(label,title,fn)=>{const x=mk('button','btn btn-secondary btn-sm',label);x.type='button';x.title=title;x.onmousedown=e=>e.preventDefault();x.onclick=()=>{
    const ae=document.activeElement;if(!ae||!ae.classList||!ae.classList.contains('vf')||!body.contains(ae)){alert('Clicca prima dentro un testo e seleziona le parole.');return;}
    fn();ae.dispatchEvent(new Event('input',{bubbles:true}));};tb.appendChild(x);};
  act('<b>G</b>','Grassetto',()=>document.execCommand('bold'));
  act('<i>C</i>','Corsivo',()=>document.execCommand('italic'));
  act('Link','Trasforma il testo selezionato in un link',()=>{const u=prompt('Indirizzo del link (es. /contatti/ oppure https://...):');if(u)document.execCommand('createLink',false,/^\/(?!\/)/.test(u)?'__BASEURL__'+u:u);});
  act('Togli link','Rimuove il link dal testo selezionato',()=>document.execCommand('unlink'));
  tb.appendChild(mk('span',null,'Seleziona le parole, poi clicca.'));
  body.appendChild(tb);
  if(doc.body.querySelector('video'))body.appendChild(mk('p','vf-note','Video di sfondo: gestito dal sito (non si modifica da qui).'));
  if(!fields.length)body.appendChild(mk('p','vf-note','Nessun testo modificabile in questa sezione.'));
  fields.forEach(f=>{
    if(f.k==='rich'){
      const nm=/^h1$/.test(f.t)?'Titolo principale':/^h[2-6]$/.test(f.t)?'Titolo':f.t==='li'?'Voce elenco':'Testo';
      body.appendChild(lab(nm));
      const r=mk('div','vf-r'), ed=mk('div','vf'+(/^h/.test(f.t)?' vf-h':''));
      ed.contentEditable='true';ed.innerHTML=f.el.innerHTML;
      ed.addEventListener('input',()=>{f.el.innerHTML=ed.innerHTML;commit();});
      ed.addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault();});
      ed.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'));});
      r.appendChild(ed);
      if(f.t==='li'){const x=mk('button','btn btn-danger btn-sm','Togli');x.type='button';x.onclick=()=>{f.el.remove();commit();rerender();};r.appendChild(x);}
      body.appendChild(r);
      if(f.t==='li'&&f.el.parentElement&&f.el.parentElement.lastElementChild===f.el){
        const ad=mk('button','btn btn-secondary btn-sm','+ Aggiungi voce');ad.type='button';ad.style.marginTop='6px';
        ad.onclick=()=>{const n=f.el.cloneNode(true);n.innerHTML='Nuova voce';f.el.parentElement.appendChild(n);commit();rerender();};body.appendChild(ad);
      }
    }else if(f.k==='btn'||f.k==='link'){
      addTextUrl(body,f,commit,f.k==='btn'?'Pulsante: testo':'Link: testo',f.k==='btn'?'Pulsante: dove porta':'Link: dove porta');
    }else if(f.k==='img'){
      body.appendChild(lab('Immagine'));
      const r=mk('div','vf-r'), th=mk('img','vf-im'), c=mk('div'), had=hadBase(f.el.getAttribute('src'));
      th.alt='';th.src=realSrc(f.el.getAttribute('src'));
      const u=inp(showUrl(f.el.getAttribute('src')),'indirizzo della foto');
      const setSrc=v=>{f.el.setAttribute('src',saveUrl(v,had));th.src=realSrc(f.el.getAttribute('src'));commit();};
      u.oninput=()=>setSrc(u.value.trim());
      const pk=mk('button','btn btn-secondary btn-sm','Scegli foto');pk.type='button';pk.style.marginTop='6px';
      pk.onclick=()=>{if(!window.openMediaLib)return alert('Libreria foto non disponibile.');window.openMediaLib({mode:'pick',onSelect:(it,alt)=>{
        const full=window.FOTOLIB.url(it.f),k=full.indexOf('/assets/'),rel=k>=0?full.slice(k):full;
        f.el.setAttribute('src',(k>=0?'__BASEURL__':'')+rel);th.src=full;u.value=showUrl(f.el.getAttribute('src'));
        if(alt)f.el.setAttribute('alt',alt),al.value=alt; commit();}});};
      const al=inp(f.el.getAttribute('alt')||'','Descrizione della foto (utile per Google)');
      al.oninput=()=>{f.el.setAttribute('alt',al.value);commit();};
      c.appendChild(u);c.appendChild(pk);c.appendChild(mk('div','vf-note','Descrizione della foto:'));c.appendChild(al);
      r.appendChild(th);r.appendChild(c);body.appendChild(r);
    }
  });
  const av=mk('button','btn btn-secondary btn-sm','Modifica HTML (avanzato)');av.type='button';av.style.marginTop='14px';
  av.onclick=()=>{ADV.add(b.id);rerender();};body.appendChild(av);
}

window.renderPagBlocchi=function(){
  const el=document.getElementById('lista-pag-blocchi'); if(!el)return;
  el.innerHTML='';
  if(!_pagBlocchi.length){el.innerHTML='<span style="color:#bbb;font-size:13px">Nessuna sezione. Aggiungine una qui sotto.</span>';return;}
  el.appendChild(mk('p','vb-hint','Clicca <b>Modifica</b> su una sezione per cambiare testi, link e foto. Le frecce spostano la sezione, <b>Attivo</b> la mostra o la nasconde nel sito.'));
  _pagBlocchi.forEach((b,i)=>{
    if(!b.id)b.id='box'+i;
    const box=mk('div','vb'+(b.enabled?'':' off')), hd=mk('div','vb-h'), body=mk('div','vb-b');
    body.style.display=OPEN.has(b.id)?'block':'none';
    const ar=mk('div');ar.style.cssText='display:flex;flex-direction:column;gap:2px';
    [['\u25B2','pagBlockSu',i===0],['\u25BC','pagBlockGiu',i===_pagBlocchi.length-1]].forEach(([s,fn,dis])=>{const x=mk('button','btn btn-secondary btn-sm',s);x.style.cssText='padding:1px 7px;font-size:11px;line-height:1';x.disabled=dis;x.onclick=()=>window[fn](i);ar.appendChild(x);});
    const nm=inp(b.nome||b.id||'','Nome sezione');nm.style.cssText='flex:1;min-width:140px;font-weight:600';nm.onchange=()=>{b.nome=nm.value;};
    const lb=mk('label');lb.style.cssText='display:flex;align-items:center;gap:5px;font-size:12px;color:#555;white-space:nowrap';
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!b.enabled;cb.style.width='auto';cb.onchange=()=>{b.enabled=cb.checked;box.classList.toggle('off',!cb.checked);};
    lb.appendChild(cb);lb.appendChild(document.createTextNode('Attivo'));
    const tg=mk('button','btn btn-primary btn-sm',OPEN.has(b.id)?'Chiudi':'Modifica');
    tg.onclick=()=>{if(OPEN.has(b.id)){OPEN.delete(b.id);body.style.display='none';tg.textContent='Modifica';}else{OPEN.add(b.id);body.style.display='block';tg.textContent='Chiudi';}};
    const dl=mk('button','btn btn-danger btn-sm','\uD83D\uDDD1');dl.title='Elimina sezione';
    dl.onclick=()=>{if(confirm('Eliminare la sezione "'+(b.nome||b.id)+'"?')){_pagBlocchi.splice(i,1);window.renderPagBlocchi();}};
    [ar,nm,lb,tg,dl].forEach(x=>hd.appendChild(x));
    box.appendChild(hd);box.appendChild(body);el.appendChild(box);
    renderBody(body,b,i,()=>window.renderPagBlocchi());
  });
};
window.aggiungiPagBlocco=function(){
  const id='box'+Date.now(); OPEN.add(id);
  _pagBlocchi.push({id,nome:'Nuova sezione',enabled:true,html:'<div class="gc"><section class="gc-sec"><div class="gc-wrap"><h2 class="gc-h2">Titolo della sezione</h2><p class="gc-lead">Scrivi qui il testo della sezione.</p></div></section></div>'});
  window.renderPagBlocchi();
};
document.querySelectorAll('button[onclick="aggiungiPagBlocco()"]').forEach(x=>{x.textContent='+ Nuova sezione';});
})();
