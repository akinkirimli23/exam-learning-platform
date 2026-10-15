"""Build the reviewed TYT pressure guide from original text and vector artwork.

Requires ReportLab. Run from the repository root with the bundled Python runtime:
    python scripts/build-pressure-guide.py
The user's original PDF and images are never read or modified by this builder.
"""

from __future__ import annotations

import argparse
from math import pi, sin, cos
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 595.276, 841.89  # A4 portrait, points
MARGIN = 38
NAVY = colors.HexColor("#12334A")
INK = colors.HexColor("#19394D")
TEAL = colors.HexColor("#007F91")
BLUE = colors.HexColor("#1687BC")
PALE = colors.HexColor("#EAF6FA")
ORANGE = colors.HexColor("#E89432")
LILAC = colors.HexColor("#8F70BE")
GRAY = colors.HexColor("#536E7B")
LINE = colors.HexColor("#C9DFE8")
WHITE = colors.white
FONT = "PressureSans"
BOLD = "PressureSansBold"
TOTAL = 15


def register_fonts(font_dir: str | None) -> None:
    candidates = [Path(font_dir)] if font_dir else []
    candidates += [Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu")]
    for folder in candidates:
        for regular, bold in [("calibri.ttf", "calibrib.ttf"), ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf"), ("arial.ttf", "arialbd.ttf")]:
            if (folder / regular).exists() and (folder / bold).exists():
                regular_font = TTFont(FONT, str(folder / regular))
                bold_font = TTFont(BOLD, str(folder / bold))
                required = "İıŞşĞğÇçÖöÜü₁₂⁻ρΔΣ≈²³¹"
                if any(ord(char) not in font.face.charToGlyph for font in [regular_font, bold_font] for char in required):
                    continue
                pdfmetrics.registerFont(regular_font)
                pdfmetrics.registerFont(bold_font)
                pdfmetrics.registerFontFamily(FONT, normal=FONT, bold=BOLD)
                return
    raise SystemExit("Turkish and math font missing; pass --font-dir with Calibri or DejaVu Sans.")


class Guide:
    def __init__(self, output: Path):
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(output), pagesize=(WIDTH, HEIGHT), pageCompression=1)
        self.c.setTitle("TYT Fizik | Basınç ve Kuvvet Ders Rehberi")
        self.c.setAuthor("İvme | Fizik içerik incelemesi")
        self.c.setSubject("Katı, sıvı, gaz basıncı ve akışkanlar; koşulları açıklanmış ders rehberi")
        self.number = 0
        self.style = ParagraphStyle("body", fontName=FONT, fontSize=10.5, leading=15.4, textColor=INK)

    def text(self, text: str, x: float, y: float, size: float = 10.5, bold: bool = False, color=INK):
        self.c.setFillColor(color)
        self.c.setFont(BOLD if bold else FONT, size)
        self.c.drawString(x, y, text)

    def centered(self, text: str, x: float, y: float, size=10.5, bold=False, color=INK):
        self.c.setFillColor(color)
        self.c.setFont(BOLD if bold else FONT, size)
        self.c.drawCentredString(x, y, text)

    def para(self, text: str, x: float, top: float, width: float, size: float = 10.5, color=INK) -> float:
        style = ParagraphStyle("p", parent=self.style, fontSize=size, leading=size * 1.47, textColor=color)
        p = Paragraph(text, style)
        _, h = p.wrap(width, HEIGHT)
        if top - h < 45:
            raise ValueError(f"Page {self.number}: paragraph would overflow: {text[:70]}")
        p.drawOn(self.c, x, top - h)
        return top - h

    def page(self, title: str, section: str, subtitle: str):
        self.number += 1
        c = self.c
        c.setFillColor(WHITE)
        c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.rect(0, HEIGHT - 132, WIDTH, 132, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.rect(0, HEIGHT - 132, 8, 132, fill=1, stroke=0)
        self.text("İVME", MARGIN, HEIGHT - 31, 12, True, colors.HexColor("#87E0E3"))
        self.text("TYT FİZİK / BASINÇ", MARGIN + 61, HEIGHT - 30, 8.5, True, WHITE)
        self.text(f"{self.number:02d}", WIDTH - 65, HEIGHT - 48, 25, True, colors.HexColor("#70D3DC"))
        self.text(section.upper(), MARGIN, HEIGHT - 56, 8, True, colors.HexColor("#8CBCCB"))
        self.text(title, MARGIN, HEIGHT - 86, 23, True, WHITE)
        self.text(subtitle, MARGIN, HEIGHT - 110, 9.5, False, colors.HexColor("#D7E8EF"))
        c.setStrokeColor(LINE)
        c.setLineWidth(.7)
        c.line(MARGIN, 39, WIDTH - MARGIN, 39)
        self.text("İVME / KONU REHBERİ", MARGIN, 24, 7.5, True, GRAY)
        self.text("Katı • Sıvı • Gaz • Akışkanlar", MARGIN + 166, 24, 7.5, False, GRAY)
        self.text(f"{self.number} / {TOTAL}", WIDTH - MARGIN - 34, 24, 8, True, TEAL)

    def end(self):
        self.c.showPage()

    def panel(self, label: str, text: str, top: float, height: float, tint=PALE):
        self.c.setFillColor(tint)
        self.c.roundRect(MARGIN, top - height, WIDTH - 2 * MARGIN, height, 12, stroke=0, fill=1)
        self.text(label.upper(), MARGIN + 16, top - 24, 9, True, TEAL)
        bottom = self.para(text, MARGIN + 16, top - 37, WIDTH - 2 * MARGIN - 32)
        if bottom < top - height + 11:
            raise ValueError(f"Page {self.number}: panel '{label}' text overflows ({bottom}, {top-height}).")

    def note(self, text: str, top: float, height=64):
        self.c.setFillColor(colors.HexColor("#FFF3E2"))
        self.c.roundRect(MARGIN, top - height, WIDTH - 2 * MARGIN, height, 12, stroke=0, fill=1)
        bottom = self.para("<b>MODELİN KOŞULU</b> / " + text, MARGIN + 15, top - 13, WIDTH - 2 * MARGIN - 30, 9.5)
        if bottom < top - height + 10:
            raise ValueError(f"Page {self.number}: model note overflows.")

    def formula(self, label: str, equation: str, y: float, size: float = 22):
        self.text(label, MARGIN, y + 31, 8.5, True, TEAL)
        self.text(equation, MARGIN, y, size, True, NAVY)

    def line(self, x1, y1, x2, y2, color=INK, width=1.4, dash=None):
        self.c.setStrokeColor(color)
        self.c.setLineWidth(width)
        self.c.setDash(dash or [])
        self.c.line(x1, y1, x2, y2)
        self.c.setDash([])

    def arrow(self, x1, y1, x2, y2, color=ORANGE, width=2.2, head=7):
        self.line(x1, y1, x2, y2, color, width)
        dx, dy = x2 - x1, y2 - y1
        length = max((dx * dx + dy * dy) ** .5, .01)
        ux, uy = dx / length, dy / length
        p = self.c.beginPath()
        p.moveTo(x2, y2)
        p.lineTo(x2 - head * ux + head * .4 * uy, y2 - head * uy - head * .4 * ux)
        p.lineTo(x2 - head * ux - head * .4 * uy, y2 - head * uy + head * .4 * ux)
        p.close()
        self.c.setFillColor(color)
        self.c.drawPath(p, fill=1, stroke=0)

    def dimension(self, x, y1, y2, label, color=TEAL):
        self.arrow(x, y1, x, y2, color, 1.2, 4)
        self.arrow(x, y2, x, y1, color, 1.2, 4)
        self.text(label, x + 6, (y1 + y2) / 2 - 3, 9, True, color)

    def polygon(self, points, fill, stroke=None, width=1):
        p = self.c.beginPath()
        p.moveTo(*points[0])
        for x, y in points[1:]:
            p.lineTo(x, y)
        p.close()
        self.c.setFillColor(fill)
        self.c.setStrokeColor(stroke or fill)
        self.c.setLineWidth(width)
        self.c.drawPath(p, fill=1, stroke=bool(stroke))

    def brick(self, x, y, w, h, depth=18):
        self.polygon([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], colors.HexColor("#E9A65D"), ORANGE)
        self.polygon([(x, y + h), (x + depth, y + h + depth * .55), (x + w + depth, y + h + depth * .55), (x + w, y + h)], colors.HexColor("#FFD2A0"), ORANGE)
        self.polygon([(x + w, y), (x + w + depth, y + depth * .55), (x + w + depth, y + h + depth * .55), (x + w, y + h)], colors.HexColor("#CE7B30"), ORANGE)
        self.line(x - 12, y - 3, x + w + depth + 12, y - 3, GRAY, 1)

    def beaker(self, x, y, w, h, level, label=None, density=False):
        c = self.c
        c.setFillColor(colors.HexColor("#D5F0F6"))
        c.rect(x, y, w, level, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#8AD2E5"))
        c.ellipse(x, y + level - 5, x + w, y + level + 5, fill=1, stroke=0)
        self.line(x, y, x, y + h, BLUE, 2.2)
        self.line(x + w, y, x + w, y + h, BLUE, 2.2)
        self.line(x, y, x + w, y, BLUE, 2.2)
        for offset in range(20, h, 22):
            self.line(x + 3, y + offset, x + 11, y + offset, LINE, .8)
        if label:
            self.centered(label, x + w / 2, y - 21, 9.5, True, TEAL)

    def axes(self, x, y, w, h, xlabel="t", ylabel="P"):
        self.arrow(x, y, x + w, y, GRAY, 1, 4)
        self.arrow(x, y, x, y + h, GRAY, 1, 4)
        self.text(xlabel, x + w - 2, y - 15, 9, False, GRAY)
        self.text(ylabel, x - 15, y + h - 2, 9, False, GRAY)
        self.text("0", x - 8, y - 12, 7.5, False, GRAY)

    def gas_dots(self, x, y, w, h, count=8):
        positions = [(.17,.23),(.42,.65),(.73,.3),(.8,.78),(.2,.83),(.58,.16),(.5,.4),(.1,.51),(.65,.76),(.85,.55)]
        for px, py in positions[:count]:
            self.c.setFillColor(ORANGE)
            self.c.circle(x + px * w, y + py * h, 4, fill=1, stroke=0)

    def save(self):
        if self.number != TOTAL:
            raise ValueError(f"Expected {TOTAL} pages, got {self.number}.")
        self.c.save()


def build(output: Path):
    g = Guide(output)
    c = g.c

    # 1: learning path.
    g.page("Basınç ve kuvvet", "Konuya giriş", "Formülü ezberlemeden önce sistemi ve koşulları tanı.")
    g.formula("TEMEL FİKİR", "Aynı kuvvet, farklı etki.", 647, 25)
    g.brick(100, 484, 122, 54)
    g.brick(364, 484, 58, 114)
    g.arrow(160, 610, 160, 555)
    g.arrow(396, 658, 396, 616)
    g.centered("Geniş temas / daha küçük basınç", 169, 456, 9, True)
    g.centered("Dar temas / daha büyük basınç", 398, 456, 9, True)
    g.panel("Okuma rotası", "<b>01</b> Kuvvet ile basıncı ayır. <b>02</b> Sıvıda düşey derinliği izle.<br/><b>03</b> Gazda mutlak basınç ve sıcaklığı kullan. <b>04</b> Akışta varsayımları yaz.", 416, 100)
    g.panel("Bu rehberde", "Katı basıncı, durgun sıvılar, Pascal ilkesi ve hidrolik; atmosfer, ideal gaz, kaynama ve Bernoulli. Çizimler kavramsaldır; aksi belirtilmedikçe ölçekli değildir.", 296, 102)
    g.note("Her formülün bir kullanım alanı var. Önce durağan mı, akış var mı; hangi büyüklükler sabit, bunu belirle.", 173, 82)
    g.end()

    # 2: units and normal force.
    g.page("Basınç neyi ölçer?", "Temeller", "Yüzeye dik kuvveti temas alanına böl.")
    g.formula("ORTALAMA TEMAS BASINCI", "P = F_dik / A", 640, 29)
    g.brick(102, 453, 160, 53)
    g.arrow(182, 601, 182, 528, ORANGE, 3)
    g.text("F_dik", 197, 570, 12, True, ORANGE)
    g.dimension(88, 449, 451, "")
    g.text("A: gerçek temas alanı", 101, 423, 10, True, TEAL)
    g.para("<b>Basınç:</b> skaler büyüklük.<br/><br/><b>Kuvvet:</b> yönü olan vektörel büyüklük.<br/><br/>Basınçtan doğan yüzey kuvveti, yüzeye diktir.", 332, 575, 195)
    g.panel("Birimleri birlikte oku", "1 Pa = 1 N/m². Alanı m² cinsine çevir: <b>1 cm² = 10⁻⁴ m²</b>. 1 kPa = 1000 Pa.", 389, 83)
    g.panel("Hesap örneği", "F_dik = 60 N, A = 0,020 m² ise <b>P = 60 / 0,020 = 3000 Pa</b>. Aynı kuvvet yarı alana uygulanırsa basınç 6000 Pa olur.", 285, 101)
    g.note("P = F/A ortalama basınçtır. Basınç yüzeyde değişiyorsa tek bir noktadaki değeri bütün yüzeye uygulama.", 163, 78)
    g.end()

    # 3: same block, two orientations.
    g.page("Katılarda alanın rolü", "Katı basıncı", "Aynı cismin yönü değişir; ağırlığı değişmez.")
    g.brick(95, 489, 133, 52)
    g.brick(369, 489, 57, 124)
    for x, y in [(163,559),(399,632)]:
        g.arrow(x, y + 43, x, y, ORANGE, 2.5)
    g.centered("G = 24 N", 163, 618, 10, True)
    g.centered("G = 24 N", 399, 690, 10, True)
    g.centered("A₁ = 0,012 m²", 163, 457, 11, True, TEAL)
    g.centered("A₂ = 0,006 m²", 399, 457, 11, True, TEAL)
    g.centered("P₁ = 2000 Pa", 163, 431, 12, True)
    g.centered("P₂ = 4000 Pa", 399, 431, 12, True)
    g.panel("Değişkenleri ayır", "Kuvvet sabitken alan küçülürse basınç artar. Alan sabitken dik kuvvet artarsa basınç artar. Bıçağı bilemek teması daraltır; palet ve kar ayakkabısı teması genişletir.", 393, 112)
    g.panel("Ağırlık ne zaman kullanılır?", "Yatay düzlemde, yalnız ağırlığı ile duran cisim için F_dik = G alınır. Yukarı/aşağı ek kuvvet, eğim veya ivme varsa önce kuvvet dengesi incelenir.", 261, 100)
    g.note("Katıların kuvveti aynı büyüklükte iletmesi, tek eksenli ideal denge modelinin sonucudur. Darbe ve sürtünmede her zaman geçerli bir kural değildir.", 141, 82)
    g.end()

    # 4: hydrostatic depth correctly measured to point.
    g.page("Durgun sıvıda derinlik", "Hidrostatik", "h, serbest yüzeyden incelenen noktaya düşey uzaklıktır.")
    g.beaker(86, 442, 186, 200, 160)
    g.line(102, 494, 308, 494, TEAL, 1, [3,3])
    c.setFillColor(ORANGE); c.circle(175,494,4.5,fill=1,stroke=0)
    g.text("K", 184, 485, 11, True)
    g.dimension(295, 494, 602, "h")
    g.text("P_yüzey", 125, 623, 10, True, TEAL)
    g.text("BASINÇ FARKI", 345, 615, 8.5, True, TEAL)
    g.text("ΔP = ρgh", 345, 584, 22, True)
    g.para("Açık kapta:<br/><b>P_g = ρgh</b><br/><br/>Mutlak basınç:<br/><b>P = P_atm + ρgh</b>",345,554,180,11)
    g.panel("Neler belirler?", "Sabit yoğunluklu durgun sıvıda basınç katkısı; özkütle ρ, yerçekimi ivmesi g ve düşey derinlik h ile artar. Aynı sıvıda, aynı düzeyde basınç aynıdır; kabın şekli tek başına belirleyici değildir.", 400, 114)
    g.panel("Hesap örneği", "Su için ρ = 1000 kg/m³, g = 10 m/s² ve h = 0,60 m: <b>P_g = 6000 Pa</b>. Örnekte P_atm = 100 kPa alınırsa mutlak basınç <b>106 kPa</b> olur.",266,103)
    g.note("Gösterge basıncı atmosfer referansına göre ölçülür. Kapalı kapta yüzeyde farklı bir gaz basıncı varsa P_yüzey bu değerdir.",143,82)
    g.end()

    # 5: physically correct U-tube and layer pressures.
    g.page("Katmanlar ve U borusu", "Hidrostatik denge", "Eşitliği aynı bağlı sıvının aynı yatay düzeyinde kur.")
    # Two broad columns share the water-filled lower connecting region.
    x,y,w,h=80,452,222,180
    c.setFillColor(colors.HexColor("#8AD2E5"))
    c.rect(x,y,42,74,fill=1,stroke=0); c.rect(x+w-42,y,42,106,fill=1,stroke=0)
    c.rect(x,y,w,30,fill=1,stroke=0)
    c.setFillColor(colors.HexColor("#FFE3A0")); c.rect(x,y+74,42,72,fill=1,stroke=0)
    for xx in [x,x+42,x+w-42,x+w]:
        g.line(xx,y+30 if xx in [x+42,x+w-42] else y,xx,y+h,BLUE,2)
    g.line(x,y,x+w,y,BLUE,2); g.line(x+42,y+30,x+w-42,y+30,BLUE,2)
    g.line(x-10,y+74,x+w+16,y+74,TEAL,1,[4,3])
    g.dimension(x-16,y+74,y+146,"h₁")
    g.dimension(x+w+15,y+74,y+106,"h₂")
    g.text("yağ",x+7,y+112,10,True);g.text("su",x+w-32,y+50,10,True)
    g.text("ortak düzey",x+66,y+83,8,True,TEAL)
    g.para("<b>Her iki uç aynı dış basınca açık:</b><br/><br/>ρ₁ g h₁ = ρ₂ g h₂<br/><br/>Yağın yoğunluğu daha küçükse, aynı basınç katkısı için yağ sütunu daha uzun olur.",368,620,174,10.5)
    g.panel("Üst üste sıvılar", "Karışmayan, dengedeki katmanlarda her katkıyı ayrı topla:<br/><b>P_alt = P_yüzey + g(ρ₁h₁ + ρ₂h₂ + ...)</b>. Her h, ilgili sıvı katmanının düşey kalınlığıdır.",412,107)
    g.panel("Birleşik kaplar", "Aynı sıvı, aynı dış basınç ve durgun denge varsa serbest yüzeyler aynı yatay düzeye gelir. Yoğunluklar veya üstteki gaz basınçları farklıysa seviyelerin eşit olması gerekmez.",285,107)
    g.note("Farklı sıvılardaki rastgele iki noktayı yalnız aynı yükseklikte oldukları için eşitleme. Ortak sıvı ve kesintisiz hidrostatik bağlantıyı kontrol et.",158,91)
    g.end()

    # 6: Pascal and hydraulic mechanical advantage.
    g.page("Pascal ve hidrolik", "Kapalı akışkan", "Her yere iletilen büyüklük, dışarıdan eklenen basınç değişimidir.")
    c.setFillColor(colors.HexColor("#A9DDEB"));c.rect(104,458,42,123,fill=1,stroke=0);c.rect(350,458,118,123,fill=1,stroke=0);c.rect(104,458,364,28,fill=1,stroke=0)
    for x in [104,146,350,468]:g.line(x,458 if x in [104,468] else 486,x,607,BLUE,2)
    g.line(104,458,468,458,BLUE,2);g.line(146,486,350,486,BLUE,2)
    for x,w in [(101,48),(347,124)]:
        c.setFillColor(GRAY);c.roundRect(x,580,w,13,3,fill=1,stroke=0)
    g.arrow(125,648,125,603,ORANGE,3)
    g.arrow(409,603,409,648,ORANGE,3)
    g.text("F₁",139,623,11,True);g.text("F₂",423,623,11,True)
    g.centered("A₁",125,554,11,True);g.centered("A₂",409,554,11,True)
    g.line(80,580,491,580,TEAL,.8,[4,3])
    g.centered("Pistonlar aynı düzeyde",287,430,9,True,TEAL)
    g.panel("İdeal kuvvet ilişkisi", "<b>F₁/A₁ = F₂/A₂</b>. Örnek: A₁ = 0,002 m² ve F₁ = 100 N ise ΔP = 50 kPa. A₂ = 0,010 m² için çıkış kuvveti <b>F₂ = 500 N</b> olur.",402,106)
    g.panel("Kuvvet artar, yol azalır", "Sıkıştırılamaz sıvıda <b>A₁Δx₁ = A₂Δx₂</b>. Küçük piston 10 cm ilerlerse bu örnekte büyük piston 2 cm ilerler. İdeal düzende <b>iş ve enerji kazancı yoktur</b>.",276,106)
    g.note("Formül; aynı seviyede, sürtünmesiz ve piston ağırlıkları ihmal edilmiş denge için. Yükseklik, piston ağırlığı ve kayıplar varsa ayrıca hesaba katılır.",150,91)
    g.end()

    # 7: hydrostatic force and centroid condition.
    g.page("Sıvı basınç kuvveti", "Düz yüzeyler", "Basınç derinlikle artar; bütün duvar için taban basıncını kullanma.")
    g.beaker(84,456,162,190,162)
    g.line(246,456,246,618,NAVY,4)
    for i in range(1,7):
        yy=618-i*25
        g.arrow(252,yy,252+10+i*12,yy,BLUE,1.8,5)
    g.dimension(60,456,618,"h")
    g.text("0",336,615,9,True,BLUE);g.text("ρgh",352,461,10,True,BLUE)
    g.line(252,618,335,456,LINE,1,[3,3])
    g.para("Üstte daha küçük;<br/>altta daha büyük<br/>basınç.<br/><br/><b>Basınç kuvveti<br/>yüzeye diktir.</b>",407,592,126,10)
    g.panel("Genel düz yüzey", "Sabit yoğunluklu durgun sıvıda, yüzeye uygulanan hidrostatik katkı:<br/><b>F_g = ρg h_c A</b>. h_c, yüzeyin <b>alan ağırlık merkezinin</b> serbest yüzeyden düşey derinliğidir.",414,111)
    g.panel("Dikdörtgen duvar örneği", "Üst kenar serbest yüzeyde, alt kenar h derinliğindeyse h_c = h/2:<br/><b>P_ort,g = ρgh/2</b>, dolayısıyla <b>F_g = (ρgh/2) A</b>. Atmosfer iki tarafta aynıysa net kuvvette sadeleşir.",283,111)
    g.note("Kuvvetin etki noktası olan basınç merkezi, alan ağırlık merkeziyle aynı olmak zorunda değildir. Eğri yüzeylerde kuvvet yönleri de değişir.",152,88)
    g.end()

    # 8: hydrostatic paradox, true force vs weight.
    g.page("Kap şekli ve taban", "Hidrostatik paradoks", "Taban kuvveti ile sıvının ağırlığı aynı büyüklük değildir.")
    shapes=[(112,0),(297,28),(482,-24)]
    for center, flare in shapes:
        bottom,top,half=487,624,43
        pts=[(center-half,bottom),(center+half,bottom),(center+half+flare,top),(center-half-flare,top)]
        g.polygon(pts,colors.HexColor("#D5F0F6"),BLUE,1.6)
        g.line(center-half-flare,top,center+half+flare,top,TEAL,1)
        g.dimension(center+half+max(flare,0)+10,bottom,top,"h")
        g.centered("A_taban",center,465,8.5,True,TEAL)
    for x,equ in [(112,"F = G"),(297,"F < G"),(482,"F > G")]:
        g.centered(equ,x,432,18,True)
    g.centered("Dik yan yüzey",112,407,9,False,GRAY)
    g.centered("Yukarı genişleyen",297,407,9,False,GRAY)
    g.centered("Yukarı daralan",482,407,9,False,GRAY)
    g.panel("Aynı taban, aynı yükseklik", "Aynı sıvı ve aynı dış basınçta üç kapta taban basıncı eşittir:<br/><b>P_g = ρgh</b>. Taban alanları da eşitse <b>F_taban,g = ρgh A_taban</b> her kapta aynıdır.",375,110)
    g.panel("Fark nereden gelir?", "Sıvının ağırlığı <b>G = ρgV</b> hacme bağlıdır. Eğik yan duvarların sıvıya uyguladığı kuvvetin düşey bileşeni, F_taban ile G arasındaki farkı dengeler.",245,103)
    g.note("Karşılaştırmalar açık kaptaki hidrostatik kuvvet katkısı içindir. Kabın zemine uyguladığı toplam kuvvet, kap ve sıvının toplam ağırlığıyla ayrıca incelenir.",122,67)
    g.end()

    # 9: constant inflow rate graphs, axes explicit.
    g.page("Kap dolarken grafik", "Sabit hacimsel debi", "P-t grafiği ile P-h grafiğini birbirinden ayır.")
    for x,kind in [(64,0),(243,1),(423,2)]:
        cen=x+45
        flare=[0,18,-16][kind]
        g.polygon([(cen-28,546),(cen+28,546),(cen+28+flare,640),(cen-28-flare,640)],colors.HexColor("#C8EAF3"),BLUE,1.5)
        g.arrow(cen,677,cen,649,ORANGE,2.5)
        g.text("Q sabit",x+17,687,8,True,TEAL)
        g.axes(x,429,113,81,"t","P_g")
        p=c.beginPath();p.moveTo(x,429)
        if kind==0:p.lineTo(x+103,501)
        elif kind==1:p.curveTo(x+18,481,x+62,498,x+103,501)
        else:p.curveTo(x+51,432,x+83,457,x+103,501)
        c.setStrokeColor(TEAL);c.setLineWidth(2);c.drawPath(p)
        g.centered(["Sabit eğim","Azalan eğim","Artan eğim"][kind],x+51,393,9.5,True)
    g.panel("Grafiğin nedeni", "Çıkış yok, Q ve ρ sabitken <b>dh/dt = Q/A(h)</b>. Seviye yükseldikçe kesit genişliyorsa h daha yavaş; daralıyorsa daha hızlı artar. Taban gösterge basıncı <b>P_g(t) = ρgh(t)</b> aynı biçimde değişir.",366,118)
    g.panel("Derinlik grafiği farklıdır", "Yatay eksen h ise <b>P_g = ρgh doğrusal</b> olur; kabın biçimi eğriyi değiştirmez. Yatay eksen t olduğunda ise dolum hızı ve kesit değişimi önemlidir.",228,98)
    g.note("Boyun gibi sabit kesitli bir bölgeye geçilirse basınç-zaman eğimi o bölgede sabit olur. Değişken debi varsa buradaki üç eğriyi otomatik kullanma.",110,55)
    g.end()

    # 10: Torricelli with correct vertical height reference.
    g.page("Açık hava ve barometre", "Atmosfer", "Cıva sütunu, üst ve dış basınç farkıyla dengede kalır.")
    c.setFillColor(PALE);c.roundRect(80,450,228,42,8,fill=1,stroke=0)
    c.setFillColor(colors.HexColor("#A5B1BD"));c.rect(84,455,220,27,fill=1,stroke=0)
    c.setStrokeColor(BLUE);c.setLineWidth(2)
    tube=c.beginPath();tube.moveTo(163,455);tube.lineTo(163,643)
    tube.curveTo(163,666,197,666,197,643);tube.lineTo(197,455)
    c.drawPath(tube,fill=0,stroke=1)
    c.setFillColor(colors.HexColor("#A5B1BD"));c.rect(166,455,28,146,fill=1,stroke=0)
    g.line(166,601,194,601,NAVY,1.5)
    g.line(198,601,266,601,GRAY,.8,[3,3]);g.line(198,482,266,482,GRAY,.8,[3,3])
    g.dimension(250,482,601,"h")
    g.text("üstte düşük",83,638,9,True,TEAL);g.text("buhar basıncı",83,623,9,True,TEAL)
    for xx in [106,275]:g.arrow(xx,548,xx,495,ORANGE,2)
    g.text("P_atm",262,554,9,True,ORANGE)
    g.para("<b>İdeal denge:</b><br/>P_atm ≈ ρ_Hg g h<br/><br/>h, iki cıva seviyesi arasındaki <b>düşey</b> uzaklıktır.<br/><br/>Barometre açık hava basıncını ölçer.",357,627,185,10.5)
    g.panel("76 cm ne anlama gelir?", "Standart atmosfer <b>1 atm = 101 325 Pa</b> ve yaklaşık <b>760 mmHg</b>'dir. Deniz seviyesinde gerçek hava basıncı hava durumuna göre değişir; her ölçüm kesin 76 cm değildir.",407,109)
    g.panel("Magdeburg yarımküreleri", "17. yüzyıldaki gösterilerde içerdeki hava azaltıldığında dış basınç yarımküreleri bastırır. Onları bir arada tutan, dış ve iç basınç arasındaki farkın oluşturduğu kuvvettir.",278,105)
    g.note("Barometre bağıntısı üstteki gaz/buhar basıncı ve kılcallık etkileri ihmal edilerek yazılır. Çok ince tüpte bu düzeltmeler önem kazanabilir.",153,86)
    g.end()

    # 11: ideal gas, balloon caveat.
    g.page("Gazı hangi değer belirler?", "İdeal gaz modeli", "Mutlak basınç ve kelvin sıcaklığı kullan.")
    g.text("PV = nRT",MARGIN,648,32,True)
    for x,w,h in [(99,80,120),(350,160,120)]:
        c.setFillColor(PALE);c.setStrokeColor(TEAL);c.setLineWidth(2)
        c.roundRect(x,451,w,h,10,fill=1,stroke=1);g.gas_dots(x,451,w,h)
    g.arrow(224,513,315,513,ORANGE,2.8)
    g.centered("n ve T sabit",267,540,10,True,TEAL)
    g.centered("P₁V₁ = P₂V₂",267,480,11,True)
    g.centered("Aynı miktarda gaz; daha büyük hacim, daha küçük basınç",WIDTH/2,422,9.5,True,TEAL)
    g.panel("Denklemdeki büyüklükler", "P: <b>mutlak basınç</b>, V: hacim, n: mol sayısı, R: gaz sabiti,<br/>T: <b>kelvin cinsinden mutlak sıcaklık</b>. T(K) = t(°C) + 273,15. Basınç ve sıcaklık birimlerini dönüştürmeden oran kurma.",394,111)
    g.panel("Boyle koşulunu unutma", "Gaz miktarı ve sıcaklık sabitse <b>PV sabit</b> olur. Örneğin basınç 100 kPa'dan 200 kPa'a çıkarken hacim 2,0 L'den 1,0 L'ye iner. Bu örnekte basınçlar mutlak değerlerdir.",263,110)
    g.note("Esnek kapta iç ve dış basınç ancak zar gerilmesi gibi etkiler ihmal edilirse yaklaşık eşittir. Gerilmiş balon zarı, içerde daha büyük basınç gerektirebilir.",133,77)
    g.end()

    # 12: altitude, boiling and pressure instruments.
    g.page("Rakım ve kaynama", "Atmosferin günlük etkisi", "Dış basınç azalınca kaynama sıcaklığı da düşer.")
    g.polygon([(87,463),(267,651),(437,463)],colors.HexColor("#D5E1E5"),colors.HexColor("#9BB2BD"),1)
    g.polygon([(228,610),(267,651),(304,611),(282,618),(267,607),(253,622)],WHITE)
    g.line(65,461,483,461,TEAL,2)
    g.text("daha yüksek P_atm",85,439,10,True,TEAL)
    g.text("daha düşük P_atm",339,684,10,True,TEAL)
    for xx,yy in [(111,487),(419,625)]:
        c.setFillColor(colors.HexColor("#B4DDEA"));c.roundRect(xx,yy,55,24,4,fill=1,stroke=0)
        g.line(xx,yy+24,xx+55,yy+24,BLUE,2)
        for off in [12,27,42]:g.line(xx+off,yy+30,xx+off+3,yy+39,ORANGE,1)
    g.panel("Sıcaklık ile süreyi ayır", "Saf su yaklaşık 1 atm'de <b>100 °C</b>'de kaynar. Dış basınç azalınca daha düşük sıcaklıkta kaynar; dağda tek bir sabit kaynama sıcaklığı yoktur. Kaynamaya kadar geçen süre, ısıtma gücü ve su miktarına da bağlıdır.",402,125)
    g.panel("Neden pişirme uzayabilir?", "Açık kapta kaynayan su daha düşük sıcaklıkta kaldığında yemek daha yavaş pişebilir. Düdüklü tencere ise iç basıncı artırarak kaynama sıcaklığını yükseltir.",257,99)
    g.panel("Ölçüm araçları", "<b>Barometre:</b> atmosfer basıncı. <b>Manometre:</b> gaz basıncı / basınç farkı.<br/><b>Altimetre:</b> basınçtan yaklaşık yükseklik. <b>Derinlik ölçer:</b> sıvı basıncından derinlik.",138,82)
    g.end()

    # 13: true continuity and Bernoulli assumptions.
    g.page("Akışta hız ve basınç", "Bernoulli ve süreklilik", "Kesit, hız ve statik basınç ilişkisini koşullarıyla kullan.")
    low=[(66,530),(174,530),(233,554),(354,554),(419,530),(528,530)]
    upper=[(66,622),(174,622),(233,598),(354,598),(419,622),(528,622)]
    g.polygon(low+list(reversed(upper)),PALE,BLUE,1.8)
    for yy in [555,577,600]:
        g.arrow(76,yy,151,yy,TEAL,1.5)
    for yy in [564,577,590]:
        g.arrow(252,yy,337,yy,ORANGE,2.1)
    for yy in [555,577,600]:
        g.arrow(437,yy,512,yy,TEAL,1.5)
    for x,t in [(121,"geniş / daha yavaş"),(294,"dar / daha hızlı"),(473,"geniş / daha yavaş")]:g.centered(t,x,501,8.5,True)
    g.panel("Süreklilik", "Kararlı, sıkıştırılamaz akışta aynı akım tüpünde <b>A₁v₁ = A₂v₂</b>.<br/>Kesit daraldığında aynı hacimsel debiyi taşımak için hız büyür. Gazlarda yoğunluk değişiyorsa bu basit bağıntı doğrudan kullanılamaz.",462,111)
    g.panel("Enerji ilişkisi", "Kararlı, sıkıştırılamaz, kayıpsız akışta aynı akım çizgisinde:<br/><b>P + ½ρv² + ρgz = sabit</b>. Yatay akışta z sabitse hız artan noktada statik basınç azalır. Pompa, türbin veya kayıp varsa ek enerji terimleri gerekir.",331,125)
    g.note("Akış her noktada yüksek statik basınçtan düşüğe gitmek zorunda değildir. Genişleyen bölümde akış yavaşlarken statik basınç yeniden artabilir.",186,97)
    g.end()

    # 14: scientific applications, distinguish straw from Bernoulli.
    g.page("Örnekleri doğru yorumla", "Günlük yaşam", "Basınç farkı bir sonuçtur; onu oluşturan sistemi de açıkla.")
    # Wing illustration, no equal-transit arrows or path-length explanation.
    p=c.beginPath();p.moveTo(77,588);p.curveTo(114,642,242,614,292,571);p.curveTo(206,589,123,576,77,588)
    c.setFillColor(colors.HexColor("#E9A65D"));c.setStrokeColor(ORANGE);c.drawPath(p,fill=1,stroke=1)
    for yoff in [0,23]:
        p=c.beginPath();p.moveTo(62,633+yoff);p.curveTo(131,669+yoff,221,643+yoff,299,618+yoff)
        c.setStrokeColor(BLUE);c.setLineWidth(1.1);c.drawPath(p)
    g.arrow(180,543,180,584,TEAL,2.5)
    g.text("kaldırma",191,552,9,True,TEAL)
    g.beaker(383,530,102,103,67)
    g.line(437,551,450,649,NAVY,6);g.line(450,649,493,666,NAVY,6)
    g.arrow(393,646,393,609,ORANGE,2)
    g.text("P_atm",365,660,9,True,ORANGE)
    g.text("düşük iç basınç",401,687,8.5,True,TEAL)
    g.panel("Uçak kanadı / rüzgârlı çatı", "Kanadın çevresindeki basınç dağılımı ve havanın momentum değişimi kaldırmayla ilişkilidir. “Üstteki hava daha uzun yol gidip aynı anda yetişir” açıklaması yanlıştır. Çatıda da iç-dış basınç ve akış düzeni birlikte düşünülür.",489,128)
    g.panel("Pipet ve şırınga", "Pipetin üstünde ya da şırınga içinde basınç azaltılınca daha yüksek dış basınç sıvıyı iter. Temel açıklama <b>basınç farkıdır</b>; bu işlemleri yalnız Bernoulli ile açıklamak gerekmez.",341,113)
    g.panel("Üç hızlı kontrol", "<b>1.</b> Ölçülen basınç mutlak mı, gösterge mi?<br/><b>2.</b> Sıvı durgun mu, akış var mı?<br/><b>3.</b> Sıcaklık, gaz miktarı, debi ve kesit için hangi koşullar verilmiş?",208,103)
    g.end()

    # 15: concise formulas and primary-source links.
    g.page("Bir bakışta basınç", "Formül kartı ve kaynaklar", "Kısa formülün yanında kullanım koşulunu da hatırla.")
    rows=[
        ("Katı", "P_ort = F_dik / A", "Ortalama temas basıncı; dik kuvvet."),
        ("Durgun sıvı", "P = P_yüzey + ρgh", "Sabit yoğunluk; h düşey derinlik."),
        ("Hidrolik", "F₁/A₁ = F₂/A₂", "Aynı düzey, ideal pistonlar; iş kazancı yok."),
        ("Gaz", "PV = nRT", "P mutlak, T kelvin; ideal gaz modeli."),
        ("Boyle", "P₁V₁ = P₂V₂", "Aynı gaz miktarı ve sabit sıcaklık."),
        ("Akış", "A₁v₁ = A₂v₂", "Kararlı, sıkıştırılamaz; aynı akım tüpü."),
    ]
    for i,(name,eq,condition) in enumerate(rows):
        yy=664-i*57
        c.setFillColor(PALE if i%2==0 else colors.HexColor("#F4F8FA"));c.roundRect(MARGIN,yy-44,WIDTH-2*MARGIN,52,7,fill=1,stroke=0)
        g.text(name,MARGIN+12,yy-9,9,True,TEAL);g.text(eq,MARGIN+118,yy-9,11,True)
        g.text(condition,MARGIN+118,yy-29,8.2,False,GRAY)
    g.text("DOĞRULAMA KAYNAKLARI",MARGIN,296,9,True,TEAL)
    g.para("Aşağıdaki bağlantılar ilgili fizik ilkelerinin birincil eğitim kaynaklarıdır. Bu rehberin metni ve çizimleri İvme için yeniden hazırlanmıştır.",MARGIN,280,WIDTH-2*MARGIN,8.5)
    sources=[
        ("OpenStax / Hidrostatik ve basınç kuvveti", "openstax.org / College Physics 2e, 11.4", "https://openstax.org/books/college-physics-2e/pages/11-4-variation-of-pressure-with-depth-in-a-fluid"),
        ("OpenStax / Pascal ilkesi ve hidrolik", "openstax.org / College Physics, 11.5", "https://openstax.org/books/college-physics/pages/11-5-pascals-principle"),
        ("OpenStax / Basınç ölçümü ve barometre", "openstax.org / University Physics 1, 14.2", "https://openstax.org/books/university-physics-volume-1/pages/14-2-measuring-pressure"),
        ("OpenStax / İdeal gaz denklemi", "College Physics 2e / 13.3", "https://openstax.org/books/college-physics-2e/pages/13-3-the-ideal-gas-law"),
        ("OpenStax / Yüzey gerilimi ve balon basıncı", "College Physics 2e / 11.8", "https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action"),
        ("NASA Glenn / Bernoulli: koşullar ve enerji", "grc.nasa.gov / Bernoulli's Equation", "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation/"),
        ("NASA Glenn / Kanat kaldırması", "grc.nasa.gov / Bernoulli and Newton", "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoulli-and-newton/"),
    ]
    for i,(title,short,url) in enumerate(sources):
        yy=245-i*25
        g.text(title,MARGIN+2,yy,8.3,True,INK)
        g.text(short,MARGIN+2,yy-11,7.6,False,GRAY)
        c.linkURL(url,(MARGIN,yy-14,WIDTH-MARGIN,yy+10),relative=0,thickness=0)
    g.text("Kaynaklar 15 Ekim 2026 tarihinde doğrulandı. / Soru bankası bu rehbere dahil değildir.",MARGIN,57,6.9,False,GRAY)
    g.end()
    g.save()


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output",type=Path,default=ROOT/"imports/pressure-learning-media/prepared/Basinc_ve_Kuvvet_Ders_Rehberi.pdf")
    parser.add_argument("--font-dir",default=None)
    args=parser.parse_args()
    register_fonts(args.font_dir)
    build(args.output)
    print(f"Built {TOTAL} reviewed vector pages: {args.output}")
