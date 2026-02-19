# Agent Skills & Workflow Orchestration

## Core Principles
- **Simplicity First**: Her değişikliği mümkün olduğunca basit tut. Minimum kodla maksimum etki yarat.
- **No Laziness**: Kök nedenleri bul. Geçici çözümlerden kaçın. Kıdemli geliştirici standartlarını uygula.
- **Minimal Impact**: Değişiklikler sadece gerekli olana dokunmalı. Yeni bug'lar eklemekten kaçın.

## Workflow Orchestration Rules

### 1. Plan Mode Default
- 3 adımdan fazla sürecek veya mimari karar gerektiren HER görev için önce **PLAN MODU**'na gir.
- İşler ters giderse derhal DUR ve planı güncelle; körü körüne devam etme.
- Plan modunu sadece inşa etmek için değil, doğrulama (verification) adımları için de kullan.
- Belirsizliği azaltmak için başlangıçta detaylı spesifikasyonlar yaz.

### 2. Subagent Strategy
- Ana context penceresini temiz tutmak için alt asistanları (subagents) cömertçe kullan.
- Araştırma, keşif ve paralel analiz işlerini alt asistanlara devret.
- Karmaşık problemler için alt asistanlar aracılığıyla daha fazla işlem gücü kullan.
- Odaklanmış yürütme için her alt asistana tek bir görev ver.

### 3. Verification Before Done
- Çalıştığını kanıtlamadan hiçbir görevi "tamamlandı" olarak işaretleme.
- Mevcut davranış ile yaptığın değişiklikler arasındaki farkları (diff) analiz et.
- Kendine sor: "Kıdemli bir mühendis (Staff Engineer) buna onay verir miydi?"
- Testleri çalıştır, logları kontrol et ve doğruluğu kanıtla.

### 4. Demand Elegance (Balanced)
- Basit olmayan değişiklikler için dur ve sor: "Daha zarif (elegant) bir yol var mı?"
- Eğer çözüm "yamalı" (hacky) hissettiriyorsa: Mevcut bilgilerini kullanarak en zarif çözümü uygula.
- Basit ve bariz düzeltmelerde aşırı mühendislikten (over-engineer) kaçın.
- Çalışmanı sunmadan önce kendi çözümüne meydan oku.

### 5. Autonomous Bug Fixing
- Bir hata raporu verildiğinde doğrudan düzeltmeye odaklan; sürekli onay bekleme.
- Loglara, hatalara ve başarısız testlere bakarak çözüme git.
- Kullanıcının sürekli context switching yapmasına gerek kalmadan sorunu çöz.
- CI testleri başarısız olduğunda talimat beklemeden düzelt.