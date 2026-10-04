"""Create a readable, fictional workshop PDF for the compression comparison.
Optional authoring dependency: reportlab. Not required for building the website.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
pdfmetrics.registerFont(TTFont('SampleKorean', str(root / 'extension/fonts/NanumMyeongjo-Bold.ttf')))
out = root / 'web/examples/unoptimized.pdf'
W, H = 420, 595
c = canvas.Canvas(str(out), pagesize=(W, H), pageCompression=0, invariant=1)
c.setTitle('워크숍 준비 계획 - Paper Switch 예시 문서')
c.setAuthor('Paper Switch')
INK, GREEN, LIGHT, LINE = '#263c31', '#28684f', '#edf3ee', '#dce5dd'
def text(x, top, value, size=12, color=INK):
    c.setFillColor(color); c.setFont('SampleKorean', size); c.drawString(x, H-top, value)
def rect(x, top, width, height, color):
    c.setFillColor(color); c.rect(x, H-top-height, width, height, fill=1, stroke=0)
def base(number, title, subtitle):
    rect(0, 0, W, 8, GREEN)
    text(32, 43, 'PAPER SWITCH / 예시 문서', 10, GREEN)
    text(32, 86, title, 26)
    text(32, 111, subtitle, 11, '#6b786f')
    rect(32, 548, 356, 1, LINE)
    text(32, 569, '가상의 행사로 만든 변환 비교용 문서입니다.', 9, '#6b786f')
    text(365, 569, f'{number} / 3', 9, '#6b786f')
def table(top, labels, rows, widths):
    x = 32
    rect(32, top, 356, 32, GREEN)
    for label, width in zip(labels, widths): text(x+12, top+21, label, 11, '#ffffff'); x += width
    for i, row in enumerate(rows):
        y = top+32+i*40
        if i % 2 == 0: rect(32, y, 356, 40, LIGHT)
        rect(32, y+39, 356, 1, LINE); x=32
        for value, width in zip(row, widths): text(x+12, y+25, value, 12); x += width
base(1, '워크숍 준비 계획', '하루 일정과 준비물을 한 문서로 정리했습니다.')
table(140, ['시간', '일정'], [('10:00','참가자 안내'),('10:30','주제 발표'),('12:00','점심 및 휴식'),('13:00','조별 활동')], [96,260])
text(32, 389, '진행 전 확인', 16)
for i, s in enumerate(['발표 자료를 미리 내려받습니다.','안내문은 입구에 한 장씩 비치합니다.','행사 후에는 준비물을 함께 정리합니다.']): text(32, 423+i*25, s, 12)
c.showPage()
base(2, '준비물 확인', '현장에서 필요한 물품을 수량별로 확인합니다.')
table(140, ['준비물','수량','용도'], [('명찰','12개','참가자 안내'),('필기구','12개','활동 기록'),('안내문','12장','일정 확인'),('멀티탭','2개','기기 연결')], [126,74,156])
text(32, 389, '담당자 메모', 16)
for i,s in enumerate(['명찰에는 이름을 적을 공간을 남깁니다.','필기구는 여분을 따로 준비합니다.','전선은 통행을 방해하지 않게 정리합니다.']):text(32,423+i*25,s,12)
c.showPage()
base(3,'예산 확인','가상의 금액으로 작성한 비용 정리 예시입니다.')
table(140,['항목','계산','금액'],[('다과','12명 기준','36,000원'),('인쇄','12부 기준','12,000원'),('소모품','일괄 준비','20,000원'),('합계','','68,000원')],[108,128,120])
text(32,389,'정산할 때',16)
for i,s in enumerate(['실제 사용한 금액과 영수증을 확인합니다.','남은 물품은 수량을 기록해 보관합니다.','다음 행사에 필요한 내용을 덧붙입니다.']):text(32,423+i*25,s,12)
c.save()
print(out)
