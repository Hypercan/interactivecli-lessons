// ─── TERMINAL & KOMUT SATIRI KURSU ──────────────
const terminalCourse = {
    id: 'terminal',
    title: 'Terminal & Komut Satırı',
    icon: '⌨️',
    color: '#39ff14',
    bgGradient: 'linear-gradient(135deg, #0a2e0a 0%, #0f1425 100%)',
    description: 'Komut satırının temellerini öğren! pwd, ls, cd, mkdir ve clear komutlarıyla terminali fethet.',
    difficulty: 'Başlangıç',
    lessonCount: 6,
    status: 'active',
    hasTerminal: true,

    fileSystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'ogrenci': {
                            type: 'dir',
                            children: {
                                'belgeler': {
                                    type: 'dir',
                                    children: {
                                        'odevler.txt': { type: 'file' },
                                        'notlar.txt': { type: 'file' }
                                    }
                                },
                                'resimler': {
                                    type: 'dir',
                                    children: {
                                        'tatil.jpg': { type: 'file' },
                                        'selfie.png': { type: 'file' }
                                    }
                                },
                                'muzik': { type: 'dir', children: {} },
                                'projeler': {
                                    type: 'dir',
                                    children: {
                                        'web-sitesi': {
                                            type: 'dir',
                                            children: {
                                                'index.html': { type: 'file' },
                                                'style.css': { type: 'file' }
                                            }
                                        }
                                    }
                                },
                                'gizli_dosya.txt': { type: 'file' },
                                'hosgeldin.txt': { type: 'file' }
                            }
                        }
                    }
                }
            }
        }
    },

    fakeFileContents: {
        'hosgeldin.txt': 'Merhaba! interaktifPC\'ye hoş geldin! 🎮\nBurada komut satırının temellerini öğreneceksin.',
        'odevler.txt': '📝 Yapılacaklar:\n1. Matematik ödevi\n2. Türkçe kompozisyon\n3. Terminal öğren! ✅',
        'notlar.txt': '📓 Ders Notları:\n- Bilgisayar bilimi çok eğlenceli!\n- Terminal = Süper güç 💪',
        'gizli_dosya.txt': '🔐 Tebrikler! Gizli dosyayı buldun!\nBu dosyayı sadece gerçek hackerlar bulabilir. 😎',
    },

    lessons: [
        {
            chapter: 'BÖLÜM 1',
            title: '🗺️ Neredesin? (pwd)',
            narrative: `
                <p>Bir terminali ilk açtığında, kendini karanlık bir ekranın karşısında bulursun. Tıpkı bir oyunda yeni bir dünyaya ışınlanmak gibi! 🎮</p>
                <p>İlk yapman gereken şey: <strong>nerede olduğunu bulmak.</strong></p>
                <p><code>pwd</code> komutu "Print Working Directory" yani <strong>"Çalışma Dizinini Yazdır"</strong> demek. Sana o an hangi klasörde olduğunu söyler.</p>
            `,
            mission: 'Terminale <code>pwd</code> yaz ve Enter\'a bas. Hangi klasördesin, öğren!',
            commandInfo: `
                <code>pwd</code> = Print Working Directory (Çalışma Dizinini Yazdır)
                <span class="cmd-syntax">$ pwd</span>
                Bu komut sana o an bilgisayarın dosya sisteminde nerede olduğunu gösterir. GPS gibi düşün! 📍
            `,
            check: (cmd) => cmd.trim().toLowerCase() === 'pwd',
            hint: 'Terminale sadece <strong>pwd</strong> yazıp Enter\'a bas. Hepsi bu kadar!',
            successMsg: 'Harika! 🎉 Şu an /home/ogrenci klasöründesin. Bu senin "ev" klasörün — tüm dosyaların burada!',
            xpReward: 50,
            setupCwd: '/home/ogrenci'
        },
        {
            chapter: 'BÖLÜM 2',
            title: '👀 Etrafına Bak! (ls)',
            narrative: `
                <p>Artık nerede olduğunu biliyorsun. Ama etrafında neler var? Hangi dosya ve klasörler seni bekliyor? 🤔</p>
                <p><code>ls</code> komutu "List" yani <strong>"Listele"</strong> demek. Bulunduğun klasördeki tüm dosya ve alt klasörleri gösterir.</p>
                <p>Bir odaya girdiğinde etrafına bakmak gibi düşün! 👁️</p>
            `,
            mission: 'Terminale <code>ls</code> yaz ve etrafındaki dosyaları keşfet!',
            commandInfo: `
                <code>ls</code> = List (Listele)
                <span class="cmd-syntax">$ ls</span>
                Bulunduğun klasördeki tüm dosya ve klasörleri listeler. 📁 ile başlayanlar klasör, 📄 ile başlayanlar dosyadır.
            `,
            check: (cmd) => cmd.trim().toLowerCase() === 'ls',
            hint: 'Terminale <strong>ls</strong> yaz ve Enter\'a bas. Klasördeki dosyaları göreceksin!',
            successMsg: 'Süper! 🌟 Gördün mü? Belgeler, resimler, müzik, projeler klasörlerin ve bazı dosyaların var. Bir hacker gibi keşfediyorsun!',
            xpReward: 50,
            setupCwd: '/home/ogrenci'
        },
        {
            chapter: 'BÖLÜM 3',
            title: '🚶 Klasör Değiştir (cd)',
            narrative: `
                <p>Etrafını gördün, şimdi hareket etme zamanı! Bir klasörün içine girmek istiyorsan <code>cd</code> komutunu kullanırsın. 🚪</p>
                <p><code>cd</code> = "Change Directory" yani <strong>"Dizin Değiştir"</strong> demek.</p>
                <p>Örneğin <code>cd belgeler</code> yazarsan, "belgeler" klasörünün içine girersin.</p>
            `,
            mission: '<code>belgeler</code> klasörüne gir! Terminale <code>cd belgeler</code> yaz.',
            commandInfo: `
                <code>cd</code> = Change Directory (Dizin Değiştir)
                <span class="cmd-syntax">$ cd klasor_adi</span>
                Bir klasörün içine girmek için kullanılır. Geri çıkmak için <code>cd ..</code> kullanabilirsin.
            `,
            check: (cmd) => cmd.trim().toLowerCase() === 'cd belgeler',
            hint: 'Terminale <strong>cd belgeler</strong> yaz (cd ile belgeler arasında boşluk var!). Sonra <strong>pwd</strong> ile kontrol edebilirsin.',
            successMsg: 'Tamam! 🚀 "belgeler" klasörüne girdin! Artık cd komutuyla istediğin yere gidebilirsin.',
            xpReward: 75,
            setupCwd: '/home/ogrenci'
        },
        {
            chapter: 'BÖLÜM 4',
            title: '🏗️ Klasör Oluştur (mkdir)',
            narrative: `
                <p>Şimdi gerçek bir yaratıcı ol! Kendi klasörünü oluşturma zamanı geldi. 🎨</p>
                <p><code>mkdir</code> = "Make Directory" yani <strong>"Dizin Oluştur"</strong> demek.</p>
                <p>Yeni bir proje başlatmak istiyorsan, önce onun için bir klasör oluşturmalısın!</p>
            `,
            mission: '"oyunlar" adında yeni bir klasör oluştur! Terminale <code>mkdir oyunlar</code> yaz.',
            commandInfo: `
                <code>mkdir</code> = Make Directory (Dizin Oluştur)
                <span class="cmd-syntax">$ mkdir klasor_adi</span>
                Yeni bir boş klasör oluşturur. Klasör adında boşluk kullanmaktan kaçın!
            `,
            check: (cmd) => cmd.trim().toLowerCase() === 'mkdir oyunlar',
            hint: 'Terminale <strong>mkdir oyunlar</strong> yaz. mkdir ile oyunlar arasında boşluk olmalı!',
            successMsg: 'Müthiş! 🏗️ "oyunlar" klasörünü oluşturdun! ls yazarak kontrol edebilirsin.',
            xpReward: 75,
            setupCwd: '/home/ogrenci'
        },
        {
            chapter: 'BÖLÜM 5',
            title: '🧹 Ekranı Temizle (clear)',
            narrative: `
                <p>Terminalde çok fazla yazı biriktiğinde ekran karışabilir. Endişelenme! 😅</p>
                <p><code>clear</code> komutu ekranı tertemiz yapar. Tıpkı bir tahtayı silmek gibi!</p>
                <p>Not: clear komutu sadece ekranı temizler, dosyalarına dokunmaz. Her şey güvende! 🔒</p>
            `,
            mission: 'Terminali temizle! <code>clear</code> komutunu yaz.',
            commandInfo: `
                <code>clear</code> = Temizle
                <span class="cmd-syntax">$ clear</span>
                Terminal ekranındaki tüm yazıları siler ve temiz bir ekranla başlaman sağlar.
            `,
            check: (cmd) => cmd.trim().toLowerCase() === 'clear',
            hint: 'Terminale sadece <strong>clear</strong> yaz ve Enter\'a bas!',
            successMsg: 'Temiz ekran, temiz zihin! 🧹✨ clear komutu en çok kullanacağın komutlardan biri olacak!',
            xpReward: 50,
            setupCwd: '/home/ogrenci'
        },
        {
            chapter: 'FİNAL GÖREVİ',
            title: '🏆 Büyük Macera!',
            narrative: `
                <p>Tüm temel komutları öğrendin! Şimdi hepsini bir arada kullanma zamanı. 💪</p>
                <p>Sana bir görev veriyorum: <strong>projeler</strong> klasörüne gir ve orada neler olduğunu keşfet!</p>
                <p>İpucu: Önce <code>cd</code> ile klasöre gir, sonra <code>ls</code> ile içindekilere bak!</p>
            `,
            mission: 'Önce ana klasöre dön (<code>cd ~</code>), sonra <code>projeler</code> klasörüne git ve <code>ls</code> ile içindekilere bak! Sırayla: <code>cd ~</code> → <code>cd projeler</code> → <code>ls</code>',
            commandInfo: `
                Birden fazla komutu sırayla kullanabilirsin!
                <span class="cmd-syntax">$ cd ~        (ev klasörüne dön)</span>
                <span class="cmd-syntax">$ cd projeler (projeler klasörüne gir)</span>
                <span class="cmd-syntax">$ ls          (içindekileri listele)</span>
            `,
            check: null,
            subSteps: [
                { check: (cmd) => cmd.trim() === 'cd ~' || cmd.trim() === 'cd', stepMsg: '✓ Ev klasörüne döndün! Şimdi "cd projeler" yaz.' },
                { check: (cmd) => cmd.trim().toLowerCase() === 'cd projeler', stepMsg: '✓ Projeler klasörüne girdin! Şimdi "ls" yaz.' },
                { check: (cmd) => cmd.trim().toLowerCase() === 'ls', stepMsg: null }
            ],
            currentSubStep: 0,
            hint: 'Sırayla yap: Önce <strong>cd ~</strong> (ev klasörüne dön), sonra <strong>cd projeler</strong>, sonra <strong>ls</strong>.',
            successMsg: 'EFSANE! 🏆🎮 Tüm komutları ustaca kullandın! Artık terminali fetheden bir yazılımcısın!',
            xpReward: 100,
            setupCwd: '/home/ogrenci/belgeler'
        }
    ]
};
