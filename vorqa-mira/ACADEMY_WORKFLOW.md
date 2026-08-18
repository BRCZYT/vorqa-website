# MIRA — Academy-First Workflow

MIRA'nın birincil görevi sosyal medya postu üretmek değil, VORQA Academy için kalıcı ve aranabilir bilgi içeriği üretmektir.

## Ana akış

1. Konu / primary keyword seçimi
2. `/api/mira-academy` ile article brief + Academy draft üretimi
3. İnsan review / edit
4. İnsan onayı
5. Academy yayını
6. Yayın URL'sinden LinkedIn / Instagram / Facebook türevleri
7. Performans ölçümü
8. Sonuçların sonraki konu seçimlerine geri beslenmesi

## Approval gate

Academy üretimi varsayılan olarak:

- `status: DRAFT`
- `human_approved: false`
- `publish_allowed: false`
- `social_adaptation_allowed: false`

İnsan onayı olmadan içerik yayınlanmaz ve sosyal medya dağıtım zincirine girmez.

## Üretilen paket

MIRA Academy endpoint'i şu alanları üretir:

- title
- slug
- meta title
- meta description
- primary keyword
- search intent
- target audience
- article brief
- outline
- markdown article draft
- FAQ
- internal link suggestions
- post-publication social derivative hooks
- review flags

## İçerik prensibi

Amaç içerik hacmi değil; VORQA'nın satın alma, teknik tedarik ve proje tedariki uzmanlığını gösteren, SEO değeri taşıyan, tekrar kullanılabilir ve güvenilir içerik üretmektir.

Academy ana kaynak kabul edilir. Sosyal medya, Academy içeriğinin dağıtım katmanıdır.

## Ölçüm

İlk aşamada izlenecek minimum metrikler:

- organic search impressions / clicks
- Academy page visits
- engaged visits
- LinkedIn reach / engagement
- contact form / WhatsApp / RFQ source
- qualified lead count

Otomasyon yalnızca tekrar eden iş yükü ve içerik hacmi bunu gerektirdiğinde artırılır.
