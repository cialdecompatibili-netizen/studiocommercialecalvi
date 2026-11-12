// GUIDA-SVILUPPO: caricato da admin/index.html con <script src> in fondo, DOPO lo script inline. Usa le globali definite li' (tok, ghGet, ghPut, dec, showMsg, REPO, startDeployPolling): non chiamarlo a livello globale prima del load.
// Dopo ogni modifica incrementa il ?v= del suo <script> in admin/index.html (cache del browser) e prova con `node automation/test_admin.js` (nessun errore di avvio, categorie visibili). Regole generali: CLAUDE.md / docs/ERRORI_NOTI.md.
// QUI: pannelli Servizi e Progetti. La configurazione sta nell'oggetto C (cartella, nome, campo di ordinamento). Una nuova collection = nuova voce in C + `collections:` in _config.yml + un layout/lista (ex-lista.html).
// Pannelli Servizi e Progetti (collection _servizi / _progetti). Stessa logica di Prodotti, ma generica.
// Usa le funzioni globali di index.html: tok, ghGet, ghPut, dec, showMsg, startDeployPolling, REPO.
(function(){
const C={
  servizi:{dir:'_servizi',nome:'Servizio',plur:'Servizi',icon:'🛠',ord:'ordine',ordLabel:'Ordine (1 = primo)'},
  progetti:{dir:'_progetti',nome:'Progetto',plur:'Progetti',icon:'🏗',ord:'importance',ordLabel:'Importanza (1 = primo)'}
};
const st={servizi:{path:null},progetti:{path:null}};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
const slug=t=>t.toLowerCase().replace(/[àáâ]/g,'a').replace(/[èéê]/g,'e').replace(/[ìí]/g,'i').replace(/[òó]/g,'o').replace(/[ùú]/g,'u').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');

function build(k){
  const c=C[k];
  return `<div class="page" id="page-${k}">
  <div class="page-title">${c.icon} ${c.plur}</div>
  <div id="c-${k}-lista-view">
    <div style="margin-bottom:16px"><button class="btn btn-primary" onclick="collNuovo('${k}')">✚ Nuovo ${c.nome.toLowerCase()}</button></div>
    <div class="card"><div class="card-title" style="display:flex;justify-content:space-between">${c.plur} pubblicati <button class="btn btn-secondary btn-sm" onclick="collCarica('${k}')">↻ Aggiorna</button></div>
    <div id="c-${k}-lista"><em style="color:#bbb;font-size:13px">Caricamento...</em></div></div>
  </div>
  <div id="c-${k}-editor-view" style="display:none">
    <div style="margin-bottom:16px"><button class="btn btn-secondary" onclick="collTorna('${k}')">← Torna a ${c.plur.toLowerCase()}</button></div>
    <div class="card"><div class="card-title" id="c-${k}-titolo-ed">Nuovo ${c.nome.toLowerCase()}</div>
      <div class="field"><label>Titolo *</label><input type="text" id="c-${k}-title"></div>
      <div class="grid2">
        <div class="field"><label>${c.ordLabel}</label><input type="number" id="c-${k}-ord" placeholder="1"></div>
        <div class="field"><label>Mostra in home</label><select id="c-${k}-home"><option value="true">Sì</option><option value="false">No</option></select></div>
      </div>
      <div class="field"><label>Descrizione breve <span class="hint" style="display:inline">mostrata nella card in home</span></label><input type="text" id="c-${k}-desc"></div>
      <div class="field"><label>Titolo SEO <span class="hint" style="display:inline">titolo per Google, max 60 caratteri</span></label><input type="text" id="c-${k}-seot"></div>
      <div class="field"><label>Descrizione SEO <span class="hint" style="display:inline">testo sotto il titolo su Google, max 155 caratteri</span></label><input type="text" id="c-${k}-seod"></div>
      <div class="field"><label>Domande frequenti <span class="hint" style="display:inline">una per riga, nel formato: Domanda | Risposta</span></label><textarea class="sm" id="c-${k}-faq" style="min-height:140px"></textarea></div>
      <div class="field"><label>Testo completo</label>
        <div class="editor-toggle"><button class="active" id="c-${k}-bv" onclick="collEd('${k}','v')">Visuale</button><button id="c-${k}-bh" onclick="collEd('${k}','h')">HTML grezzo</button></div>
        <div id="c-${k}-vbox">
          <div class="vis-toolbar">
            <select onchange="collBlk('${k}',this.value);this.value=''"><option value="">Paragrafo</option><option value="h2">Titolo 2</option><option value="h3">Titolo 3</option><option value="p">Testo</option></select>
            <button onclick="collFmt('${k}','bold')" title="Grassetto"><b>B</b></button>
            <button onclick="collFmt('${k}','italic')" title="Corsivo"><i>I</i></button>
            <button onclick="collFmt('${k}','insertUnorderedList')" title="Elenco">&bull;</button>
            <button onclick="collFmt('${k}','insertOrderedList')" title="Elenco numerato">1.</button>
            <button onclick="collLink('${k}')" title="Link">Link</button>
            <button onclick="collFmt('${k}','unlink')" title="Togli link">No link</button>
            <button onclick="collFmt('${k}','removeFormat')" title="Pulisci formato">Pulisci</button>
          </div>
          <div id="c-${k}-vis" contenteditable="true" style="min-height:300px;border:1px solid #c3c4c7;background:#fff;padding:12px 14px;font-size:16px;line-height:1.7;outline:none"></div>
        </div>
        <textarea class="sm" id="c-${k}-corpo" style="min-height:300px;display:none" placeholder="HTML grezzo..."></textarea></div>
      <div class="btn-group"><button class="btn btn-primary" onclick="collSalva('${k}')">💾 Salva ${c.nome.toLowerCase()}</button></div>
      <div class="msg" id="c-${k}-msg"></div>
    </div>
  </div>
</div>`;
}


// ===== EDITOR VISUALE (stessa logica di Articoli/Pagine: contenteditable, si salva HTML; kramdown lo accetta) =====
// GUIDA: il corpo dei file e' HTML (a volte con una riga markdown ![..]({{ '/img' | relative_url }}) in testa).
// Per mostrarlo nell'editor: le immagini markdown diventano <img> con data-liq (originale liquid codificato) e src risolto con BASE;
// al salvataggio il src torna quello liquid originale. Cosi' l'immagine si vede e non si rompe.
const BASE=()=>location.origin+location.pathname.replace(/\/admin\/?.*$/,'');
const _hasHtml=t=>/<(p|h[1-6]|ul|ol|div|table|img)[\s>]/i.test(t);
function _mdPlain(md){ // corpo solo-markdown (senza tag): conversione minima
  return md.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2">$1</a>')
    .split(/\n{2,}/).map(b=>/^<h/.test(b.trim())?b.trim():'<p>'+b.trim().replace(/\n/g,'<br>')+'</p>').join('\n\n');
}
function _toVis(raw){
  let t=raw||'';
  // riga immagine markdown -> <img> visibile (liquid conservato in data-liq)
  t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(m,alt,src)=>{
    const lq=/\{\{/.test(src), vis=lq?src.replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/,(x,p)=>BASE()+p):src;
    return '<img alt="'+alt.replace(/"/g,'&quot;')+'" src="'+vis+'"'+(lq?' data-liq="'+encodeURIComponent(src)+'"':'')+' style="max-width:100%">';
  });
  if(!_hasHtml(t.replace(/<img[^>]*>/g,''))) t=_mdPlain(t);
  return t;
}
function _fromVis(html){
  let t=html.replace(/<img([^>]*?)>/g,(m,a)=>{
    const d=a.match(/data-liq="([^"]*)"/), al=(a.match(/alt="([^"]*)"/)||[])[1]||'', sr=(a.match(/\ssrc="([^"]*)"/)||[])[1]||'';
    const src=d?decodeURIComponent(d[1]):sr;
    return '<img alt="' + al + '" src="' + src + '">'; // HTML (non markdown): resta valido anche dentro un <p>
  });
  t=t.replace(/\scontenteditable="[^"]*"/g,'').replace(/\sstyle="[^"]*"/g,'');
  // righe vuote tra i blocchi: kramdown li tratta come HTML (come per gli articoli)
  const B='p|ul|ol|li|h1|h2|h3|h4|table|blockquote|div|section|figure';
  t=t.replace(new RegExp('(?!^)<('+B+')(\\s[^>]*)?>','g'),'\n\n<$1$2>').replace(new RegExp('</('+B+')>','g'),'</$1>\n\n');
  return t.replace(/\n{3,}/g,'\n\n').trim();
}
const _mode={};
window.collEd=function(k,m){
  _mode[k]=m; $(`c-${k}-bv`).classList.toggle('active',m==='v'); $(`c-${k}-bh`).classList.toggle('active',m==='h');
  if(m==='h'){ $(`c-${k}-corpo`).value=_fromVis($(`c-${k}-vis`).innerHTML); $(`c-${k}-vbox`).style.display='none'; $(`c-${k}-corpo`).style.display='block'; }
  else { $(`c-${k}-vis`).innerHTML=_toVis($(`c-${k}-corpo`).value); $(`c-${k}-corpo`).style.display='none'; $(`c-${k}-vbox`).style.display='block'; }
};
document.addEventListener('paste',e=>{ if(e.target&&e.target.id&&/^c-.*-vis$/.test(e.target.id)){ e.preventDefault(); document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain')); } });
window.collFmt=function(k,c){ $(`c-${k}-vis`).focus(); document.execCommand(c,false,null); };
window.collBlk=function(k,t){ if(!t)return; $(`c-${k}-vis`).focus(); document.execCommand('formatBlock',false,t); };
window.collLink=function(k){ const u=prompt('URL del link:'); if(!u)return; $(`c-${k}-vis`).focus(); document.execCommand('createLink',false,u); };
function getCorpoK(k){ return (_mode[k]==='h')?$(`c-${k}-corpo`).value.trim():_fromVis($(`c-${k}-vis`).innerHTML); }
function setCorpoK(k,raw){ $(`c-${k}-corpo`).value=raw; _mode[k]='h'; collEd(k,'v'); } // apre sempre in modalita' visuale

function init(){
  const main=document.querySelector('main.main'); if(!main)return;
  const shop=[...document.querySelectorAll('.nav-label')].find(e=>e.textContent.trim()==='Impostazioni');
  let nav='<div class="nav-label">Servizi e lavori svolti</div>';
  for(const k in C){
    main.insertAdjacentHTML('beforeend',build(k));
    nav+=`<button class="nav-item" onclick="collShow('${k}',this)"><span class="icon">${C[k].icon}</span>${C[k].plur}</button>`;
  }
  if(shop)shop.insertAdjacentHTML('beforebegin',nav);
}

window.collShow=function(k,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  $('page-'+k).classList.add('active'); btn.classList.add('active');
  collTorna(k);
};
window.collCarica=async function(k){
  const el=$(`c-${k}-lista`), vuoto=`<em style="color:#646970;font-size:13px">Nessun ${C[k].nome.toLowerCase()} ancora.</em>`;
  if(!tok()){el.innerHTML='<em style="color:#646970;font-size:13px">Token mancante.</em>';return;}
  let res; try{res=await ghGet(C[k].dir);}catch(e){el.innerHTML='<em style="color:#646970;font-size:13px">Errore di rete.</em>';return;}
  if(!res.ok){el.innerHTML=vuoto;return;}
  const files=(await res.json()).filter(f=>f.name.endsWith('.md'));
  if(!files.length){el.innerHTML=vuoto;return;}
  el.innerHTML='<em style="color:#646970;font-size:13px">Caricamento...</em>';
  const base=location.origin+location.pathname.replace(/\/admin\/?.*$/,'/');
  const rows=await Promise.all(files.map(async f=>{
    const nome=f.name.replace('.md','');
    try{
      const r=await ghGet(f.path), d=await r.json(), raw=dec(d.content).replace(/\r\n/g,'\n');
      const fm=(raw.match(/^---\n([\s\S]+?)\n---/)||[])[1]||'';
      const g=n=>{const x=fm.match(new RegExp('^'+n+':[ \\t]*"?(.*?)"?[ \\t]*$','m'));return x?x[1].replace(/\\"/g,'"'):'';};
      return {f,nome,title:g('title')||nome,foto:g('foto'),perma:g('permalink'),ord:parseInt(g(C[k].ord))||99,home:g('in_home')!=='false'};
    }catch(e){return {f,nome,title:nome,foto:'',perma:'',ord:99,home:true};}
  }));
  rows.sort((a,b)=>a.ord-b.ord||a.title.localeCompare(b.title));
  const h=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const L=window.FOTOLIB;
  el.innerHTML=`<input type="search" class="wp-search" placeholder="Cerca ${C[k].plur.toLowerCase()}" oninput="collFiltra(this)">
  <table class="wp-list"><thead><tr><th class="wp-th"></th><th>Titolo</th><th>${k==='servizi'?'Ordine':'Importanza'}</th><th>In home</th></tr></thead><tbody>`+
  rows.map(x=>`<tr data-q="${h((x.title+' '+x.nome).toLowerCase())}"><td class="wp-th"><div>${x.foto&&L?`<img loading="lazy" alt="" src="${L.url(x.foto)}">`:''}</div></td>
    <td><a class="wp-t" onclick="collModifica('${k}','${x.f.path}')">${h(x.title)}</a>
    <div class="wp-ra"><a onclick="collModifica('${k}','${x.f.path}')">Modifica</a> | <a class="del" onclick="collElimina('${k}','${x.f.path}','${x.f.sha}')">Elimina</a> | <a href="${x.perma?base.replace(/\/$/,'')+(x.perma.startsWith('/')?'':'/')+x.perma:base+k+'/'+x.nome+'/'}" target="_blank" rel="noopener">Visualizza</a></div></td>
    <td class="wp-n">${x.ord===99?'–':x.ord}</td><td class="wp-n">${x.home?'Sì':'No'}</td></tr>`).join('')+
  `</tbody></table><div class="hint" style="margin-top:8px">${rows.length} ${rows.length===1?C[k].nome.toLowerCase():C[k].plur.toLowerCase()}</div>`;
};
window.collFiltra=function(inp){
  const t=inp.value.toLowerCase().trim();
  inp.parentNode.querySelectorAll('tbody tr').forEach(tr=>{tr.style.display=!t||tr.dataset.q.includes(t)?'':'none';});
};

window.collTorna=function(k){
  $(`c-${k}-editor-view`).style.display='none'; $(`c-${k}-lista-view`).style.display='block'; collCarica(k);
};
function vista(k,titolo){
  $(`c-${k}-titolo-ed`).textContent=titolo;
  $(`c-${k}-lista-view`).style.display='none'; $(`c-${k}-editor-view`).style.display='block';
  showMsg(`c-${k}-msg`,'',''); window.scrollTo({top:0,behavior:'smooth'});
}
window.collNuovo=function(k){
  ['title','ord','desc','seot','seod','faq','corpo'].forEach(f=>$(`c-${k}-${f}`).value=''); $(`c-${k}-home`).value='true'; ['fkw','foto','chips'].forEach(x=>{if($(`c-${k}-${x}`))$(`c-${k}-${x}`).value='';});
  setCorpoK(k,''); st[k].path=null; vista(k,'Nuovo '+C[k].nome.toLowerCase());
};
window.collModifica=async function(k,path){
  const res=await ghGet(path); if(!res.ok)return;
  const raw=dec((await res.json()).content).replace(/\r\n/g,'\n');
  const fm=raw.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/); if(!fm)return;
  const m={}; fm[1].split('\n').forEach(l=>{const x=l.match(/^(\w+):\s*"?(.*?)"?\s*$/); if(x)m[x[1]]=x[2].replace(/\\"/g,'"');});
  $(`c-${k}-title`).value=m.title||''; $(`c-${k}-ord`).value=m[C[k].ord]||'';
  $(`c-${k}-home`).value=m.in_home==='false'?'false':'true';
  $(`c-${k}-desc`).value=m.description||m.excerpt||''; setCorpoK(k,fm[2].trim());
  $(`c-${k}-seot`).value=m.seo_title||''; $(`c-${k}-seod`).value=m.seo_description||''; if($(`c-${k}-fkw`))$(`c-${k}-fkw`).value=m.focus_keyword||''; if($(`c-${k}-foto`))$(`c-${k}-foto`).value=m.foto||''; if($(`c-${k}-chips`)){let ch=[];try{ch=JSON.parse(m.chips||'[]');}catch(x){} $(`c-${k}-chips`).value=ch.join(', ');}
  {const fq=[],re=/^[ \t]+-[ \t]+q:[ \t]*"(.*)"[ \t]*\n[ \t]+a:[ \t]*"(.*)"[ \t]*$/gm;let z;while((z=re.exec(fm[1]))){fq.push(z[1].replace(/\\"/g,'"')+' | '+z[2].replace(/\\"/g,'"'));} $(`c-${k}-faq`).value=fq.join('\n');}
  st[k].path=path; vista(k,'Modifica '+C[k].nome.toLowerCase());
};
window.collSalva=async function(k){
  const c=C[k],msg=`c-${k}-msg`;
  if(!tok())return showMsg(msg,'⚠️ Token mancante.','err');
  const titolo=$(`c-${k}-title`).value.trim(); if(!titolo)return showMsg(msg,'⚠️ Titolo obbligatorio.','err');
  const ord=$(`c-${k}-ord`).value.trim()||'99', home=$(`c-${k}-home`).value, desc=$(`c-${k}-desc`).value.trim(), corpo=getCorpoK(k);
  const seot=$(`c-${k}-seot`).value.trim(), seod=$(`c-${k}-seod`).value.trim(), faqT=$(`c-${k}-faq`).value, fkw=($(`c-${k}-fkw`)?$(`c-${k}-fkw`).value.trim():''), foto=($(`c-${k}-foto`)?$(`c-${k}-foto`).value.trim():''), chips=($(`c-${k}-chips`)?$(`c-${k}-chips`).value.split(',').map(s=>s.trim()).filter(Boolean):[]);
  const path=st[k].path||`${c.dir}/${slug(titolo)}.md`;
  let sha,extra=[];
  if(st[k].path){ // modifica: tengo gli altri campi del frontmatter (date, categories, ecc.)
    const r=await ghGet(path); if(r.ok){const d=await r.json(); sha=d.sha;
      const fm=dec(d.content).replace(/\r\n/g,'\n').match(/^---\n([\s\S]+?)\n---/);
      if(fm){let inFaq=false;extra=fm[1].split('\n').filter(l=>{if(/^faq:/.test(l)){inFaq=true;return false;} if(inFaq&&/^\s/.test(l))return false; inFaq=false; return !/^(title|description|seo_title|seo_description|focus_keyword|foto|chips|ordine|importance|in_home|layout):/.test(l);});}}
  }
  if(!st[k].path&&k==='servizi')extra=['categories:','  - servizi'];
  const faqL=faqT.split('\n').map(s=>s.trim()).filter(s=>s.includes('|')).map(s=>{const i=s.indexOf('|');return `  - q: "${esc(s.slice(0,i).trim())}"\n    a: "${esc(s.slice(i+1).trim())}"`;});
  const md=['---','layout: single',`title: "${esc(titolo)}"`,`description: "${esc(desc)}"`,...(seot?[`seo_title: "${esc(seot)}"`]:[]),...(seod?[`seo_description: "${esc(seod)}"`]:[]),...(fkw?[`focus_keyword: "${esc(fkw)}"`]:[]),...(foto?[`foto: "${esc(foto)}"`]:[]),...(chips.length?[`chips: [${chips.map(x=>`"${esc(x)}"`).join(', ')}]`]:[]),`${c.ord}: ${ord}`,`in_home: ${home}`,...(faqL.length?['faq:',...faqL]:[]),...extra,'---',corpo,''].join('\n');
  showMsg(msg,'⏳ Salvataggio...','');
  const res=await ghPut(path,`${c.nome}: ${titolo}`,md,sha);
  if(res.ok){showMsg(msg,`✅ ${c.nome} salvato!`,'ok');startDeployPolling();st[k].path=path;}
  else{const j=await res.json();showMsg(msg,'❌ '+j.message,'err');}
};
window.collElimina=async function(k,path,sha){
  if(!confirm('Eliminare?')||!tok())return;
  const res=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{method:'DELETE',headers:{'Authorization':`token ${tok()}`,'Content-Type':'application/json'},body:JSON.stringify({message:`Elimina ${path}`,sha})});
  if(res.ok){startDeployPolling();collCarica(k);}
};
init();
})();
