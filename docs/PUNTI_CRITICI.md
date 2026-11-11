# PUNTI_CRITICI - visione d'insieme (cosa tiene in piedi il sito e dove NON toccare alla cieca)

Complementare a `ERRORI_NOTI.md` (errori gia' fatti) e `MAPPA.md` (dove sta cosa). Qui: i punti dove una modifica piccola puo' rompere molto.

## 1. Non si puo' provare in locale
Nessuna build Jekyll su questo PC: l'unico test vero e' online dopo il deploy (1-2 min). Quindi ogni modifica a Liquid va controllata sul sito pubblicato, guardando l'HTML reale
(es. `Invoke-WebRequest <url>` e cercare la classe) e non solo la pagina. Caso reale: `remove_last` in `masthead.html` non toglieva la parola e il nome usciva doppio -> si usa `slice`.
Per il JS: `node --check file.js` prima del commit.

## 2. Header unico (`_includes/masthead.html`)
E' un solo include riusato IDENTICO su tutte le pagine: dentro non va nulla che cambi da pagina a pagina (`page.url` darebbe valori sbagliati, vedi commento in testa al file).
Il nome in alto = `masthead_title` (`_config.yml`), se vuoto = nome del repo (`site-name.html`). Ultima parola = grassetto (`.nv__n2`), il resto leggero (`.nv__n1`). Stile in `menu.css`, blocco `NOME IN ALTO`.

## 3. Hero della Home (`gaming.css`)
Altezza = `100vh` meno circa 80px di menu (ERRORI_NOTI n.21) e regola d'oro "HERO ADATTIVO, NON MODIFICARE" (`CLAUDE.md`). Se cambia l'altezza del menu (logo, font, riga) va ricontrollato l'hero.
I bottoni WhatsApp (`.gc-btn-wa` nell'hero, `.cb-wa` nel banner) hanno in fondo a `gaming.css` il blocco `WHATSAPP GLITTER`: usa `position:relative; overflow:hidden` solo sul bottone, e' decorativo e si toglie cancellando il blocco.

## 3b. Colori
Regola: solo variabili `--t-*` da `_data/tema.json` (ERRORI_NOTI n.20). Eccezioni attuali, da conoscere: verde WhatsApp `#25d366` (marchio, gia' presente) e i punti luce del glitter (`#fff`, `#fff6a8`).

## 4. Admin: editor visuale delle sezioni (`admin/js/blocchi-visuali.js`)
- Si carica PER ULTIMO da `admin/index.html` e ridefinisce `renderPagBlocchi` / `aggiungiPagBlocco`; il salvataggio resta `salvaPagina()` dello script inline (che e' la logica vera, non `core.js`/`articoli.js`: legacy).
- L'editor e' un iframe con i CSS del sito: `main.css` esiste SOLO dopo la build (in repo c'e' `main.scss`). L'altezza si misura su `body.offsetHeight` con tetto `MAXH`: misurare `documentElement.scrollHeight` faceva crescere il box all'infinito (elementi in `vh`).
- `__BASEURL__` nelle foto viene sostituito per la visualizzazione e rimesso al salvataggio (`prep/unprep`); il `<video>` di sfondo e' un segnaposto rimesso identico. Sezioni con Liquid (`{%` / `{{`) = solo HTML.
- Home a blocchi: si modifica solo il campo `html` di `_data/blocks_home.json`. `home.css` e' PURGATO: classi Tailwind nuove non esistono finche' non si rigenera.
- Cache: ogni modifica a un JS dell'admin richiede di cambiare `?v=` nella riga `<script>` di `admin/index.html`, altrimenti il browser usa la vecchia versione.

## 5. File e git
- Per modificare `admin/index.html` (147 KB) NON usare `Get-Content | Set-Content`: riscrive i fine riga/BOM e il commit mostra 600 righe cambiate. Usare edit mirato (diff di 1 riga).
- Il push puo' essere rifiutato perche' l'admin committa da solo (es. "Aggiorna blocchi: Home"): fare `git pull --rebase` e riprovare, poi `git show --stat HEAD`.
- Esperimenti: prima un tag git di backup (es. `prima-energia-wa`), codice in blocchi marcati INIZIO/FINE o in un file a parte, cosi' si rimuovono in un colpo.

## 6. WhatsApp e contatti
`whatsapp` vuoto + `whatsapp_demo: true` = bottoni visibili ma con link `#` (inerti). Quando c'e' il numero: scriverlo (es. `393331234567`) e mettere `whatsapp_demo: false`. Con `whatsapp_demo: false` e numero vuoto i bottoni spariscono.

## 7. Cose da NON inventare
Dati dello studio (numeri, anni, certificazioni, nome vero): se non ci sono, segnaposto. Nome e `email` in `_config.yml` vanno confermati da Mirco prima della consegna al cliente
(oggi: "Studio Commerciale Calvi", `info@studiocommercialista.it`; la Home dice "oltre 10 anni" nell'hero e "oltre 15 anni" nel resto: incoerenza da sistemare).
