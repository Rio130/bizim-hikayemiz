'use client';

import { SyntheticEvent, useEffect, useMemo, useState } from 'react';

type Memory = {
  id: number;
  date: string;
  title: string;
  note: string;
};

const LOVE_NOTES = [
  'Seninle sıradan bir gün bile en sevdiğim anıya dönüşüyor.',
  'Yanımdayken dünya biraz daha sakin, biraz daha güzel.',
  'En sevdiğim yer, seninle aynı cümlenin içi.',
  'İyi ki yollarımız kesişti; iyi ki hâlâ yan yana yürüyoruz.',
];

const DATE_IDEAS = [
  'Telefonları sessize alıp birlikte gün batımını izleyin.',
  'Birbirinize üç şarkılık mini bir çalma listesi hazırlayın.',
  'İlk buluşmanızı küçük bir detayla yeniden canlandırın.',
  'Birlikte hiç denemediğiniz bir tarif seçip mutfağa girin.',
];

const PHOTO_DEFINITIONS = [
  { file: 'photo-01.enc', caption: 'Yan yana, en sevdiğimiz yerde' },
  { file: 'photo-02.enc', caption: 'Bir selfieye sığan mutluluk' },
  { file: 'photo-03.enc', caption: 'Aynı yöne yürürken' },
  { file: 'photo-04.enc', caption: 'Bizim en doğal hâlimiz' },
  { file: 'photo-05.enc', caption: 'Küçük bir kare, kocaman bir biz' },
  { file: 'photo-06.enc', caption: 'Göz göze geldiğimiz an' },
  { file: 'photo-07.enc', caption: 'Mavi gökyüzü, güzel bir gün' },
  { file: 'photo-08.enc', caption: 'Sıradan bir günün güzelliği' },
  { file: 'photo-09.enc', caption: 'Yan yana her yer ev gibi' },
  { file: 'photo-10.enc', caption: 'Sessizce anlaşabildiğimiz anlar' },
  { file: 'photo-11.enc', caption: 'İyi ki tam da buradayız' },
  { file: 'photo-12.enc', caption: 'Akşam ışığında biz' },
  { file: 'photo-13.enc', caption: 'Birlikte güzel bir manzara' },
  { file: 'photo-14.enc', caption: 'Adımlarımız aynı ritimde' },
  { file: 'photo-15.enc', caption: 'Bu şehirde en sevdiğim kişi' },
  { file: 'photo-16.enc', caption: 'Hikâyenin devamına doğru' },
  { file: 'photo-17.enc', caption: 'Gülüşünü yakaladığım an' },
  { file: 'photo-18.enc', caption: 'Günün en güzel tesadüfü' },
  { file: 'photo-19.enc', caption: 'Birlikte keşfederken' },
  { file: 'photo-20.enc', caption: 'İki kişilik küçük bir dünya' },
  { file: 'photo-21.enc', caption: 'Kahkahaya karışan bir akşam' },
  { file: 'photo-22.enc', caption: 'Bir bakışın yettiği yer' },
  { file: 'photo-23.enc', caption: 'Sokaklarda kaybolurken' },
  { file: 'photo-24.enc', caption: 'Şehrin ışıkları altında' },
  { file: 'photo-25.enc', caption: 'En sevdiğim ekip arkadaşı' },
  { file: 'photo-26.enc', caption: 'Bir gün daha, yine biz' },
  { file: 'photo-27.enc', caption: 'Güzel bir anı daha' },
  { file: 'photo-28.enc', caption: 'Aynı karede iyi ki' },
  { file: 'photo-29.enc', caption: 'Dışarıda geçen uzun bir gün' },
  { file: 'photo-30.enc', caption: 'Birlikte daha güzel' },
  { file: 'photo-31.enc', caption: 'Hikâyemizden bir sayfa' },
  { file: 'photo-32.enc', caption: 'Bugünün küçük mutluluğu' },
  { file: 'photo-33.enc', caption: 'Yolumuz hep yan yana' },
  { file: 'photo-34.enc', caption: 'İyi ki buradayız' },
  { file: 'photo-35.enc', caption: 'Devamı gelecek' },
  { file: 'photo-36.enc', caption: 'Birlikte geçen güzel bir an' },
  { file: 'photo-37.enc', caption: 'Gülüşümüzün en güzel hâli' },
  { file: 'photo-38.enc', caption: 'Hikâyemizin renkli sayfası' },
  { file: 'photo-39.enc', caption: 'İyi ki aynı karedeyiz' },
  { file: 'photo-40.enc', caption: 'Bu anı da sakladık' },
];

const PHOTO_SALT = 'AJdTMsTvxBtDMJ+uNM1ZSA==';
const PHOTO_VERSION = '4';

function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function decryptPhotos(password: string, onFirstBatch?: (urls: string[]) => void) {
  const passwordMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: decodeBase64(PHOTO_SALT), iterations: 310_000, hash: 'SHA-256' },
    passwordMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  const baseUrl = import.meta.env.BASE_URL;
  const urls: string[] = [];
  for (let start = 0; start < PHOTO_DEFINITIONS.length; start += 6) {
    const batch = PHOTO_DEFINITIONS.slice(start, start + 6);
    const decrypted = await Promise.all(batch.map(async ({ file }) => {
      const response = await fetch(`${baseUrl}photos/${file}?v=${PHOTO_VERSION}`, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Fotoğraf paketi yüklenemedi.');
      const packed = new Uint8Array(await response.arrayBuffer());
      const nonce = packed.slice(0, 12);
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, packed.slice(12));
    }));
    urls.push(...decrypted.map((photo) => URL.createObjectURL(new Blob([photo], { type: 'image/jpeg' }))));
    if (start === 0) onFirstBatch?.([...urls]);
  }
  return urls;
}

export default function Home() {
  const [photoUrls, setPhotoUrls] = useState<string[] | null>(null);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [firstName] = useState('Mert Can');
  const [secondName] = useState('Nazlı');
  const [noteIndex, setNoteIndex] = useState(0);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [memoryNote, setMemoryNote] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [memories, setMemories] = useState<Memory[]>([
    { id: 1, date: '01', title: 'İlk karşılaşma', note: 'Her güzel hikâyenin küçük bir başlangıcı vardır.' },
    { id: 2, date: '02', title: 'İlk uzun sohbet', note: 'Saatlerin nasıl geçtiğini ilk kez o gün anlamadık.' },
    { id: 3, date: '03', title: 'Biz olduğumuz gün', note: 'İki ayrı yol, aynı yöne dönmeye başladı.' },
  ]);

  const photos = useMemo(() => photoUrls?.map((src, index) => ({ ...PHOTO_DEFINITIONS[index], src })) ?? [], [photoUrls]);
  const displayFirst = firstName.trim() || 'Sen';
  const displaySecond = secondName.trim() || 'O';

  useEffect(() => {
    if (selectedPhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null);
      if (event.key === 'ArrowRight') setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
      if (event.key === 'ArrowLeft') setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, photos.length]);

  async function unlockStory(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;
    setUnlocking(true);
    setUnlockError('');
    try {
      const urls = await decryptPhotos(password, (firstBatch) => setPhotoUrls(firstBatch));
      setPhotoUrls(urls);
      setPassword('');
    } catch {
      setUnlockError('Parola eşleşmedi. Büyük-küçük harflere dikkat edip yeniden deneyin.');
    } finally {
      setUnlocking(false);
    }
  }

  function addMemory(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memoryTitle.trim()) return;
    const label = memoryDate
      ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(`${memoryDate}T12:00:00`)).toUpperCase()
      : String(memories.length + 1).padStart(2, '0');
    setMemories((items) => [...items, { id: Date.now(), date: label, title: memoryTitle.trim(), note: memoryNote.trim() || 'Birlikte saklamak istediğimiz güzel bir an.' }]);
    setMemoryTitle('');
    setMemoryDate('');
    setMemoryNote('');
    setMemoryOpen(false);
  }

  if (!photoUrls) {
    return (
      <main className="vault-shell">
        <div className="vault-orb vault-orb-one" />
        <div className="vault-orb vault-orb-two" />
        <section className="vault-card">
          <div className="vault-mark">∞</div>
          <span className="vault-eyebrow">YALNIZCA İKİ KİŞİLİK</span>
          <h1>Bizim<br /><em>Hikâyemiz.</em></h1>
          <p>Şifreli anılarınız burada. İkinizin bildiği parolayı yazıp hikâyenizi açın.</p>
          <form onSubmit={unlockStory}>
            <label htmlFor="story-password">ÖZEL PAROLA</label>
            <div className="vault-input">
              <input
                id="story-password"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Parolanızı yazın"
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Parolayı gizle' : 'Parolayı göster'}>{passwordVisible ? 'GİZLE' : 'GÖSTER'}</button>
            </div>
            {unlockError && <p className="vault-error" role="alert">{unlockError}</p>}
            <button className="vault-submit" type="submit" disabled={unlocking}>{unlocking ? 'HİKÂYE AÇILIYOR…' : 'HİKÂYEYİ AÇ'} <span>→</span></button>
          </form>
          <small><span>●</span> Ham fotoğraflar internete yüklenmez; yalnızca doğru parola tarayıcınızda çözebilir.</small>
          <p className="vault-copyright">Mert Can KESKİN — Tüm hakları saklıdır.</p>
        </section>
        <aside className="vault-seal"><span>PRIVATE</span><strong>02</strong><i>KİŞİ</i></aside>
      </main>
    );
  }

  return (
    <main>
      <nav className="site-nav" aria-label="Sayfa menüsü">
        <a className="logo" href="#top"><span>∞</span><strong>BİZİM<br />HİKÂYEMİZ</strong></a>
        <div>
          <a href="#fotograflar">Fotoğraflar</a>
          <a href="#anilar">Anılar</a>
          <a href="#nedenler">Neden sen?</a>
          <a href="#bugun">Bugün</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <span className="eyebrow">AYNI HİKÂYENİN İKİ KAHRAMANI</span>
          <h1><span>{displayFirst}</span><i>&</i><span>{displaySecond}</span></h1>
          <p>Her şeyin hızla değiştiği bir dünyada, değişmesini istemediğim en güzel şey: <em>biz.</em></p>
          <div className="hero-actions">
            <a href="#anilar">HİKÂYEMİZE BAK <span>↓</span></a>
            <a className="ghost-action" href="#bugun">GİZLİ NOTU AÇ ♥</a>
          </div>
        </div>

        <div className="counter-card">
          <span>BİRLİKTE GEÇEN</span>
          <strong>∞</strong>
          <p>her gün birlikte</p>
          <div><i /><span>ve daha niceleri…</span></div>
        </div>

      </section>

      <section className="marquee" aria-label="Sevgi mesajı">
        <div>İYİ Kİ AYNI HİKÂYEDEYİZ <span>♥</span> BUGÜN, YARIN, HER GÜN <span>♥</span> İYİ Kİ AYNI HİKÂYEDEYİZ <span>♥</span> BUGÜN, YARIN, HER GÜN</div>
      </section>

      <section className="photo-story section-wrap" id="fotograflar">
        <header className="section-title">
          <div><span>01 / BİZDEN KARELER</span><h2>En sevdiğimiz<br /><em>anların içinden.</em></h2></div>
          <p>40 kare · tek hikâye.</p>
        </header>
        <div className="photo-grid">
          {photos.slice(0, 6).map((photo, index) => (
            <button
              className={`photo-card photo-card-${index + 1}`}
              key={photo.src}
              onClick={() => setSelectedPhoto(index)}
              aria-label={`${photo.caption} fotoğrafını büyüt`}
            >
              <img src={photo.src} alt={`Birlikte çekilmiş anı fotoğrafı ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} />
              <span><b>{String(index + 1).padStart(2, '0')}</b><i>↗</i></span>
            </button>
          ))}
        </div>
        <div className="photo-film" aria-label="Diğer fotoğraflar">
          {photos.slice(6).map((photo, offset) => {
            const index = offset + 6;
            return (
              <button key={photo.src} onClick={() => setSelectedPhoto(index)} aria-label={`${photo.caption} fotoğrafını büyüt`}>
                <img src={photo.src} alt={`Birlikte çekilmiş anı fotoğrafı ${index + 1}`} loading="lazy" />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>
        <p className="gallery-hint">Bir fotoğrafa dokunup tam ekran görüntüleyin · Ok tuşlarıyla gezinin</p>
      </section>

      <section className="memories section-wrap" id="anilar">
        <header className="section-title">
          <div><span>02 / BİZİM ZAMAN ÇİZGİMİZ</span><h2>Küçük anlar,<br /><em>büyük hikâyemiz.</em></h2></div>
          <button onClick={() => setMemoryOpen(true)}>＋ YENİ ANI EKLE</button>
        </header>
        <div className="timeline-line" />
        <div className="memory-grid">
          {memories.map((memory, index) => (
            <article key={memory.id}>
              <div><span>{memory.date}</span><i>{index + 1}</i></div>
              <h3>{memory.title}</h3>
              <p>{memory.note}</p>
            </article>
          ))}
        </div>
        <p className="session-note">Yeni anılar yalnızca bu cihazda görünür.</p>
      </section>

      <section className="reasons section-wrap" id="nedenler">
        <header className="section-title">
          <div><span>03 / SENDE SEVDİĞİM</span><h2>Tek bir neden değil,<br /><em>binlerce küçük şey.</em></h2></div>
          <p>Bize iyi gelen küçük şeyler.</p>
        </header>
        <div className="reason-grid">
          <article className="reason-feature"><span>01</span><div className="heart-outline">♡</div><h3>Yanında kendim olabildiğim için.</h3></article>
          <article><span>02</span><h3>En kötü günü bile hafifleten gülüşün için.</h3><i>↗</i></article>
          <article><span>03</span><h3>Hayallerimi kendi hayalin gibi sahiplendiğin için.</h3><i>↗</i></article>
          <article><span>04</span><h3>Sessizlikte bile anlaşabildiğimiz için.</h3><i>↗</i></article>
          <article><span>05</span><h3>Her gün yeniden “iyi ki” dedirttiğin için.</h3><i>↗</i></article>
        </div>
      </section>

      <section className="today section-wrap" id="bugun">
        <div className="love-note">
          <span>04 / BUGÜNÜN NOTU</span>
          <blockquote>“{LOVE_NOTES[noteIndex]}”</blockquote>
          <button onClick={() => setNoteIndex((noteIndex + 1) % LOVE_NOTES.length)}>BAŞKA BİR NOT <span>↻</span></button>
        </div>
        <div className="date-idea">
          <div className="spark">✦</div>
          <span>BUGÜNÜN KÜÇÜK PLANI</span>
          <h3>{DATE_IDEAS[ideaIndex]}</h3>
          <button onClick={() => setIdeaIndex((ideaIndex + 1) % DATE_IDEAS.length)}>YENİ FİKİR ÜRET <span>→</span></button>
        </div>
      </section>

      <footer className="site-footer">
        <div><span>∞</span><strong>{displayFirst} & {displaySecond}</strong></div>
        <p>© 2026 Mert Can KESKİN — Tüm hakları saklıdır.</p>
        <a href="#top">YUKARI DÖN ↑</a>
      </footer>

      {memoryOpen && (
        <dialog open className="modal-backdrop">
          <section className="memory-modal" aria-labelledby="memory-title">
            <header><div><span>YENİ ANI</span><h2 id="memory-title">Hatırlamaya değer.</h2></div><button onClick={() => setMemoryOpen(false)} aria-label="Anı formunu kapat">×</button></header>
            <form onSubmit={addMemory}>
              <label>ANI BAŞLIĞI<input autoFocus value={memoryTitle} onChange={(event) => setMemoryTitle(event.target.value)} placeholder="Örn. İlk tatilimiz" maxLength={48} required /></label>
              <label>TARİH<input type="date" value={memoryDate} onChange={(event) => setMemoryDate(event.target.value)} /></label>
              <label>KISA NOT<textarea value={memoryNote} onChange={(event) => setMemoryNote(event.target.value)} placeholder="Bu anı neden özel?" maxLength={180} /></label>
              <button type="submit">ANIYI EKLE <span>→</span></button>
            </form>
          </section>
        </dialog>
      )}

      {selectedPhoto !== null && (
        <dialog open className="lightbox" aria-label="Fotoğraf görüntüleyici">
          <button className="lightbox-close" onClick={() => setSelectedPhoto(null)} aria-label="Fotoğrafı kapat">×</button>
          <button className="lightbox-arrow lightbox-prev" onClick={() => setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length)} aria-label="Önceki fotoğraf">←</button>
          <figure>
            <img src={photos[selectedPhoto].src} alt={`Birlikte çekilmiş anı fotoğrafı ${selectedPhoto + 1}`} />
            <figcaption><span>{String(selectedPhoto + 1).padStart(2, '0')} / {photos.length}</span></figcaption>
          </figure>
          <button className="lightbox-arrow lightbox-next" onClick={() => setSelectedPhoto((selectedPhoto + 1) % photos.length)} aria-label="Sonraki fotoğraf">→</button>
        </dialog>
      )}
    </main>
  );
}
