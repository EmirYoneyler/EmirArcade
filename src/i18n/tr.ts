/**
 * Turkish copy. Only the words change — ids, links, media and stacks come
 * from data/content.ts, so add a project there first, then its text here.
 */
import type { byteLines as enByteLines, cv as enCv } from '../data/content'
import type { SecretId } from '../data/secrets'

export const about = {
  title: 'Yazılım Mühendisi',
  location: 'İstanbul, Türkiye',
  summary:
    "İstanbul Aydın Üniversitesi'nde Bilgisayar Mühendisliği öğrencisiyim. Java/Spring Boot ve Go ile backend, React ve Python ile full-stack ürünler geliştiriyorum. Şu an bir yapay zekâ fotoğraf kabini projesinde stajyerim, yanında freelance web projeleri yapıyorum.",
}

type ProjectText = {
  pitch: string
  role: string
  about: string
  highlights: string[]
  caseStudy: { problem: string; approach: string; outcome: string }
  /** link labels by href (only the ones that need translating) */
  linkLabels?: Record<string, string>
}

export const projects: Record<string, ProjectText> = {
  mymood: {
    pitch: 'Sosyal bir ruh hâli takipçisi: gününü 1–10 arası puanla, arkadaşlarının nasıl olduğunu gör.',
    role: 'Tek geliştirici — tasarım, backend, yayına alma',
    about:
      'Kullanıcılar günlerini puanlıyor, arkadaş ekliyor ve arkadaşlarının günlerini akışta takip ediyor. Her şeyi tek bir Go uygulaması sunuyor: HTMX ile sunucuda oluşturulan sayfalar, ayrı bir frontend derlemesi yok.',
    highlights: [
      'Tek Go + Fiber uygulaması; HTMX ve elle yazılmış CSS, mobil öncelikli, açık/koyu tema',
      'pgx ile elle yazılmış, parametreli SQL (ORM yok); migration’lar uygulamaya gömülü ve açılışta çalışıyor',
      'HttpOnly, SameSite=Strict çerezlerde JWT oturumları; bcrypt; giriş ve kayıtta hız sınırı',
      'Premium’a hazır: abonelik sütunu ve middleware yerinde',
    ],
    caseStudy: {
      problem: 'Ruh hâli uygulamaları kişisel günlük gibi. Ben tersini istedim: koca bir sosyal ağ kurmadan arkadaşlarının nasıl olduğuna hafifçe bakabileceğin bir yer.',
      approach:
        'Her şeyi tek bir Go uygulamasında tuttum: HTMX ile sunucuda oluşturulan sayfalar, elle yazılmış SQL ve HttpOnly çerezlerde oturumlar. Ayrı bir frontend derlemesi ve senkron tutulacak ikinci bir kod tabanı yok.',
      outcome: 'Neon PostgreSQL veritabanıyla Render üzerinde yayında. Kayıt, arkadaşlık ve günlük akış canlıda çalışıyor.',
    },
    linkLabels: { 'https://mymood-5bh2.onrender.com/': 'Canlı site' },
  },
  alagems: {
    pitch: "Kazakistan'da değerli kargo taşıyan bir lojistik firmasının web sitesi ve backend'i.",
    role: 'Freelance — backend ve yönetim paneli',
    about:
      "Almatı'da değerli kargo için bir lojistik merkezi olan ALAGEMS için müşteri işi. Site Rusça ve İngilizce yayında; içerik, Go API'ye bağlı bir yönetim paneli (CMS) üzerinden yönetiliyor.",
    highlights: [
      'Site içeriğini ve yönetim panelini sunan Go + Fiber backend',
      'Rusça / İngilizce içerik yönetim panelinden düzenleniyor',
      'alagems.kz adresinde canlıda',
      'Gizli müşteri deposu — kod istenirse gösterilebilir',
    ],
    caseStudy: {
      problem: "Almatı'da değerli kargo taşıyan bir lojistik firmasının, kendi ekibinin güncel tutabileceği güvenilir, iki dilli bir web sitesine ihtiyacı vardı.",
      approach: 'Go/Fiber backend’i ve bir yönetim paneli geliştirdim; firma Rusça ve İngilizce içeriğini koda dokunmadan düzenliyor.',
      outcome: 'Firmanın kurumsal sitesi olarak alagems.kz adresinde yayında.',
    },
    linkLabels: { 'https://alagems.kz/': 'Canlı site' },
  },
  coachai: {
    pitch: 'Tekrarlarını sayan ve formunu kontrol eden, web kamerasıyla çalışan bir fitness koçu.',
    role: 'Tek geliştirici — görüntü işleme ve yapay zekâ',
    about:
      'MediaPipe Pose, web kamerasından eklemlerini takip ediyor; eklem açıları squat, curl ve şınav için tekrar sayacını ve form kontrollerini yönetiyor. GPT de kaydedilen bir seti koçluk geri bildirimine çeviriyor.',
    highlights: [
      'MediaPipe ile gerçek zamanlı poz takibi; OpenCV ile iskelet çizimi',
      'Squat, curl ve şınav için açıya dayalı tekrar sayma ve form geri bildirimi',
      'Bir seti kaydet, hareket verisinin GPT analizini al',
      'İsmini yazarak yeni egzersiz ekle — yapay zekâ eklem noktalarını ve açı eşiklerini öneriyor',
    ],
    caseStudy: {
      problem: 'Tek başına antrenman yaparken kimse sana squat’ının yeterince derin olmadığını ya da dirseklerinin kaydığını söylemiyor.',
      approach:
        'MediaPipe her kamera karesinde vücuttan 33 nokta veriyor. Eklem açıları tekrar sayacını ve form kurallarını çalıştırıyor, kaydedilen set de yazılı geri bildirim için GPT’ye gidiyor.',
      outcome: 'Sıradan bir web kamerasıyla squat, curl ve şınavda tekrar sayan ve form hatalarını işaretleyen çalışan bir prototip.',
    },
  },
  'critic-que': {
    pitch: 'Film zekâsı: IMDb, Letterboxd, Rotten Tomatoes, Metacritic ve Reddit tek bir yerde.',
    role: 'Tek geliştirici — full-stack',
    about:
      'Herhangi bir filmi ara; zenginleştirilmiş bilgiler, beş kaynaktan puan çubukları ve kaynağı belirtilmiş yorum alıntıları gelsin. Bir de Top 10 akışı ve yönetmen odaklı keşif var.',
    highlights: [
      'Birden çok kaynaktan puan çubukları ve kaynağı belirtilen dış yorum kartları',
      'Yönetmen keşfi: bir yönetmene tıkla, en iyi filmleri gelsin',
      'Letterboxd sayfaları engellendiğinde devreye giren yedeklerle dayanıklı scraping',
      'Tipli Pydantic modelleriyle FastAPI backend; React + Tailwind arayüz; Docker Compose',
    ],
    caseStudy: {
      problem: 'Ne izleyeceğine karar vermek IMDb, Letterboxd, Rotten Tomatoes ve Reddit’i ayrı sekmelerde açmak demek.',
      approach:
        'FastAPI backend her kaynaktan puanları ve yorumları tipli modellerde topluyor; bir kaynak scraping’i engellerse hata vermek yerine yedeğe geçiyor. React arayüzü hepsini tek ekranda gösteriyor.',
      outcome: 'Tek bir aramayla beş puan kaynağı yan yana; ayrıca Letterboxd Top 10 ve yönetmen keşfi.',
    },
  },
  uniasistan: {
    pitch: 'Üniversite yönetmelikleri için, ilgili maddeyi gösteren Türkçe soru-cevap asistanı.',
    role: 'Tek geliştirici — yapay zekâ / bilgi erişimi',
    about:
      'Öğrenciler "stajım kaç gün?" gibi sorular soruyor ve İstanbul Aydın Üniversitesi yönetmeliğine dayanan, hangi maddeden geldiğini gösteren bir cevap alıyor.',
    highlights: [
      'Türkçe mevzuat metnine göre ayarlanmış PDF çıkarma ve temizleme',
      'Maddeye (MADDE) göre yapıya duyarlı bölümleme',
      'Planlanan: yeniden sıralamalı hibrit arama (pgvector + tam metin) ve gerçek öğrenci sorularından bir değerlendirme seti',
      'Her cevap kaynak maddesini gösteriyor',
    ],
    caseStudy: {
      problem: 'Üniversite yönetmeliği 16 sayfa ve 48 madde. Öğrenciler birbirine WhatsApp gruplarında soruyor ve çoğu zaman yanlış cevap alıyor.',
      approach:
        'Türkçe mevzuata göre ayarlanmış bir işleme hattı: her madde (MADDE) bölüm ve başlığıyla birlikte tek parça, çok harfli bentler doğru tanınıyor, uzun maddeler fıkra sınırından bölünüyor.',
      outcome: 'Yönetmelikten, başlığı ya da bölümü eksik olmayan 58 temiz parça. Sırada hibrit arama ve sohbet arayüzü var.',
    },
  },
  'bulletin-service': {
    pitch: 'Yatırım fonu bültenleri yayınlayan üç Spring Boot mikroservisi.',
    role: 'Tek geliştirici — backend',
    about:
      'auth-service JWT üretiyor, bulletin-service fon verilerini PostgreSQL’de yönetiyor. Üçüncü servis pdf-service (iText7), bülteni PDF olarak oluşturmak için iskelet hâlinde hazır.',
    highlights: [
      'JWT ile giriş ve kayıt yapan ayrı bir auth-service',
      'Spring Data JPA ve PostgreSQL ile REST üzerinden fon CRUD',
      'PDF bülten için iText7 ile kurulmuş pdf-service iskeleti (sıradaki adım)',
      'Büyüklüğe göre popüler fonlar, isimle arama, kategoriye göre filtre',
      'Her servis bağımsız yayına alınabilir; Dockerfile dahil',
    ],
    caseStudy: {
      problem: 'Yatırım fonu bültenleri, güvenle yönetilen ve tutarlı bir biçimde yayınlanan fon verisi gerektiriyor.',
      approach: 'Servislere böldüm: auth-service JWT üretiyor, bulletin-service fon verisinin sahibi (PostgreSQL), pdf-service de bülteni oluşturacak.',
      outcome: 'Kimlik doğrulama ve fon API’leri baştan sona çalışıyor (kayıt, JWT, fon CRUD, popüler fonlar, arama). Sıradaki adım PDF oluşturma.',
    },
  },
}

export const cv: typeof enCv = {
  education: [{ title: 'Bilgisayar Mühendisliği (Lisans)', place: 'İstanbul Aydın Üniversitesi', when: 'devam ediyor' }],
  experience: [
    {
      title: 'Yazılım Mühendisliği Stajyeri',
      place: 'Yapay zekâ fotoğraf kabini',
      when: 'şu an',
      detail: "Modal.com üzerinde yüz değiştirme hattı: misafir başına 5–10 yapay zekâ portre şablonu, yaklaşık 10 saniyede.",
    },
    {
      title: 'Freelance Web Geliştirici',
      place: 'Serbest',
      when: 'devam ediyor',
      detail: "Müşteriler için backend'ler ve siteler — örneğin Kazakistan'daki bir lojistik firması için Go/Fiber backend ve yönetim paneli.",
    },
  ],
  focus: ['Backend: Java / Spring Boot, Go / Fiber', 'Full-stack: React, Python / FastAPI', 'Veri: PostgreSQL', 'Operasyon: Docker, Render, Modal'],
}

export const byteLines: typeof enByteLines = {
  welcome: 'Selam, ben BYTE. Burayı Emir yaptı, müzik kutusu da çalıyor (sesi kapatmak için yukarıdaki hoparlör). Etrafı kurcala — neredeyse her şey bir şey yapıyor.',
  claw: 'Yakaladım! {skill}. Emir bunu şuralarda kullandı: {projects}.',
  clawNone: 'Yakaladım! {skill}. Alet çantasında duruyor — doğru projeyi bekliyor.',
  jukeboxOn: 'Şimdi çalıyor: "{song}". Bu oda için yapılmış chiptune — hiçbir telif hakkı zarar görmedi.',
  jukeboxMuted: 'Çalıyor… ama ses kapalı. Köşedeki hoparlöre bas.',
  jukeboxOff: 'Oh, sessizlik. Kedi onaylıyor.',
  listeningNow: 'Emir şu an {artist} — {title} dinliyor. Zevki: onaylandı.',
  listenedLast: 'Emir en son {artist} — {title} dinledi.',
  cat: ['Mırr.', 'Bu Kernel. Uyku modunda.', 'Kernel sabah toplantılarına katılmaz.'],
  clock: "İstanbul'da şu an saat {time}.",
  window: 'Bir dilek tut. Benimki daha fazla RAM.',
  cork: "Emir'in özgeçmişi. Kaybolmasın diye panoya iğneledim.",
  sign: 'Evet — Emir iş tekliflerine açık. İşte ona ulaşmanın yolları.',
  plant: ['Bitki gayet iyi. Çoğunlukla ekran ışığıyla besleniyor.', 'Monitörün ışığıyla sulanıyor. Öyle diyorlar.'],
  switchOff: 'Işıklar kapandı. Sadece ekranlar — oyun böyle oynanır.',
  switchOn: 'Işıklar geri geldi. Kediye söyleme.',
  rally: 'RALLY yüklendi. Raketini Yukarı/Aşağı ya da fareyle oynat. Proje mi görmek istersin? Raftan bir kaset al.',
  patrol: 'PATROL yüklendi. Sol/Sağ ile hareket et, Boşluk ile ateş et. Proje mi görmek istersin? Raftan bir kaset al.',
  konami: 'Hile kodu kabul edildi. +30 can. Emir gurur duyardı.',
  allSecrets: '12 sırrın hepsini buldun. Artık resmen buranın müdavimisin.',
}

export const contactPitch = 'Staj, junior backend pozisyonları ve freelance projelere açığım.'

export const secretNames: Record<SecretId, string> = {
  claw: 'Pençe makinesi',
  jukebox: 'Müzik kutusu',
  cat: 'Kedi',
  clock: 'Duvar saati',
  window: 'Kayan yıldız',
  cork: 'Mantar pano',
  sign: 'Açık tabelası',
  plant: 'Saksı bitkisi',
  switch: 'Işık düğmesi',
  rally: "RALLY'de sayı",
  patrol: "PATROL'de isabet",
  konami: 'Konami kodu',
}

export const secretHints: Record<SecretId, string> = {
  claw: 'Bir peluş için şansını dene',
  jukebox: 'Biraz müzik aç',
  cat: 'Tüylü biri ilgi bekliyor',
  clock: 'Saat kaç?',
  window: 'Gece gökyüzüne bak',
  cork: 'Panoya asılana göz at',
  sign: 'Kapının yanında bir şey parlıyor',
  plant: 'Yeşil bir şeyin bakıma ihtiyacı var',
  switch: 'Işıkları kapatsak mı?',
  rally: "EMIR-1'de RALLY'de bir sayı al",
  patrol: "EMIR-1'de PATROL'de bir uzaylı vur",
  konami: 'Klavyeden yazılan eski bir hile kodu',
}

export const objectNames: Record<string, string> = {
  emir1: 'EMIR-1 · başlamak için bas',
  claw: 'Pençe makinesi',
  jukebox: 'Müzik kutusu',
  cat: 'Kedi Kernel',
  clock: 'Duvar saati',
  window: 'Pencere',
  cork: 'Mantar pano · CV',
  sign: 'İşe açık · iletişim',
  plant: 'Saksı bitkisi',
  switch: 'Işık düğmesi',
}
