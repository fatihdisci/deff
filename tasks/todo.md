# Proje Görev Yönetimi

## Mevcut Görev: Dinamik Puanlama ve UI İyileştirmesi

### 1. Önce Planla
- [x] Puan hesaplama formülünü (Bütünlük Puanı: 100 Başla, Hata Yaparsan Düş) revize et.
- [x] "Sadece girilen veriler hesaplamaya katılsın" mantığını kurgula.
- [x] UI: Prompt yerine Inline Input tasarımına geçiş yap.
- [x] UI: Hedefleri Aktif/Pasif yapabilme özelliği ekle.

### 2. Uygulama Süreci
- [x] `goals-manager.js`: `isActive` özelliği eklendi.
- [x] `progress-manager.js`: Yeni puanlama algoritması (100 Start, Dynamic Weighting) kodlandı.
- [x] `goalssetup.html`: Checkbox'lar eklendi ve kaydetme mantığı güncellendi.
- [x] `dashboard.html`: İnline input ve pasif kart gizleme özelliği eklendi.

### 3. Doğrulama & İnceleme
- [ ] "Veri girilmedikçe puan 100 kalmalı" kuralını test et (Manuel).
- [ ] "Ekran Süresi limiti aşılınca puan düşmeli" kuralını test et (Manuel).
- [ ] Pasif yapılan hedeflerin dashboard'da gizlendiğini doğrula (Manuel).

## Sonuçları Belgele
*Bu bölüm her görev sonunda güncellenmelidir.*
- **Özet**: Dinamik puanlama motoru ve gelişmiş UI etkileşimleri tamamlandı. Kullanıcı artık hedeflerini yönetebilir, satır içi veri girebilir ve anlık "Integrity Score" değişimini izleyebilir.
- **Etkilenenler**: `goals-manager.js`, `progress-manager.js`, `goalssetup.html`, `dashboard.html`