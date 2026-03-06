# 💻 interaktifPC

**Bilgisayar ve programlama temellerini Türkçe olarak, interaktif derslerle öğren!**

interaktifPC, ortaokul ve lise öğrencilerine yönelik, tamamen Türkçe, oyunlaştırılmış bir öğrenme platformudur. Retro 8-bit hacker temasıyla, öğrenciler terminalde gerçekten komut yazarak, anında geri bildirim alarak ve XP kazanarak öğrenir.

> 🎮 [codedex.io](https://codedex.io) tarzından ilham alınmıştır.

---

## 🖼️ Ekran Görüntüleri

### Ana Sayfa (Dashboard)

Kurs kartlarıyla öğrenme yollarını keşfet:

![Dashboard Görünümü](docs/dashboard.png)

### Ders Görünümü

Sol panelde ders anlatımı, sağ panelde interaktif terminal:

![Ders Görünümü](docs/lesson.png)

---

## ✨ Özellikler

| Özellik                     | Açıklama                                                           |
| --------------------------- | ------------------------------------------------------------------ |
| 🖥️ **Fake Terminal**        | Gerçekçi terminal simülatörü — komut yaz, Enter'a bas, çıktıyı gör |
| 📚 **Çoklu Kurs Yapısı**    | Her konu ayrı bir öğrenme yolu, modüler yapıda                     |
| 🎯 **Adım Adım Görevler**   | Her ders bir hikâye ve görevle ilerler                             |
| ✅ **Anında Geri Bildirim** | Doğru komut → yeşil başarı, yanlış → ipucu ve hata mesajı          |
| ⭐ **XP & İlerleme**        | Puan kazanma sistemi ve progress bar ile motivasyon                |
| 🧭 **Sidebar Navigasyon**   | Ders listesi, tamamlanan dersler ve ana sayfaya dönüş              |
| 🏆 **Tamamlama Ödülü**      | Kurs bittiğinde kutlama ekranı ve istatistikler                    |
| 📱 **Responsive Tasarım**   | Mobil ve tablet uyumlu arayüz                                      |

---

## 📂 Proje Yapısı

```
interactivecli-lessons/
├── index.html          # Ana HTML dosyası (Dashboard + Ders görünümleri)
├── style.css           # Retro 8-bit karanlık tema stilleri
├── script.js           # Uygulama motoru (router, terminal, ders yönetimi)
├── courses/            # Kurs modülleri
│   ├── terminal.js     # ⌨️ Terminal & Komut Satırı (aktif — 6 ders)
│   ├── bilgisayar.js   # 🖥️ Bilgisayar Temelleri (yakında)
│   └── python.js       # 🐍 Python'a Giriş (yakında)
└── README.md
```

---

## 🚀 Kurulum & Çalıştırma

Herhangi bir bağımlılık veya `npm install` gerekmez! Sadece bir statik dosya sunucusu yeterlidir.

```bash
# Projeyi klonla
git clone <repo-url>
cd interactivecli-lessons

# Basit bir HTTP sunucu başlat
python3 -m http.server 8080

# Tarayıcıda aç
# http://localhost:8080
```

Alternatif olarak VS Code'un **Live Server** eklentisini veya herhangi bir statik dosya sunucusunu kullanabilirsiniz.

---

## 📖 Mevcut Kurslar

### ⌨️ Terminal & Komut Satırı `AKTİF`

Komut satırının temellerini 6 interaktif derste öğren:

| #   | Ders               | Öğretilen Komut | XP  |
| --- | ------------------ | --------------- | --- |
| 1   | 🗺️ Neredesin?      | `pwd`           | 50  |
| 2   | 👀 Etrafına Bak!   | `ls`            | 50  |
| 3   | 🚶 Klasör Değiştir | `cd`            | 75  |
| 4   | 🏗️ Klasör Oluştur  | `mkdir`         | 75  |
| 5   | 🧹 Ekranı Temizle  | `clear`         | 50  |
| 6   | 🏆 Büyük Macera!   | Hepsi birlikte  | 100 |

**Bonus komutlar:** `cat`, `whoami`, `echo`, `date`, `help`

### 🖥️ Bilgisayar Temelleri `YAKINDA`

### 🐍 Python'a Giriş `YAKINDA`

---

## ➕ Yeni Kurs Ekleme

Platforma yeni bir kurs eklemek çok kolaydır:

**1.** `courses/` klasöründe yeni bir `.js` dosyası oluşturun:

```javascript
const yeniKurs = {
  id: "kurs-id",
  title: "Kurs Başlığı",
  icon: "🎨",
  color: "#ff6b6b",
  bgGradient: "linear-gradient(135deg, #2e0a0a 0%, #0f1425 100%)",
  description: "Kurs açıklaması...",
  difficulty: "Başlangıç",
  lessonCount: 3,
  status: "active", // 'active' veya 'coming_soon'
  hasTerminal: true, // Terminal paneli gösterilsin mi?
  lessons: [
    {
      chapter: "BÖLÜM 1",
      title: "🎯 Ders Başlığı",
      narrative: "<p>Ders anlatımı...</p>",
      mission: "Görev açıklaması...",
      commandInfo: "Komut bilgisi...",
      check: (cmd) => cmd.trim() === "beklenen_komut",
      hint: "İpucu metni...",
      successMsg: "Tebrik mesajı!",
      xpReward: 50,
      setupCwd: "/home/ogrenci",
    },
    // ... diğer dersler
  ],
};
```

**2.** `index.html`'e script etiketini ekleyin:

```html
<script src="courses/yeni-kurs.js"></script>
```

**3.** `script.js`'deki `allCourses` dizisine ekleyin:

```javascript
const allCourses = [terminalCourse, bilgisayarCourse, pythonCourse, yeniKurs];
```

---

## 🛠️ Kullanılan Teknolojiler

- **HTML5** — Semantik yapı
- **CSS3** — Retro 8-bit karanlık tema, neon efektler, scanline overlay
- **Vanilla JavaScript** — Terminal simülatörü, sanal dosya sistemi, ders motoru
- **Google Fonts** — Press Start 2P (piksel yazı), Fira Code (terminal), Inter (gövde)

> ⚡ Sıfır bağımlılık. Framework yok. Sadece saf HTML, CSS ve JavaScript.

---

## 🎨 Tema & Tasarım

- 🌙 **Karanlık mod** ağırlıklı hacker/yazılımcı teması
- 💚 **Neon renkler**: Yeşil, Cyan, Magenta, Sarı aksan renkleri
- 📺 **Scanline efekti** ile retro CRT monitör hissi
- ✨ **Animasyonlar**: Yanıp sönen cursor, parlayan başarı mesajları, XP bounce
- 🎮 **8-bit tipografi**: Press Start 2P font ailesi

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

<p align="center">
  <b>💻 interaktifPC ile öğrenmeye başla!</b><br>
  <i>Kod yazmak hiç bu kadar eğlenceli olmamıştı.</i> 🚀
</p>
