# Industry pages: source and publication notes

The only editorial sources are these Google Drive Word documents, read on 2026-10-16:

| Sector | Source document | Drive ID |
| --- | --- | --- |
| Concrete | VORQA_Beton_Santralleri_Kurumsal_Metin.docx | 1iI9YSjJD9eBhdi1UDEVuhDbM9LgOK9XB |
| Galvanizing | VORQA_Galvaniz_Tesisi_Kurumsal_Metin (1).docx | 1q0Nhlu-Hfk57PM7lQYJLHASMUw4EVvBY |
| Asphalt | VORQA_Asfalt_Plenti_Kurumsal_Metin.docx | 1hpT9xLKF5CWiuL2HoWhXOll6MQzUC2s6 |
| Crushing | VORQA_Kirma_Eleme_Tesisleri_Kurumsal_Metin (1).docx | 10ekiUz_4HSDmKhH19wiOMw5iVTvp9u9y |
| Energy | VORQA_Petrol_Çözümleri_Kurumsal_Metin.docx | 177QnoI6we1ZcefeW_lkOo-tEsH0Fc4be |

The six homepage cards share one ordered list in `industry-content.mjs`. Five sectors have three static localized detail pages each. Arabic retains the same DOM order and reads from the right. The sixth card, Waste-to-Energy, retains the contact destination: its source folder 1SG68GvAx5XV0_kW1oGXOkV9Qn0GwmU5f was empty. There is no new waste detail page or indexed placeholder.

Editorial boundaries: no added performance guarantees, certifications, customer references, production claims or savings figures. Source project/contract qualifiers remain in all languages. Galva Pro cooperation remains intended rather than established. The asphalt source's 30–400 t/h range retains its stationary batch/project-verification qualification. FAQs summarize visible source-derived content. Schema describes WebPage, Service, BreadcrumbList and FAQPage; no review/rating or Product offer markup is used. Structured data does not guarantee a rich result.

Regenerate with `node build-locale-pages.mjs` (existing Cheerio dependency), or regenerate just details/sitemap with `node build-industry-pages.mjs`. Generated HTML is committed; production needs no new build runtime. `sitemap-industries.xml` is registered in robots.txt. Production canonical URLs use the existing www.vorqaglobal.com host; each page lists TR/EN/AR and English x-default reciprocally.

Asset provenance:

- `images/industries/concrete.webp`: optimized from Drive image 10gCHXZa5wLbz3nHoAenloSZwOkm_ZS18 in the concrete source folder.
- `images/industries/crushing.webp`: optimized from Drive image 1AAK032rG9H6HdZ5oqAR5upkJema01DPc in the crushing source folder.
- `images/industries/asphalt.webp`: existing publication-ready WebP from Drive ZIP 1Aygt0Zg5LLYCrOtReuXJzTV87IeB2rAt, `webp/asphalt-plant-mixers/asphalt-plant-mixers-view-080.webp`. Metadata CSV 168Q2P_yFGMR8g0zv_soTmSX1TEefbcmh identifies the mixer body and access platform, ready for publication with no visible branding detected. No branding removal was performed.
- Concrete and crushing homepage cards retain their original plant photographs; the new Drive equipment images appear on their detail pages.
- Galvanizing uses the repository's existing `images/galvaniz/galvaniz1.jpg`.
- Energy source folder contains only the Word file: the existing `srv-enerji-light.svg` is explicitly captioned as an illustration.
- Waste retains its existing repository photograph and contact behavior.
- Photos are described as sector equipment, never as proof of a VORQA-delivered project.

Source files' editorial placement suggestions and pre-publication checklists are not copied into customer-facing pages. Main must not be merged as part of this task.
