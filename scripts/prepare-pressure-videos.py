"""Prepare locally audited pressure videos without changing the source files.

Requires ffmpeg/ffprobe on PATH and Pillow. The replacement cards are original
diagrams drawn from code; no source image is edited. No network or database use.
Every replacement interval also mutes its source narration. The resulting
reading-card edition deliberately has silent sections, not replacement speech.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".cache/pressure-import/audit-video"
OUT = ROOT / "imports/pressure-learning-media/prepared/video"
FONT = Path("C:/Windows/Fonts/arial.ttf")
BOLD = Path("C:/Windows/Fonts/arialbd.ttf")
NAVY = "#123956"
BLUE = "#007FA6"
INK = "#15394B"
WATER = "#62CEE8"
ORANGE = "#EC9852"

SOURCES = {
    "pressure": "https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure",
    "pascal": "https://openstax.org/books/university-physics-volume-1/pages/14-3-pascals-principle-and-hydraulics",
    "bernoulli": "https://openstax.org/books/university-physics-volume-1/pages/14-6-bernoullis-equation",
    "gas": "https://openstax.org/books/college-physics-2e/pages/13-3-the-ideal-gas-law",
    "balloon": "https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action",
    "magdeburg": "https://www.americanhistory.si.edu/de/collections/object/nmah_1184614",
    "magdeburg-history": "https://digital.deutsches-museum.de/projekte/gruendungssammlung/detail/175/",
}


def card(start, end, title, formula, lines, diagram, issue, source="pressure"):
    return dict(start=start, end=end, title=title, formula=formula,
                lines=lines, diagram=diagram, issue=issue, source=source)


VIDEOS = [
    dict(key="solid", source="Katı_Basıncını_Hesaplamak.mp4",
         output="Kati_Basincini_Hesaplamak_Incelenmis.mp4", cards=[
        card(38.8, 67.05, "Basıncın tanımı ve gösterimi", "P = F_dik / A", [
            "Basınç, birim alana etki eden dik kuvvettir.",
            "P veya p ile gösterilir; SI birimi pascaldır.",
            "P harfinin 'piezo'dan geldiği iddiası kullanılmamıştır."], "solid",
            "Unverified etymology removed; define the physical quantity instead."),
        card(97.9, 125.1, "Pascal: basıncın SI birimi", "1 Pa = 1 N/m²", [
            "Kuvvet N, alan m² alınırsa sonuç Pa olur.",
            "atm ve mmHg gibi başka basınç birimleri de vardır.",
            "Birim seçimi maddenin katı, sıvı veya gaz oluşuna bağlı değildir."], "units",
            "Pascal was incorrectly described as the only valid unit for solids."),
        card(156.9, 184.0, "Katılarda kuvvet aktarımı", "Dengede: F_net = 0", [
            "İdeal TYT modelinde katı cisim dengededir.",
            "Ağırlık ve diğer kuvvetler ihmal ediliyorsa, iki yüzeydeki kuvvetlerin büyüklükleri eşittir.",
            "Gerçek darbelerde ivme ve şekil değişimi bu basit modeli sınırlar."], "transmission",
            "Absolute force-transmission claim lacks static, ideal-model assumptions."),
        card(184.0, 224.1, "Çivi neden daha kolay batar?", "P_uç = F / A_uç", [
            "Aynı dik kuvvet, küçük temas alanında daha büyük basınç oluşturur.",
            "Bu karşılaştırma kuvvet eşit tutulduğunda geçerlidir.",
            "Çekiç darbesindeki tüm kuvvetin kayıpsız ve değişmeden iletildiği söylenemez."], "nail",
            "Dynamic hammer impact was incorrectly treated as universally lossless static transfer."),
        card(280.9, 316.1, "Eşit kuvvet, farklı temas alanı", "P₁ : P₂ : P₃ = 2 : 3 : 6", [
            "Her cisim yüzeye G büyüklüğünde dik kuvvet uygulasın.",
            "Alanlar 3A, 2A ve A ise basınçlar G/(3A), G/(2A) ve G/A olur.",
            "Kuvvet sabitken temas alanı küçüldükçe basınç artar."], "ratio",
            "Clarifies areas versus widths and the equal-force condition."),
        card(316.1, 352.1, "Ağırlık tek başına yeterli değildir", "P₀ = G/A;  P_K = P₀/2;  P_L = P₀", [
            "K cisminin ağırlığı 2G, temas alanı 4A olsun.",
            "L cisminin ağırlığı G, temas alanı A olsun.",
            "P_K/P_L = 1/2. L'nin basıncı K'nin iki katıdır."], "compare",
            "Adds the missing pressure reference and correct area dimensions."),
    ]),
    dict(key="liquid", source="Sıvı_Basıncında_Ustalaşmak.mp4",
         output="Sivi_Basincinda_Ustalasmak_Incelenmis.mp4", cards=[
        card(27.1, 58.1, "Sıvının oluşturduğu basınç", "P_sıvı = ρgh", [
            "h: yüzeyden dikey derinlik; ρ: sıvının özkütlesi.",
            "Durgun ve sabit özkütleli sıvı modeli kullanılır.",
            "Mutlak basınç: P_mutlak = P_yüzey + ρgh. Açık kapta P_yüzey = P_atm."], "hydrostatic",
            "Distinguishes gauge contribution from absolute pressure and defines assumptions."),
        card(81.1, 117.45, "ρgh bağıntısı nereden gelir?", "ΔP = ρgh", [
            "Alanı A, yüksekliği h olan hayali düşey sıvı sütununu düşünün.",
            "Dengede: ΔP × A = ρ × A × h × g.",
            "A sadeleşir. Bu türetme, her biçimde kapta taban kuvvetinin ağırlığa eşit olduğu anlamına gelmez."], "column",
            "Prevents the derivation from implying bottom force equals weight for arbitrary vessels."),
        card(117.45, 149.25, "Üst üste karışmayan sıvılar", "P_alt = P_yüzey + ρ₁gh₁ + ρ₂gh₂", [
            "Her katmanın düşey kalınlığı ayrı kullanılır.",
            "Katmanların basınç katkıları toplanır.",
            "Açık hava basıncı, yalnız sıvıların katkısı soruluyorsa dışarıda bırakılır."], "layers",
            "Clarifies the missing surface-pressure term in the total-pressure claim."),
        card(149.25, 181.1, "Kabı sabit debiyle doldurmak", "P_sıvı(t) = ρg h(t)", [
            "Sıvı sabit hacimsel debiyle eklenir; özkütle değişmez.",
            "Sabit kesitte P–zaman grafiği doğrusaldır.",
            "Yukarı genişleyen kapta eğim azalır; daralan kapta artar. P–h grafiği her zaman doğrusaldır."], "graphs",
            "Makes the graph axes and constant-inflow assumptions explicit."),
        card(181.1, 215.1, "Basınç kuvveti: doğru yüzeyi seçin", "F = P_ortalama × A", [
            "Yatay ve aynı derinlikteki yüzeyde: F = ρghA.",
            "Düzlemsel yan yüzeyde h, alan merkezinin derinliğidir.",
            "Keyfî bir yüzey için tek bir noktanın basıncı tüm alana uygulanamaz."], "force",
            "Source applied a single point pressure to arbitrary surfaces."),
        card(256.9, 311.1, "U borusunda basınç dengesi", "Aynı yatay düzeyde: P_sol = P_sağ", [
            "Karşılaştırılan noktalar aynı bağlı ve durgun sıvının içinde olmalıdır.",
            "Aynı yükseklik tek başına yeterli değildir; ayrı sıvı cepleri eşitlenemez.",
            "Her kolda yüzey basıncı ve sıvı katmanları birlikte hesaba katılır."], "utube",
            "The mnemonic omitted connected-fluid and equilibrium conditions."),
        card(311.1, 356.1, "Pascal ilkesi ve hidrolik sistem", "ΔP = F₁/A₁ = F₂/A₂", [
            "Kapalı sıvıya uygulanan basınç DEĞİŞİMİ her noktaya aynen iletilir.",
            "Yazılan piston oranı aynı seviyede, ağırlıksız ve sürtünmesiz pistonlar içindir.",
            "Seviyeler farklıysa hidrostatik ρgΔh terimi eklenir; basınç her noktada aynı değildir."], "hydraulic",
            "Distinguishes uniform pressure change from unequal absolute pressures at different depths.", "pascal"),
        card(356.1, 393.0, "Aktarılan hacim yüksekliği belirler", "V = A h  (sabit kesit)", [
            "Hacmin yarısı aktarılınca yükseklik her kapta 2h olmaz.",
            "Başlangıç yüksekliği 3h ve kesiti A olan bir silindirin hacmi 3Ah'dir.",
            "Yarı hacim 1,5Ah'dir. Yeni kabın kesiti verilmeden yeni yükseklik bulunamaz."], "transfer",
            "Six-section source example gave an unsupported 3h to 2h result."),
        card(393.0, 422.1, "Doğru örnek: eşit kesitli iki kap", "h_yeni = 1,5h;  P_yeni = P_ilk / 2", [
            "Her iki kap da sabit ve aynı A kesit alanına sahip olsun.",
            "3h yüksekliğindeki sıvının yarısı yeni kaba aktarılır.",
            "Yeni derinlik 1,5h olur. Sıvı basıncı da başlangıç değerinin yarısıdır."], "transfer",
            "Replaces the invalid geometry with a fully specified and correct example."),
        card(426.9, 454.0, "Dikdörtgen yan duvarda basınç", "P_ort = (P_üst + P_alt) / 2", [
            "Durgun, sabit özkütleli sıvıda dikdörtgen düzlem için geçerlidir.",
            "Sıvı basıncı derinlikle doğrusal değişir.",
            "Serbest yüzeyde sıvının basınç katkısı sıfırdır; mutlak basınç sıfır değildir."], "wall",
            "Source omitted the rectangular-area condition and called surface absolute pressure zero."),
        card(454.0, 474.05, "Yan yüzeyde kuvvet", "F = ρg h_merkez A", [
            "Genel düzlemsel yüzeyde alan merkezinin derinliğini kullanın.",
            "Üçgen veya farklı biçimli yüzeyde üst–alt basınçların basit ortalaması yetmez.",
            "Karşı tarafın basıncı varsa net kuvvet basınç farkıyla hesaplanır."], "wall",
            "Prevents applying the endpoint arithmetic mean to arbitrary shapes."),
        card(474.05, 504.0, "Yağ–su U borusu: doğru düzenek", "A_sol = A_sağ;  h_yağ = 10 cm", [
            "İki kol da aynı atmosfer basıncına açıktır ve kesit alanları eşittir.",
            "Yağ sol kola eklenir; sol su seviyesi 4 cm iner.",
            "Sağ su seviyesi 4 cm yükselir. İki su seviyesi farkı 8 cm olur."], "oil",
            "Original oil/water colors, interfaces, 10 cm dimension and left/right labels conflicted."),
        card(504.0, 534.1, "Yağın özkütlesini bulalım", "ρ_yağ × 10 = ρ_su × 8", [
            "Yağ–su ara yüzeyinden geçen yatay düzeyde basınçları eşitleyin.",
            "ρ_su = 1,0 g/cm³ ise ρ_yağ = 0,8 g/cm³ bulunur.",
            "Kesitler eşit değilse su iki kolda eşit miktarda yer değiştirmez."], "oil",
            "Makes the equal-section condition and density unit explicit, with corrected diagram."),
        card(534.1, 561.2, "Modelin geçerlilik koşulları", "dP/dh = ρg", [
            "ρgh, özkütle ve yer çekimi yaklaşık sabitken kullanılır.",
            "Büyük derinliklerde basınca bağlı özkütle değişimi dikkate alınabilir.",
            "Fizik yasası geneldir; basit sabit-özkütle yaklaşımı her ölçekte tam sonuç vermez."], "hydrostatic",
            "Source claimed the unchanged simple rho-g-h approximation was exact at all depths."),
        card(561.2, 589.5, "Kulaktaki etki: basınç farkı", "F_net ≈ ΔP × A", [
            "ρgh bir basınçtır; ağırlık veya kuvvet birimi değildir.",
            "Kulak zarına etki, iki tarafın basınç farkıyla ilişkilidir.",
            "Dış basınç artarken iç basınç dengelenmezse rahatsızlık hissedilebilir."], "ear",
            "The closing narration treated rho-g-h as an unspecified load rather than pressure."),
    ]),
    dict(key="gas", source="Gaz_Basıncını_Anlamak.mp4",
         output="Gaz_Basincini_Anlamak_Incelenmis.mp4", cards=[
        card(49.0, 90.0, "Pipette sıvıyı ne yükseltir?", "P_atm − P_ağız > ρgh  (akış başlarken)", [
            "Emme, pipetin üstündeki basıncı düşürür.",
            "Sıvıyı yukarı iten etki bardak yüzeyindeki atmosfer basıncıdır.",
            "Gerçek akışta sürtünme kayıpları da vardır. Bu olay yalnız 'Bernoulli' sözüyle açıklanmaz."], "straw",
            "Source attributed the straw mechanism directly to Bernoulli and claimed universally high-to-low flow.", "bernoulli"),
        card(90.0, 117.6, "Bernoulli: koşullarıyla kullanın", "P + ½ρv² + ρgz = sabit", [
            "Kararlı, sıkıştırılamaz, sürtünmesi ihmal edilen akışta aynı akım çizgisi boyunca.",
            "Aynı yükseklikte dar kesitte hız artarken statik basınç azalır.",
            "Yer çekimi, pompa veya atalet varken akış her zaman yüksek statik basınçtan düşüğe olmaz."], "bernoulli",
            "Adds steady/inviscid/incompressible/same-streamline/equal-height conditions.", "bernoulli"),
        card(160.5, 190.8, "İdeal gaz: sabit tutulanları belirtin", "PV = nRT", [
            "P mutlak basınç, T kelvin cinsinden sıcaklıktır.",
            "Sabit gaz miktarında: T sabitse PV; V sabitse P/T; P sabitse V/T sabittir.",
            "Isıtma örneğinde esnek balonun hacmi, iç basınç yaklaşık sabitse sıcaklıkla orantılıdır."], "gaslaws",
            "Source omitted fixed gas amount, absolute quantities and constant-pressure assumptions.", "gas"),
        card(198.5, 230.0, "Gerçek balon ve ideal balon", "P_iç = P_dış + ΔP_zar", [
            "Gerçek esnek balonda zar gerilimi nedeniyle iç ve dış basınç genellikle eşit değildir.",
            "Zar etkisi ihmal edilirse P_iç ≈ P_dış kabul edilir.",
            "Bu yaklaşık eşitlik tüm esnek balonlar için tam bir yasa değildir."], "balloon",
            "Source claimed a real elastic balloon must always exactly equalize internal/external pressure.", "balloon"),
        card(230.0, 262.7, "Yükselen balon: koşullu sonuç", "T ve n sabitse: P_iç V = sabit", [
            "Dış basınç azalırken zar etkisi ihmal edilen kapalı balon genişler.",
            "Gaz kütlesi korunursa hacim artarken özkütle azalır: ρ = m/V.",
            "Gerçekte sıcaklık ve zar gerilimi de etkilidir; her balonun mutlaka patlayacağı söylenemez."], "balloon",
            "Adds thermal/mass/membrane assumptions and removes the guaranteed-burst claim.", "gas"),
        card(319.9, 355.0, "Magdeburg yarım küreleri", "P_dış > P_iç", [
            "Otto von Guericke'nin 17. yüzyıldaki deneyleri atmosfer basıncının etkisini gösterir.",
            "İçerideki hava pompalanarak basınç düşürülür; mükemmel boşluk gerekmez.",
            "Yarım küreleri bir arada tutan, dış ve iç basınç arasındaki farktır."], "hemispheres",
            "Removes unsupported 1650 dating and the perfect-vacuum requirement.", "magdeburg"),
        card(355.0, 390.5, "Ayırmak için gereken kuvvet", "F ≈ (P_dış − P_iç) × πr²", [
            "Yaklaşım, dairesel birleşim alanına ve basınç farkına dayanır.",
            "Dışarıdaki hava her yönden iter; kilit veya yapıştırıcı gerekmez.",
            "İçeri hava alınıp basınçlar eşitlenince ayırmak kolaylaşır."], "hemispheres",
            "Replaces imprecise force narration with the differential-pressure mechanism.", "magdeburg"),
        card(390.5, 421.7, "Atmosfer basıncı neden ezmez?", "Basınç her yönde etki eder", [
            "Vücut sıvıları ve dokular dış basınca karşı denge sağlar.",
            "Bu etki omuzlarda taşınan tek yönlü bir 'tonlarca yük' gibi düşünülmemelidir.",
            "Gaz dolu boşluklarda ani basınç farkları yine de etki yaratabilir."], "body",
            "Removes misleading literal weight-on-shoulders explanation."),
    ]),
]


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def typography(text):
    # Windows Arial does not provide every Unicode subscript digit. Plain
    # numeric indices keep all formulas readable rather than showing tofu boxes.
    return text.translate(str.maketrans("₀₁₂₃₄₅₆₇₈₉", "0123456789"))


def wrap(draw, text, face, width):
    text = typography(text)
    lines, line = [], ""
    for word in text.split():
        candidate = (line + " " + word).strip()
        if draw.textlength(candidate, font=face) > width and line:
            lines.append(line); line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def arrow(d, a, b, fill=BLUE, width=5):
    d.line([a, b], fill=fill, width=width)
    theta = math.atan2(b[1]-a[1], b[0]-a[0])
    pts = [b]
    for sign in [-1, 1]:
        pts.append((b[0]-15*math.cos(theta+sign*.45), b[1]-15*math.sin(theta+sign*.45)))
    d.polygon(pts, fill=fill)


def diagram(kind):
    im = Image.new("RGB", (360, 340), "#EDF8FD")
    d = ImageDraw.Draw(im)
    def text(x, y, s, size=22, bold=False, color=INK):
        d.text((x, y), typography(s), font=font(size, bold), fill=color)
    def tank(x=60, y=80, w=240, h=210, level=140):
        d.rectangle((x+5,level,x+w-5,y+h-5), fill=WATER)
        d.line([(x,y),(x,y+h),(x+w,y+h),(x+w,y)], fill=NAVY, width=5)
        d.line([(x+4,level),(x+w-4,level)], fill=BLUE, width=3)
    if kind in ["solid", "transmission", "nail", "ratio", "compare"]:
        d.rounded_rectangle((35,255,325,276), radius=5, fill="#B8CAD4", outline=NAVY, width=3)
        if kind=="nail":
            d.polygon([(158,112),(202,112),(190,126),(188,218),(180,254),(172,218),(170,126)], fill="#A3BAC9", outline=NAVY)
            arrow(d,(180,25),(180,105),ORANGE,8); text(205,50,"F",28,True)
            text(52,295,"Küçük A → büyük P",23,True)
        elif kind=="ratio":
            for x,w,lab in [(35,95,"3A"),(155,65,"2A"),(260,40,"A")]:
                d.rectangle((x,165,x+w,252),fill=ORANGE,outline=NAVY,width=3)
                arrow(d,(x+w/2,70),(x+w/2,160)); text(x+w/2-8,35,"G",23,True)
                text(x+w/2-16,285,lab,22,True)
        elif kind=="compare":
            d.polygon([(45,170),(135,170),(155,253),(25,253)],fill=ORANGE,outline=NAVY)
            d.rectangle((243,190,300,253),fill="#71C8DE",outline=NAVY,width=3)
            arrow(d,(90,73),(90,161));arrow(d,(270,95),(270,182))
            text(63,35,"2G",26,True);text(260,58,"G",26,True)
            text(67,286,"4A",24,True);text(259,286,"A",24,True)
            text(80,203,"K",25,True);text(260,212,"L",25,True)
        else:
            d.polygon([(110,145),(230,145),(258,170),(138,170)],fill="#FFC487",outline=NAVY)
            d.polygon([(138,170),(258,170),(258,250),(138,250)],fill=ORANGE,outline=NAVY)
            d.polygon([(110,145),(138,170),(138,250),(110,225)],fill="#C9723F",outline=NAVY)
            arrow(d,(180,35),(180,135),BLUE,7);text(210,65,"F",27,True)
            text(170,286,"A",27,True)
            if kind=="transmission": text(20,8,"İdeal denge modeli",24,True)
    elif kind=="units":
        for y,s in [(40,"Pa"),(115,"N/m²"),(195,"atm · mmHg")]:
            d.rounded_rectangle((30,y,330,y+64), radius=15, fill="white",outline="#BAD8E4",width=2)
            text(64,y+14,s,32,True)
    elif kind in ["hydrostatic", "column", "layers", "force", "ear"]:
        tank()
        if kind=="layers":
            d.rectangle((65,140,295,198),fill="#F8D684");d.line((65,198,295,198),fill=NAVY,width=2)
            text(100,157,"ρ₁, h₁",25,True);text(100,225,"ρ₂, h₂",25,True)
        elif kind=="column":
            d.rectangle((135,141,225,284),outline=NAVY,width=3)
            text(159,195,"ρAh",24,True); text(170,295,"A",22,True)
        else:
            arrow(d,(320,143),(320,282),ORANGE,4);text(323,200,"h",24,True)
            text(80,250,"ρ",28,True)
            d.ellipse((170,225,182,237),fill=ORANGE)
            text(70,38,"P_yüzey",20,True)
            if kind in ["force", "ear"]:
                arrow(d,(170,260),(170,310));text(196,298,"F",23,True)
    elif kind=="graphs":
        text(25,14,"P_sıvı",23,True);text(260,292,"zaman",22,True)
        arrow(d,(45,280),(325,280),NAVY,3);arrow(d,(45,280),(45,65),NAVY,3)
        d.line([(45,280),(285,70)],fill=BLUE,width=5)
        d.line([(45+i,280-int(220*(1-math.exp(-i/100)))) for i in range(240)],fill=ORANGE,width=5)
        text(73,43,"Sabit kesit",21,True);text(130,190,"Genişleyen",20,True)
    elif kind in ["utube", "oil"]:
        # U-shaped connected water: identical arm areas, left interface y190,
        # right free water surface y110, initial common level y150.
        d.rectangle((65,190,108,266),fill=WATER)
        d.rectangle((252,110,295,266),fill=WATER)
        d.rectangle((65,244,295,288),fill=WATER)
        d.line([(60,55),(60,290),(300,290),(300,55)],fill=NAVY,width=5)
        d.line([(111,55),(111,240),(249,240),(249,55)],fill=NAVY,width=5)
        if kind=="oil":
            d.rectangle((65,90,107,190),fill="#F9CC65")
            d.line((65,190,107,190),fill=NAVY,width=2)
            for x in range(26,333,15): d.line((x,150,x+7,150),fill="#889DA9",width=2)
            for x in range(26,333,15): d.line((x,190,x+7,190),fill=ORANGE,width=2)
            arrow(d,(37,92),(37,187),ORANGE,3)
            arrow(d,(320,112),(320,188),BLUE,3)
            text(5,50,"10 cm",19,True);text(260,203,"8 cm",19,True)
            text(40,5,"Yağ",22,True);text(247,5,"Su",22,True)
            text(75,306,"Eşit kesitli kollar",22,True)
        else:
            for x in range(35,330,14): d.line((x,215,x+7,215),fill=ORANGE,width=2)
            text(13,307,"Aynı bağlı sıvı • denge",22,True)
    elif kind=="hydraulic":
        d.rectangle((40,165,105,260),fill=WATER);d.rectangle((225,165,325,260),fill=WATER)
        d.rectangle((45,245,325,280),fill=WATER)
        d.line([(35,135),(35,285),(330,285),(330,70)],fill=NAVY,width=5)
        d.line([(110,135),(110,230),(220,230),(220,70)],fill=NAVY,width=5)
        d.rectangle((35,155,110,170),fill=ORANGE,outline=NAVY,width=3)
        d.rectangle((220,155,330,170),fill=ORANGE,outline=NAVY,width=3)
        arrow(d,(72,60),(72,145));arrow(d,(275,145),(275,60))
        text(45,20,"F₁",24,True);text(292,37,"F₂",24,True)
        text(53,187,"A₁",23,True);text(258,187,"A₂",23,True)
        text(25,305,"Pistonlar aynı seviyede",22,True)
    elif kind=="transfer":
        for x in [25,215]:
            d.line([(x,70),(x,280),(x+105,280),(x+105,70)],fill=NAVY,width=4)
            text(x+45,298,"A",23,True)
        d.rectangle((30,95,125,275),fill=WATER)
        d.rectangle((220,185,315,275),fill=WATER)
        text(43,25,"3h",25,True);text(232,137,"1,5h",25,True)
        arrow(d,(145,185),(197,185),ORANGE,5)
        text(143,140,"V/2",20,True)
    elif kind=="wall":
        d.rectangle((55,80,275,285),fill=WATER)
        d.line((55,80,275,80),fill=BLUE,width=3)
        d.line((278,72,278,290),fill=NAVY,width=7)
        for y in range(100,281,30): arrow(d,(284,y),(284+(y-80)//3,y),ORANGE,3)
        text(42,25,"Serbest yüzey",23,True)
        text(68,173,"P_sıvı = ρgh",23,True)
        text(45,307,"Basınç derinlikle artar",23,True)
    elif kind in ["bernoulli", "straw"]:
        if kind=="straw":
            tank(50,100,220,180,165)
            d.line([(160,244),(160,50),(290,50)],fill=NAVY,width=14)
            arrow(d,(166,220),(166,85),ORANGE,5)
            text(25,115,"P_atm",24,True);text(208,5,"P_ağız",24,True)
        else:
            d.polygon([(20,90),(110,90),(185,140),(340,140),(340,215),(185,215),(110,265),(20,265)],fill=WATER,outline=NAVY)
            arrow(d,(40,177),(110,177));arrow(d,(210,177),(325,177),ORANGE,6)
            text(24,30,"Geniş",23,True);text(232,85,"Dar",23,True)
            text(40,289,"v küçük",23,True);text(218,248,"v büyük",23,True)
    elif kind in ["gaslaws", "balloon"]:
        if kind=="balloon":
            d.ellipse((95,55,265,245),fill="#BEEAF4",outline=BLUE,width=4)
            d.polygon([(170,244),(190,244),(180,263)],fill=BLUE)
            d.line([(180,260),(165,310)],fill=NAVY,width=2)
            text(115,138,"P_iç",29,True);text(10,17,"P_dış",25,True)
            arrow(d,(30,120),(88,120));arrow(d,(330,120),(272,120))
            text(43,315,"Zar etkisi: ΔP_zar",23,True)
        else:
            d.rounded_rectangle((55,55,305,280),radius=20,fill="white",outline=BLUE,width=4)
            for x,y in [(90,90),(180,110),(260,80),(110,210),(250,220),(200,175)]:
                d.ellipse((x,y,x+15,y+15),fill=ORANGE,outline=NAVY,width=2)
            text(72,301,"n sabit • T: kelvin",24,True)
    elif kind=="hemispheres":
        d.ellipse((70,65,290,285),fill="#D6E5EF",outline=NAVY,width=4)
        d.line((180,65,180,285),fill=NAVY,width=5)
        for a,b in [((10,175),(65,175)),((350,175),(295,175)),((180,10),(180,60)),((180,337),(180,290))]:
            arrow(d,a,b,ORANGE,5)
        text(118,154,"P_iç düşük",23,True)
    elif kind=="body":
        d.ellipse((145,45,215,115),fill="#F4C8A7",outline=NAVY,width=3)
        d.rounded_rectangle((120,120,240,285),radius=45,fill="#8ED3E6",outline=NAVY,width=3)
        for a,b in [((25,160),(110,160)),((335,160),(250,160)),((180,5),(180,35)),((180,335),(180,295))]:arrow(d,a,b,BLUE,5)
        text(18,305,"Her yönde basınç",24,True)
    else:
        raise ValueError(f"Unknown diagram {kind}")
    return im


def render_card(c, output):
    im = Image.new("RGB", (1280,720), "#F8FCFF")
    d = ImageDraw.Draw(im)
    d.rectangle((0,0,1280,65),fill=NAVY)
    d.text((55,18),"TYT FİZİK  /  BASINÇ",font=font(26,True),fill="white")
    d.text((847,21),"DÜZELTİLMİŞ OKUMA BÖLÜMÜ",font=font(20,True),fill="#BFEFFA")
    titlefont=font(40,True)
    titlelines=wrap(d,c['title'],titlefont,1150)
    y=92
    for line in titlelines:
        d.text((58,y),line,font=titlefont,fill=NAVY);y+=48
    # Formula and main text stay entirely within the left reading column.
    formula_face=font(31,True)
    formula_lines=wrap(d,c['formula'],formula_face,745)
    fy=175
    d.rounded_rectangle((55,165,840,165+len(formula_lines)*42+22),radius=15,fill="#E0F3FA")
    for line in formula_lines:
        d.text((76,fy),line,font=formula_face,fill=BLUE);fy+=42
    y=fy+30
    body=font(27)
    for item in c['lines']:
        lines=wrap(d,item,body,715)
        d.ellipse((64,y+11,72,y+19),fill=BLUE)
        for line in lines:
            d.text((89,y),line,font=body,fill=INK); y+=35
        y+=14
    if y>637:
        raise ValueError(f"Card text overflow: {c['title']} at y={y}")
    im.paste(diagram(c['diagram']),(875,235))
    d.line((55,654,1225,654),fill="#CCE3EE",width=2)
    d.text((58,673),"Bu bölümde anlatım sessizdir. Düzeltilmiş açıklamayı okuyarak ilerleyin.",font=font(20),fill="#4B6676")
    im.save(output)


def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)],text=True,encoding='utf-8'))


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source-dir',type=Path,default=Path('C:/Users/akink/Downloads'))
    p.add_argument('--only',choices=['solid','liquid','gas'])
    p.add_argument('--cards-only',action='store_true')
    p.add_argument('--crf',type=int,default=24)
    args=p.parse_args()
    WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
    report={'schemaVersion':1,'edition':'Corrected silent-reading-card preview edition',
            'auditMethod':'Complete Turkish small-Whisper transcripts and all slide contact sheets reviewed; deterministic replacement cards cover incorrect slides and mute their narration.',
            'limitations':['Automatic transcription may contain spelling errors.','Silent reading intervals replace the original narration; these are not newly voiced lesson videos.','This is an educational content review, not a claim that every real-world approximation is exact.'],
            'sources':SOURCES,'videos':[]}
    for video in VIDEOS:
        if args.only and video['key']!=args.only:continue
        src=(args.source_dir/video['source']).resolve()
        if not src.is_file():raise FileNotFoundError(src)
        metadata=probe(src);duration=float(metadata['format']['duration'])
        cardsdir=WORK/(video['key']+'-cards');cardsdir.mkdir(parents=True,exist_ok=True)
        entry={k:v for k,v in video.items() if k!='cards'}
        entry.update(sourceSha256=sha(src),duration=duration,cards=[])
        prev=0
        for i,c in enumerate(video['cards']):
            if not (prev<=c['start']<c['end']<=duration):raise ValueError('Overlapping or invalid card times')
            prev=c['end'];path=cardsdir/f'{i+1:02d}.png';render_card(c,path)
            entry['cards'].append(dict(c,cardPath=str(path.relative_to(ROOT)).replace('\\','/'),
                                      sourceUrl=SOURCES[c['source']],audioMuted=True,visualReplaced=True))
        report['videos'].append(entry)
        # Persist the audit plan before encoding so preparation is reviewable.
        (WORK/f"{video['key']}-audit.json").write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
        if args.cards_only:continue
        dest=OUT/video['output']
        filters=[];inputs=['ffmpeg','-hide_banner','-loglevel','warning','-y','-i',str(src)]
        for i,c in enumerate(entry['cards']):
            inputs+=['-i',str(ROOT/c['cardPath'])]
            filters.append(f"[{i+1}:v]format=yuv420p[card{i}]")
        previous='0:v'
        for i,c in enumerate(entry['cards']):
            label=f'v{i}'
            filters.append(f"[{previous}][card{i}]overlay=0:0:eof_action=repeat:enable='gte(t,{c['start']})*lt(t,{c['end']})'[{label}]")
            previous=label
        filters.append(f"[{previous}]format=yuv420p[vout]")
        af=','.join(f"volume=0:enable='gte(t,{c['start']-.08})*lt(t,{c['end']+.08})'" for c in entry['cards'])
        filters.append(f'[0:a]{af}[aout]')
        filterfile=WORK/f"{video['key']}-filters.txt";filterfile.write_text(';\n'.join(filters),encoding='utf-8')
        cmd=inputs+['-filter_complex_threads','2','-filter_complex',';'.join(filters),'-map','[vout]','-map','[aout]',
                    '-c:v','libx264','-threads','4','-preset','veryfast','-crf',str(args.crf),'-pix_fmt','yuv420p',
                    '-c:a','aac','-b:a','96k','-ar','44100','-movflags','+faststart','-t',str(duration),str(dest)]
        print('Encoding',video['key'],flush=True)
        subprocess.run(cmd,check=True)
        result=probe(dest)
        if dest.stat().st_size>=50_000_000:raise ValueError(f'Output exceeds 50 MB: {dest}')
        if abs(float(result['format']['duration'])-duration)>.2:raise ValueError('Duration mismatch')
        if sha(src)!=entry['sourceSha256']:raise ValueError('Source was unexpectedly changed')
        entry.update(outputPath=str(dest.relative_to(ROOT)).replace('\\','/'),
                     outputSha256=sha(dest),outputBytes=dest.stat().st_size,outputProbe=result)
        (WORK/f"{video['key']}-audit.json").write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
        print('Prepared',video['key'],dest.stat().st_size,flush=True)
    auditpath=WORK/('video-audit'+('-'+args.only if args.only else '')+'.json')
    auditpath.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(auditpath,flush=True)


if __name__=='__main__':main()
