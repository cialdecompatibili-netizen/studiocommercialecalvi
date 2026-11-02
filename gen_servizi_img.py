import os, re, hashlib, colorsys
from PIL import Image, ImageDraw, ImageFilter
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "images", "blog")
W, H = Image.open(os.path.join(D, os.listdir(D)[0])).size if False else (1200, 675)
PAL = {"startup":(0x6C,0x3F,0xD8),"ecom":(0xF0,0x7A,0x1A),"fisc":(0x0F,0x7B,0x6C),"piva":(0x1F,0x6F,0xD6),"fatt":(0x0E,0x9F,0xB5),"cont":(0x2E,0x7D,0x32),"dich":(0xC2,0x3B,0x5A),"dig":(0x34,0x4A,0xB8),"soc":(0x8A,0x5A,0x2B),"intl":(0x00,0x6D,0xA8),"inps":(0xD0,0x8A,0x00),"lav":(0x7A,0x2E,0x8A)}
RULES = [("transfer|cross|import|export|ice|internaz|contrattualistica|pianificazione-fiscale-cross","globe"),("oss|marketplace|amazon|dropship|multicanale|triangol","cart"),("crypto|nft","coin"),("influencer","people"),("ai-|-ai|automat|riconcil|app-mobile|portale|reportistica|gestionali|integrazione","gear"),("pec|spid|sdi|conservazione|fattur|fatture","doc"),("iva|ateco|forfett|regime|irpef|irap|770|modello|redditi|cu-|imu|tari|ravvedimento|interpelli|dichiaraz","calc"),("bilanc|contabil|registri|cespiti|lipe|scritture|riconc","chart"),("assunz|licenz|tfr|ferie|buste|infortuni|sindacal|dipendent|lavoro","people"),("inps|inail|durc|contribut|gestione-prof|commercianti","shield"),("startup|stock|pitch|bandi|credito|investitor|business-plan|ricerca","rocket"),("societ|patti|fusion|liquidaz|holding|operazioni|trasformaz|costituz","build"),("crediti|deduzion|agevol|pianificazione|iper","coin"),("registro|scia|cessazione|apertura|passaggio","doc")]
CAT = {}
def cat(slug, c): CAT[slug] = c

CATS = {
"ecom":"triangolazioni-vendite-cross-border-ecommerce oss-marketplace-dropshipping-fiscalita influencer-creator-digitali-tassazione fatturazione-automatizzata-multicanale crypto-nft-dichiarazione-tassazione amazon-fba-shopify-dropshipping-fiscalita regime-oss-iva-ecommerce",
"soc":"trasformazioni-fusioni-scissioni transfer-pricing-prezzi-infragruppo patti-parasociali-governance operazioni-straordinarie-ma liquidazioni-volontarie-giudiziali costituzione-societa-srl-srls-snc-sas-spa",
"intl":"transfer-pricing-documentazione pianificazione-fiscale-cross-border contrattualistica-internazionale assistenza-ice-contributi-30 supporto-esportazione-importazione",
"fisc":"switch-regime-forfettario-semplificato-ordinario interpelli-ruling-fiscali holding-patrimoni-familiari-pianificazione deduzioni-agevolazioni-fiscali-personalizzate crediti-transizione-5-0-iper-ammortamento crediti-industria-4-0-digitalizzazione pianificazione-fiscale-ottimizzazione-carico",
"startup":"stock-option-piani-incentivazione iscrizione-sezione-speciale-registro-imprese-startup credito-imposta-ricerca-sviluppo-45 business-plan-pitch-deck-investitori bandi-smart-start-italia agevolazioni-investitori-startup-detrazione costituzione-startup-innovative-srl-srls",
"fatt":"sistema-interscambio-sdi-come-funziona integrazione-gestionali-ecommerce-pos fatture-differite-acquisti-intra-ue conservazione-sostitutiva-norma-10-anni automazione-workflow-fatturazione fatturazione-b2b-b2c-pa",
"cont":"scritture-contabili-automatizzate-ai riconciliazioni-bancarie-automatiche registri-iva-corrispettivi-cespiti lipe-esterometro-intra-extra-ue bilanci-cee-ordinari-abbreviati contabilita-ordinaria-semplificata-forfettaria",
"dig":"reportistica-tempo-reale-kpi-cassa portale-cliente-pec-spid-deleghe-telematiche integrazione-ai-analisi-predittive app-mobile-gestione-spese-ricevute portale-cliente-upload-documenti-dashboard",
"piva":"scelta-codice-ateco-regime-fiscale regime-forfettario-verifica-requisiti passaggio-da-dipendente-a-partita-iva iscrizione-registro-imprese-scia cessazione-sospensione-attivita apertura-partita-iva-aa9-12-comunica",
"dich":"ravvedimento-operoso-rateizzazioni iva-annuale-trimestrale-dichiarazione irap-modello-770 imu-tari-tributi-locali cu-certificazione-unica modello-redditi-pf-sc-sp-enc",
"inps":"iscrizione-inps-durc-guida-pratica gestione-professionisti-separata-inps gestione-infortuni-malattia-dipendenti contributi-minimi-massimali-inps-2026 iscrizione-gestione-commercianti-artigiani",
"lav":"ferie-permessi-tfr-gestione assunzioni-licenziamenti-tfr-guida-datore-lavoro assunzioni-contratti-onboarding assistenza-contenziosi-sindacali elaborazione-buste-paga-cedolini"}
ICON = {"triangolazioni":"globe","oss-marketplace":"cart","influencer":"people","multicanale":"cart","crypto":"coin","amazon":"cart","regime-oss":"cart","trasformazioni":"build","transfer-pricing":"scale","patti":"scale","operazioni":"build","liquidazioni":"scale","costituzione-societa":"build","documentazione":"doc","cross-border":"globe","contrattualistica":"scale","ice":"globe","esportazione":"globe","switch":"calc","interpelli":"scale","holding":"build","deduzioni":"coin","transizione":"gear","industria":"gear","ottimizzazione":"chart","stock":"chart","iscrizione-sezione":"doc","credito-imposta":"coin","business-plan":"rocket","bandi":"rocket","agevolazioni":"coin","costituzione-startup":"rocket","sistema":"gear","gestionali":"gear","differite":"doc","conservazione":"shield","automazione":"gear","b2b":"doc","scritture":"gear","riconciliazioni":"chart","registri":"doc","lipe":"globe","bilanci":"chart","contabilita":"calc","reportistica":"chart","portale-cliente-pec":"shield","ai":"gear","app":"gear","portale-cliente-up":"doc","scelta":"calc","regime-forf":"calc","passaggio":"people","iscrizione-registro":"doc","cessazione":"calendar","apertura":"doc","ravvedimento":"calendar","iva":"calc","irap":"calc","imu":"build","cu":"doc","modello":"doc","iscrizione-inps":"shield","gestione-prof":"shield","gestione-inf":"shield","contributi":"coin","iscrizione-gestione":"shield","ferie":"calendar","assunzioni-lic":"people","assunzioni-con":"doc","assistenza":"scale","elaborazione":"doc"}
def icon_for(slug, c):
    for k in sorted(ICON, key=len, reverse=True):
        if slug.startswith(k): return ICON[k]
    return "doc"

def shade(c, f): return tuple(max(0,min(255,int(v*f))) for v in c)
def h(s, n):
    x = hashlib.md5(s.encode()).hexdigest() * 3
    return int(x[(n % 28) * 4:(n % 28) * 4 + 4], 16)
def draw_icon(d, kind, cx, cy, u, col):
    wh=(255,255,255); dk=shade(col,.55)
    if kind=="doc":
        d.rounded_rectangle([cx-.8*u,cy-1.05*u,cx+.8*u,cy+1.05*u],.12*u,fill=wh)
        for i in range(5): d.rounded_rectangle([cx-.52*u,cy-.7*u+i*.33*u,cx+(.52 if i%2==0 else .25)*u,cy-.6*u+i*.33*u],.04*u,fill=col)
        d.ellipse([cx+.3*u,cy+.55*u,cx+.95*u,cy+1.2*u],fill=dk); d.line([cx+.45*u,cy+.88*u,cx+.58*u,cy+1.0*u,cx+.8*u,cy+.75*u],fill=wh,width=int(.08*u))
    elif kind=="calc":
        d.rounded_rectangle([cx-.8*u,cy-1.05*u,cx+.8*u,cy+1.05*u],.14*u,fill=wh)
        d.rounded_rectangle([cx-.6*u,cy-.85*u,cx+.6*u,cy-.4*u],.06*u,fill=col)
        for r in range(3):
            for k in range(3): d.rounded_rectangle([cx-.6*u+k*.43*u,cy-.2*u+r*.42*u,cx-.28*u+k*.43*u,cy+.1*u+r*.42*u],.05*u,fill=dk if (r,k)==(2,2) else col)
    elif kind=="chart":
        d.rounded_rectangle([cx-1.15*u,cy-1*u,cx+1.15*u,cy+1*u],.14*u,fill=wh)
        for i,v in enumerate([.5,.9,.7,1.3]): d.rounded_rectangle([cx-.85*u+i*.45*u,cy+.75*u-v*u,cx-.5*u+i*.45*u,cy+.75*u],.05*u,fill=col if i%2==0 else dk)
        d.line([cx-.9*u,cy-.2*u,cx-.3*u,cy-.55*u,cx+.2*u,cy-.3*u,cx+.9*u,cy-.8*u],fill=dk,width=int(.07*u))
    elif kind=="globe":
        d.ellipse([cx-1.05*u,cy-1.05*u,cx+1.05*u,cy+1.05*u],fill=wh)
        for e in (.95,.5): d.ellipse([cx-e*u,cy-1.0*u,cx+e*u,cy+1.0*u],outline=col,width=int(.06*u))
        d.line([cx-1*u,cy,cx+1*u,cy],fill=col,width=int(.06*u)); d.line([cx-.85*u,cy-.5*u,cx+.85*u,cy-.5*u],fill=col,width=int(.05*u)); d.line([cx-.85*u,cy+.5*u,cx+.85*u,cy+.5*u],fill=col,width=int(.05*u))
    elif kind=="cart":
        d.line([cx-1.2*u,cy-.9*u,cx-.8*u,cy-.9*u,cx-.4*u,cy+.5*u,cx+.9*u,cy+.5*u],fill=wh,width=int(.14*u),joint="curve")
        d.polygon([cx-.7*u,cy-.55*u,cx+1.2*u,cy-.55*u,cx+.9*u,cy+.3*u,cx-.45*u,cy+.3*u],fill=wh)
        for x in (-.2,.7): d.ellipse([cx+x*u-.18*u,cy+.75*u,cx+x*u+.18*u,cy+1.1*u],fill=wh)
        d.rounded_rectangle([cx-.35*u,cy-.3*u,cx+.8*u,cy-.15*u],.05*u,fill=col)
    elif kind=="coin":
        for i,dy in enumerate((.55,.1,-.35)):
            d.ellipse([cx-.9*u,cy+dy*u-.3*u,cx+.9*u,cy+dy*u+.45*u],fill=wh if i%2==0 else (235,235,235),outline=dk,width=int(.04*u))
        d.text((cx-.18*u,cy-.9*u),"€",fill=wh,font=None)
        d.ellipse([cx-.5*u,cy-1.15*u,cx+.5*u,cy-.2*u],fill=wh); d.arc([cx-.28*u,cy-1.0*u,cx+.28*u,cy-.35*u],60,300,fill=col,width=int(.09*u)); d.line([cx-.3*u,cy-.78*u,cx+.05*u,cy-.78*u],fill=col,width=int(.07*u)); d.line([cx-.3*u,cy-.58*u,cx+.05*u,cy-.58*u],fill=col,width=int(.07*u))
    elif kind=="people":
        for x,r,y in ((-.7,.38,-.45),(.7,.38,-.45),(0,.5,-.65)):
            d.ellipse([cx+x*u-r*u,cy+y*u-r*u,cx+x*u+r*u,cy+y*u+r*u],fill=wh)
        d.pieslice([cx-1.25*u,cy-.1*u,cx-.15*u,cy+1.2*u],180,360,fill=wh); d.pieslice([cx+.15*u,cy-.1*u,cx+1.25*u,cy+1.2*u],180,360,fill=wh); d.pieslice([cx-.8*u,cy-.05*u,cx+.8*u,cy+1.5*u],180,360,fill=wh,outline=col,width=int(.05*u))
    elif kind=="rocket":
        d.polygon([(cx,cy-1.3*u),(cx+.5*u,cy-.3*u),(cx+.5*u,cy+.6*u),(cx-.5*u,cy+.6*u),(cx-.5*u,cy-.3*u)],fill=wh)
        d.ellipse([cx-.22*u,cy-.5*u,cx+.22*u,cy-.06*u],fill=col)
        d.polygon([(cx-.5*u,cy+.1*u),(cx-1*u,cy+.9*u),(cx-.5*u,cy+.6*u)],fill=dk); d.polygon([(cx+.5*u,cy+.1*u),(cx+1*u,cy+.9*u),(cx+.5*u,cy+.6*u)],fill=dk)
        d.polygon([(cx-.25*u,cy+.62*u),(cx+.25*u,cy+.62*u),(cx,cy+1.4*u)],fill=(255,214,102))
    elif kind=="shield":
        d.polygon([(cx,cy-1.2*u),(cx+.95*u,cy-.8*u),(cx+.9*u,cy+.3*u),(cx,cy+1.25*u),(cx-.9*u,cy+.3*u),(cx-.95*u,cy-.8*u)],fill=wh)
        d.line([cx-.4*u,cy,cx-.1*u,cy+.35*u,cx+.45*u,cy-.4*u],fill=col,width=int(.17*u),joint="curve")
    elif kind=="build":
        d.rounded_rectangle([cx-.8*u,cy-1.15*u,cx+.2*u,cy+1.1*u],.05*u,fill=wh); d.rounded_rectangle([cx+.2*u,cy-.4*u,cx+1.0*u,cy+1.1*u],.05*u,fill=(235,235,235))
        for r in range(4):
            for k in range(2): d.rectangle([cx-.6*u+k*.45*u,cy-.95*u+r*.5*u,cx-.4*u+k*.45*u,cy-.7*u+r*.5*u],fill=col)
        for r in range(2): d.rectangle([cx+.45*u,cy-.2*u+r*.5*u,cx+.75*u,cy+.1*u+r*.5*u],fill=col)
    elif kind=="scale":
        d.line([cx,cy-1.1*u,cx,cy+1.0*u],fill=wh,width=int(.12*u)); d.rounded_rectangle([cx-.5*u,cy+.9*u,cx+.5*u,cy+1.1*u],.05*u,fill=wh); d.line([cx-1.1*u,cy-.7*u,cx+1.1*u,cy-.7*u],fill=wh,width=int(.1*u))
        for s in (-1,1):
            d.line([cx+s*1.1*u,cy-.7*u,cx+s*.85*u,cy+.1*u],fill=wh,width=int(.05*u)); d.line([cx+s*1.1*u,cy-.7*u,cx+s*1.35*u,cy+.1*u],fill=wh,width=int(.05*u))
            d.pieslice([cx+s*1.1*u-.5*u,cy-.25*u,cx+s*1.1*u+.5*u,cy+.55*u],0,180,fill=wh)
    elif kind=="calendar":
        d.rounded_rectangle([cx-1*u,cy-.95*u,cx+1*u,cy+1.05*u],.14*u,fill=wh); d.rounded_rectangle([cx-1*u,cy-.95*u,cx+1*u,cy-.45*u],.14*u,fill=dk)
        for x in (-.5,.5): d.rounded_rectangle([cx+x*u-.07*u,cy-1.15*u,cx+x*u+.07*u,cy-.7*u],.04*u,fill=wh)
        for r in range(3):
            for k in range(4): d.rounded_rectangle([cx-.78*u+k*.42*u,cy-.25*u+r*.42*u,cx-.55*u+k*.42*u,cy-.02*u+r*.42*u],.04*u,fill=dk if (r,k)==(1,2) else col)
    else:  # gear
        import math
        for i in range(8):
            a=i*math.pi/4; d.polygon([(cx+math.cos(a-.2)*.8*u,cy+math.sin(a-.2)*.8*u),(cx+math.cos(a-.15)*1.15*u,cy+math.sin(a-.15)*1.15*u),(cx+math.cos(a+.15)*1.15*u,cy+math.sin(a+.15)*1.15*u),(cx+math.cos(a+.2)*.8*u,cy+math.sin(a+.2)*.8*u)],fill=wh)
        d.ellipse([cx-.85*u,cy-.85*u,cx+.85*u,cy+.85*u],fill=wh); d.ellipse([cx-.4*u,cy-.4*u,cx+.4*u,cy+.4*u],fill=col)
def make(slug, c):
    S=2; w,h_=800*S,533*S; base=PAL[c]; hh=h(slug,0)
    f=(hh%40-20)/100
    col=shade(base,1+f*.6); col2=shade(base,.6+(h(slug,1)%30)/100)
    img=Image.new("RGB",(w,h_),col); px=Image.new("RGB",(w,h_)); d=ImageDraw.Draw(img)
    for y in range(h_):
        t=y/h_; d.line([0,y,w,y],fill=tuple(int(col[i]*(1-t)+col2[i]*t) for i in range(3)))
    ov=Image.new("RGBA",(w,h_),(0,0,0,0)); o=ImageDraw.Draw(ov)
    for i in range(7):
        r=(60+h(slug,i+2)%260)*S; x=h(slug,i+3)%w; y=h(slug,i+4)%h_
        o.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255,14+h(slug,i)%22))
    for i in range(6):
        x=(h(slug,i+5)%w); o.rounded_rectangle([x,0,x+30*S,h_],0,fill=(255,255,255,8))
    img=Image.alpha_composite(img.convert("RGBA"),ov); d=ImageDraw.Draw(img)
    cx,cy=w//2,h_//2; R=210*S
    d.ellipse([cx-R-30*S,cy-R-30*S,cx+R+30*S,cy+R+30*S],outline=(255,255,255,90),width=3*S)
    sh=Image.new("RGBA",(w,h_),(0,0,0,0)); ImageDraw.Draw(sh).ellipse([cx-R,cy-R+14*S,cx+R,cy+R+14*S],fill=(0,0,0,70)); img=Image.alpha_composite(img,sh.filter(ImageFilter.GaussianBlur(14*S))); d=ImageDraw.Draw(img)
    d.ellipse([cx-R,cy-R,cx+R,cy+R],fill=shade(base,.8)+(255,))
    draw_icon(d,icon_for(slug,c),cx,cy,115*S,col)
    img.convert("RGB").resize((800,533),Image.LANCZOS).save(os.path.join(D,slug+".jpg"),quality=88)
if __name__=="__main__":
    n=0
    for c,s in CATS.items():
        for slug in s.split():
            make(slug,c); n+=1
    print("generate",n)
