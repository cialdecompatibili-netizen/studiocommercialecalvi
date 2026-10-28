# mistraltemplate1 - guida per Claude (template Jekyll adattivo)

Template Jekyll per GitHub Pages: si clona, si cambia quasi solo `_config.yml` e il sito si adatta (lingua, URL, brand, menu, shop). Obiettivo e stato del lavoro: `PROGETTO_TEMPLATE.md`.

**CREARE UN SITO DA QUESTO TEMPLATE: leggi PRIMA `docs/CLONAZIONE.md` (un comando `nuovo_sito.ps1` + `personalizza_clone.py` fanno colori, logo, sfondo home; un solo commit). Ogni automazione che impari va scritta come script in `automation/` e annotata li' (regola nella sezione 5): obiettivo meno tempo e meno commit per ogni nuovo sito.**

## Prima di toccare un clone (checklist)
1. `_config.yml`: `brand`, `description`, `default_lang`, `languages`, `whatsapp`, `contact_endpoint`, `ecommerce`. NON scrivere `url:`/`baseurl:` (li imposta GitHub Pages).
2. Menu: `_data/navigation.yml` (voci) + `_data/sottomenu.yml` (tendine, chiave = title identico). Url interni SENZA nome repo.
3. Home a blocchi: `_data/blocks_home.json` (campi id, nome, enabled, html). Modificare solo `html`, mai la struttura. Backup prima, rileggere il JSON dopo.
4. Colori/tema: `_data/tema.json`; kit blocchi in `assets/css/gaming.css` (nome storico, non rinominare; accento = `--gc-acc`).
5. Shop: `ecommerce: true` accende tutto. Dati in `_data/catalogo.json` (prezzi in centesimi) + una pagina per prodotto/categoria in `_negozio/` (esempi inclusi: `prodotto-esempio.md`, `categoria-esempio.md`).
6. Contenuti: `_pages/`, `_posts/`. Ogni pagina/articolo ha `ref:` (chiave di collegamento tra lingue).

## Regole d'oro
- ZERO valori fissi: niente nome repo, utente, dominio, telefono scritti nei layout/include/JS. Si usa `relative_url`, `site.*`, `_includes/site-name.html`.
- Admin (`admin/index.html`): `detectRepo()` ricava utente/repo dall'URL. Su dominio personalizzato chiede il repo una volta (localStorage `cms_repo`). Non hardcodarlo.
- `automation/publish.py`: percorso e URL ricavati da soli (cartella del file + remote git).
- Valore vuoto in config = funzione spenta, mai errore: i layout controllano che il campo sia pieno.
- Nessun plugin fuori da GitHub Pages. Build locale non disponibile su questo PC: si controlla online dopo il deploy.
- COMMENTARE i punti critici (layout, include, JS, CSS, config): dire cosa fa, cosa legge, cosa NON toccare.
- HERO HOME ADATTIVO (OBBLIGATORIO, NON MODIFICARE): `.ent-hero` e `.gc-hero` in `assets/css/gaming.css` si adattano allo schermo come ora e restano cosi' in ogni clone e in ogni nuovo template. Comportamento: `min-height:calc(100svh - 80px)` (fallback `100vh`) + `display:flex;align-items:center` = riempie la prima schermata sotto l'header e centra il contenuto; padding `clamp(1.5rem,4vh,3.5rem)`; titolo `.ent-hero .gc-h1{font-size:clamp(2rem,3.2vw + 1.2vh,3.6rem)}` (scala con larghezza E altezza); sfondo `cover`; sotto 900px colonne in pila e velo verticale. Nei cloni si cambiano SOLO foto e colori, mai queste regole: niente altezze fisse in px, niente rimozione di `clamp`/`svh`/`flex`.

## Multilingua (dettagli in `docs/MULTILINGUA.md`)
IT alla radice, altre lingue in `/xx/` create da admin > Lingue. Cambiare solo `default_lang` e `languages`. Traduzioni: `tr: copia|tradotto|da_aggiornare`, `tr_hash`; `automation/traduzioni_sync.py` + workflow marcano `da_aggiornare`. In Liquid niente `a contains b == false`: usare `{% if a contains b %}{% continue %}{% endif %}`.
**Lingue = cartelle (rilevamento automatico).** Clonare/rinominare una cartella `xx/` basta: `_includes/lingue-attive.html` la mette nel selettore (bandiera), `admin/js/lingue.js` (`lgDetect` + `lgNormalizza`, una volta per sessione aprendo admin > Lingue) la registra in `_config.yml` (languages + defaults), `_data/languages.yml`, `ui-text.yml` e corregge `lang`/`locale`/`permalink` dei file e gli url in `_data/i18n/xx/`; `traduzioni_sync.py` la vede da solo. La cartella e' la fonte di verita': il campo `lang:` dei file dopo un clone e' vecchio.
**Admin con lingua di lavoro** (`admin/js/lingua-admin.js`): selettore lingua nella barra in alto; Articoli, Pagine, Home e Menu usano gli STESSI editor ma leggono/scrivono `xx/_posts`, `xx/*.md`, `_data/i18n/xx/*`. Intercetta `window.fetch` e rimappa i path solo se lingua != base e sezione attiva in Articoli/Pagine/Menu; se il file lingua manca parte dalla copia della base (menu con url `/xx/`). Al salvataggio sistema il front matter (lang, locale, permalink, ref, `tr: tradotto` + `tr_hash`). NON riscrivere i path dentro index.html: aggiungere nuovi file da mappare in `mappa()`. `admin/js/core.js` e `articoli.js` NON sono caricati da index.html (legacy): la logica vera e' nello script inline di index.html.

## Eta' e date
MAI a mano: `<span data-eta="AAAA-MM-GG">N</span> anni`, `<span data-anni-da="AAAA">N</span> anni` (script in `_includes/footer/custom.html`).

## Design
MAI bordi laterali colorati su box, citazioni, avvisi, CTA. Box puliti con sfondo leggero o bordo uniforme.

## Pubblicare e lavorare
- Pubblicare con `..\pubblica.ps1` con `-Files` espliciti. Dopo il push NON aspettare la build: Mirco verifica da solo.
- Sessione interrotta: prima `read_file` e `git status --short`; spesso manca solo commit e push.
- PowerShell lungo: salvare in .ps1 e lanciare con `-NoProfile -ExecutionPolicy Bypass -File`. Mai chiamare funzioni RD/WR/CD/LS (alias: RD cancella!).
- Traduzioni: NIENTE GitHub Actions. L'hook `.githooks/pre-commit` lancia `automation/traduzioni_sync.py` a ogni commit (attivo con `git config core.hooksPath .githooks`, una volta per clone).
- Risposte brevissime, modifiche in una sola chiamata.

## Cose che funzionano
- Aggiornare la versione inglese a mano (senza admin): articoli in en/_posts/ (stesso ref, permalink /en/blog/<categoria-EN>/<slug>/, lang: en, locale: en, tr: tradotto), prodotti shop = pagina en/negozio/<id>.md + campo tr.en dentro _data/catalogo.json (nome, descrizione, descrizione_completa). Poi calcolare tr_hash solo dei file nuovi con traduzioni_sync.lg_hash (NON lanciare allinea_hash.py su tutto: segnerebbe come tradotte anche le pagine ancora da aggiornare). Verifica finale: python automation/traduzioni_sync.py deve stampare 0.
- Test senza build locale: simulare la logica JS dell'admin con node + `vm` (stub di `lgText`/`lgCommit` e albero finto) e lanciare `node --check` sul file. Esempio: `claudetemp\test_lingue.js` (clone en -> de rinominato).
- Rilevare le lingue dalle CARTELLE (non dal config) e normalizzare tutto il resto da li': evita config e cartelle fuori sync.
- Liquid senza plugin: costruire un array con `split` + `concat` + `uniq` dentro un include che fa solo `assign` (le variabili restano visibili a chi lo include).- Patch su file grandi con CRLF (admin/index.html): script node con `readFileSync`/`replace`/`writeFileSync` su stringhe esatte, mai edit multiriga a mano; poi `node --check` sui .js. Mock del wrapper fetch: `claudetemp\test_lingua_admin.js`.

SEO e lingue (24/10/2026)
- SEO per lingua: _includes/seo.html fa un solo meta robots (noindex se noindex:true o tr: copia), description per lingua da _data/languages.yml (chiave description; se manca NON la scrive), og:locale. hreflang in _includes/head/custom.html: solo versioni tradotte (stesso ref), x-default = lingua base. sitemap.xml propria (sostituisce jekyll-sitemap) con alternates hreflang, esclude noindex/copia/admin/404.
- Slug tradotti: lo slug e' il permalink del front matter; MAI scrivere a mano lo slug di un'altra lingua nei link: usare {% include url-ref.html ref="shop-negozio" %} (URL per ref nella lingua della pagina). Inglese: /en/shop/, /en/about-us/, /en/contact/, /en/category/, /en/shop/example-product/. carrello/ordine/grazie restano con slug italiano (noindex, e carrello.js controlla /grazie/). Una lingua clonata da admin parte con gli slug della base: tradurli cambiando permalink (e i link in menu/home).
- Lingua browser: script in head/custom.html. Solo prima visita, solo da pagine in lingua base, solo se esiste la versione tradotta; localStorage lang_pref = scelta ricordata (il click su bandiera/selettore la aggiorna); niente redirect per bot, ?nolang=1 o referrer dello stesso sito.


Elementi per pagina (24/10/2026)
- UN solo valore per tutte le liste: `per_page` in _config.yml (default 20), si cambia da admin > Impostazioni (10, 20, 50, 100, 200, 500). L'admin lo copia in localStorage 'cms_per_page' (getPerPage in admin/index.html); NON reintrodurre limiti separati per elenco.
- Admin: elenchi Articoli, Pagine e Prodotti usano getPerPage(); le miniature/metadati si leggono a gruppi di 6 (metaQueue in wp-elenchi.js) per non finire il limite API con 200-500 voci.
- Sito: assets/js/paginazione.js impagina blog, negozio e pagina categoria (it e en) con gli attributi data-pg, data-pg-item, data-per sul contenitore; le voci restano tutte nell'HTML. Filtri che usano hidden (pillole negozio) chiamano PgLista.refresh. Se aggiungi un nuovo elenco lungo: stessi tre attributi, niente codice nuovo.


Lezioni dal clone "cybersecurity" (24/10/2026)
- Home, Chi siamo e Servizi sono a blocchi con testi SEGNAPOSTO neutri (IT in `_data/`, EN in `_data/i18n/en/`). Stile `ent-*` in `assets/css/gaming.css`; i colori seguono `_data/tema.json` (accent = `--gc-acc`, accent_dark = `--gc-ink`): NON mettere `<style>` con colori nei blocchi.
- I JSON dei blocchi si generano con uno script node (JSON.stringify + rilettura con JSON.parse), mai a mano; apostrofi e accenti nei blocchi come entita' HTML (&#39; &egrave;).
- Dopo aver scritto/tradotto a mano le pagine di una lingua: `python automation/allinea_hash.py en` (imposta `tr: tradotto` e `tr_hash`). Senza, l'hook le marca `da_aggiornare`.
- Ogni pagina/articolo ha `ref:` anche in italiano (serve al collegamento tra lingue e al selettore).
- Dati, cifre e fonti nei testi: solo verificati sul web (cerca prima). Mai loghi clienti, recensioni, certificazioni o prezzi inventati.
- Il modulo contatti resta spento finche' `contact_endpoint` e' vuoto: chiederlo subito al cliente. Lo stesso per `whatsapp` ed `email`.
- Clone: `..\nuovo_sito.ps1` tiene `en/` di default (it,en). Con `-Lingue it` la cartella `en/` viene tolta: farlo solo se richiesto. `-Accento "#rrggbb"` imposta il colore.
- Pubblicare piu' file: `& ..\pubblica.ps1 -Repo x -Msg "..." -Files 'a','b'` (ora accetta anche `-Files a,b` da `-File`).


Lezioni dalla migrazione "pelletteria" -> "pelletteria2" (24/10/2026)
- Migrare un sito esistente in un clone: 1) mappare le due repo (menu, `_data/catalogo.json`, `_negozio/`, `blocks_home.json`, `_posts/`); 2) generare TUTTO con script node (accenti come `\uXXXX`, nei blocchi HTML entita' numeriche con una funzione `ent()`; JSON con `JSON.stringify` e rilettura); 3) `python automation/allinea_hash.py en`; 4) pubblicare con `..\pubblica.ps1 -Files ...`. Script di esempio: `claudetemp\build_pelletteria2\` (`dati.js` = categorie IT/EN, `build.js` = dati/menu, `build2.js` = blocchi/pagine/patch).
- Categorie a DUE LIVELLI: campo `genitore` in `catalogo.json` (il reparto non ha genitore; la sua pagina mostra le sottocategorie e i prodotti di tutte). Nome inglese in `tr.en.nome`. Ogni categoria ha DUE file con `ref: shop-cat-<id>`: `_negozio/categoria-<id>.md` (permalink `/negozio/categoria/<id>/`) e `en/negozio/categoria/<id>.md` (permalink `/en/shop/category/<slug-inglese>/`).
- Link dello shop: MAI `nz_lh | append: 'negozio/'` (in inglese puntava a `/en/negozio/`, che non esiste). Usare `{% include shop-url.html k="shop" %}`, `k="cat" id=...`, `k="prod" id=...`: cerca il `ref` (`shop-negozio`, `shop-cat-<id>`, `shop-prod-<id>`) nella lingua della pagina, poi nella base, poi la vecchia formula. Prodotti/categorie creati da admin senza `ref` in inglese ricadono sulla formula: aggiungere il `ref` a mano ai file.
- Il clone con `nuovo_sito.ps1 -File` storpia le virgole (`default_lang: it,en`) e CANCELLA `en/` e `_data/i18n/en`: dopo il clone controllare `default_lang` e che `en/` esista, altrimenti ripristinare dal template.
- Non portare nei blocchi i `<style>` del vecchio sito: si usano le classi `gc-*`/`ent-*` e `_data/tema.json` (copiare il tema.json del vecchio sito per mantenere i colori).
- Togliere i segnaposto che non servono (`_pages/servizi.md`, articolo di esempio, categoria/prodotto di esempio): restano online e indicizzati.
- Il modulo contatti resta spento senza `contact_endpoint` (il vecchio sito usava il worker del modello: non riusarlo, serve il worker del cliente).
- Questo template ha molti file non committati: le modifiche shop (shop-url.html, negozio-categoria, patch ai link) sono nel working tree ma NON committate; non usare `pubblica.ps1 -Tutto` qui.

## Lezioni dal clone pelletteria2 (24/10/2026)
- FOOTER: _includes/footer/custom.html mette di default © anno nome-sito - Design, Development & Digital Marketing by webtomars.it; site.footer_text nel _config.yml lo sovrascrive. Nei cloni non serve rifarlo.
- TEMA/COLORI: mai hex hardcoded (niente azzurri/teal/ghiaccio in menu.css, gaming.css, head/custom.html, layout): usare _data/tema.json (accent, accent_dark). Dopo il clone: cercare con grep i vecchi colori e sostituirli con la palette del nuovo sito.
- HOME: sfondo hero = assets/images/*-hero.jpg referenziato in gaming.css (.ent-hero). Nei cloni sostituirlo con una texture a tema (esempio: automation/genera_texture.py di pelletteria2, Pillow+numpy) e cambiare logo con automation/genera_logo.py.
- ORDINE CLONE: 1) tema.json 2) logo+texture 3) menu/categorie IT+EN 4) home/chi siamo 5) footer e segnaposto 6) commit+push+verifica online.

## Articoli e categorie del blog (logica da cybersecurity)
- Indirizzi: articolo = /blog/<categoria>/<titolo>/ (EN: /en/blog/...), categoria = /blog/<categoria>/, categoria `blog` = /blog/<titolo>/.
- Dopo ogni nuovo articolo o nuova categoria lancia `python automation/permalink_articoli.py --apply`: scrive il permalink nel front matter, crea i redirect dai vecchi indirizzi e le pagine categoria mancanti (_pages/cat-*.md, en/category-*.md). Idempotente.
- Nomi EN delle categorie: _data/i18n/en/categorie.json (stesso ordine di _data/categorie.json).
- Liste: _includes/lista-categoria.html (blog e categorie), link categoria: _includes/page__taxonomy.html, barra laterale: post-sidebar.html.
- Gli articoli `2026-10-26-*-prova` / `*-test` sono di prova: cancellali (e i loro redirect/ e le categorie Guide/Novità se non servono).
- Card servizi in home: si stilizzano solo con CSS in fondo a assets/css/gaming.css (selettori '.gc .ent-pl', griglia '.gc .gc-plat.ent-4' con !important); i blocchi html di _data/blocks_home.json non si toccano. Numeri 01-12 nascosti, intera card cliccabile con link stirato (b a::after).
- DA NON FARE (stile): mai barrette/bordini colorati su un lato di box, card o citazioni (border-left e simili, o barre che compaiono all'hover): sembrano artificiali. Per distinguere un box usare sfondo, contrasto e spazio.
- Contatti: NIENTE box WhatsApp nel testo. Il contatto sta nella barra DESTRA di articoli e servizi = author_profile del tema (come edilextreme4): config in _config.yml sezione `author` (nome, avatar tondo, bio, links; WhatsApp e` il primo link, url "#" finche non c'e` il numero), stile in fondo a assets/css/main.scss, bottone Cerca aggiunto da JS in _includes/head/custom.html. Non ricreare post-sidebar/box.


Guide e banner contatto (27/10/2026)
- Nuova categoria blog: aggiungere la voce in `_data/categorie.json` e, nella stessa posizione, in `_data/i18n/en/categorie.json`, poi `python automation/permalink_articoli.py --apply` (crea `_pages/cat-<slug>.md` e `en/category-*.md`). Con edit_block usare un'ancora su UNA riga (i file sono CRLF) e inserire la nuova voce prima di quella ancorata.
- Banner contatto negli articoli: `<div class="art-cta"><strong class="t">Titolo</strong><p>Testo</p><a class="btn-cta" href="{% include url-ref.html ref="contatti" %}">Contattaci</a></div>`; versione compatta a meta' articolo: `art-cta art-cta-min` con solo `<p>` e link. Stile in fondo a `assets/css/gaming.css` (box con sfondo tinta accento, niente barre laterali).
- Link allo shop dentro un articolo: `{% include shop-url.html k="prod" id="<id prodotto>" %}`.
- Guide fiscali: cifre solo verificate sul web; dove le fonti discordano (es. soglia reddito da lavoro dipendente nel forfettario, 30.000 o 35.000) non scrivere il numero.


Regola shop FREEMIUM (27/10/2026, obbligatoria per ogni prodotto)
- Ogni prodotto ha una versione FREE (con marchio dello studio, limiti reali ma davvero utile) e una PRO a pochi euro (senza marchio, senza limiti, funzioni in piu', aggiornamento annuale). Mai un prodotto solo a pagamento senza versione free.
- Leve psicologiche da applicare (esperti: Cialdini, Kahneman, Ariely, Yu-kai Chou, ricerche ECIS 2020): reciprocita' (il free da' valore subito); effetto possesso (l'utente inserisce i suoi dati nel free e Pro li mantiene); avversione alla perdita (invito a Pro solo quando si raggiunge un limite reale); paywall DOPO il risultato (l'invito a Pro compare dopo che l'utente ha ottenuto il suo risultato, non prima); distanza di valore (free ridotto + Pro ricco = piu' conversioni); ancoraggio e pacchetto con risparmio reale; opzione esca alla Ariely solo se esiste davvero come prodotto.
- Conversione tipica freemium 3-5% (fonte secondaria): servono volumi, il dato vero lo da' lo smoke test.
- Vietato: countdown o scarsita' finti, recensioni inventate, limiti artificiali che rendono inutile il free.


## Banner contatto automatico (27/10/2026) - LEGGERE PRIMA DI TOCCARE ARTICOLI E SERVIZI
- Cos'e': piccolo banner "Consulenza gratuita" (testo + bottone WhatsApp + bottone "Compila il modulo") che compare DA SOLO a meta' del testo di OGNI articolo (`_posts`) e OGNI pagina servizio (`_servizi`), in tutte le lingue. Non va copiato a mano negli articoli.
- UN SOLO PUNTO per modificarlo: testi in `_data/banner_contatto.yml` (per lingua; senza voce usa l'italiano). Markup in `_includes/banner-contatto.html`. Posizione (meta' testo) in `_includes/contenuto-con-banner.html`, chiamato da `_layouts/single.html` al posto di `{{ content }}`. Stile in fondo a `assets/css/gaming.css` (blocco "BANNER CONTATTO AUTOMATICO", classi `.cb`).
- Dove lo mette: prima dell'H2 di meta' (servono almeno 3 H2), altrimenti dopo il paragrafo di meta' (almeno 4 paragrafi), altrimenti niente. Per spegnerlo in una pagina: front matter `banner_contatto: false`.
- WhatsApp: legge `whatsapp` in `_config.yml`. Vuoto = bottone con `#` (inerte). Quando c'e' il numero (es. 393331234567) scriverlo li' e il bottone si attiva ovunque da solo (e `whatsapp_demo` va rimesso `false` come da commento in _config.yml).
- NON usare piu' `art-cta art-cta-min` a meta' articolo (era il vecchio banner manuale: ora sarebbe doppio). Resta valido il banner grande `art-cta` in fondo agli articoli.
- La card "Consulenza gratuita" dell'hero in home e' separata: sta nel blocco hero di `_data/blocks_home.json` (html statico, classe `.gc-hero-card`, stile in gaming.css). Se cambiano i testi del banner, allinearla a mano.
- Tag per tornare indietro: `prima-banner-auto`.

## Logo (scudetto con C)
- Font della C: **Pinyon Script** (corsivo calligrafico, file automation/fonts/PinyonScript-Regular.ttf; alternativa Great Vibes, GreatVibes-Regular.ttf, stessa cartella). La C e' bianca su scudo blu/oro a tutta area.
- Rigenerare con `python automation/genera_stemma.py` (opzionale: nome del font .ttf).
