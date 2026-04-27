/* ─── i18n ──────────────────────────────────────────────────── */
const LANG = {
  tr: {
    eyebrow:       'Instagram Araçları',
    title1:        'Takip',
    title2:        'Analizi',
    subtitle:      'JSON dosyalarını yükle, takipçi durumunu ve ne zaman takip edildiğini görüntüle.',
    dropLabelFollow:    'Takip Ettiklerim',
    dropHintFollow:     'following.json • seç veya sürükle',
    dropLabelFollowers: 'Takipçilerim',
    dropHintFollowers:  'followers_1.json • seç veya sürükle',
    btnAnalyze:    'Analizi Başlat →',
    loading:       'Analiz ediliyor...',
    statFollowing: 'Takip Edilen',
    statFollowers: 'Takipçi',
    statGhost:     'Geri Takip Etmeyen',
    statFans:      'Karşılıksız Hayran',
    pillRed:       'Takip Etmiyorlar',
    pillBlue:      'Karşılıksız Takip',
    titleRed:      'Ben takip ediyorum\nama beni etmiyor',
    titleBlue:     'O takip ediyor\nama ben etmiyorum',
    search:        'Ara...',
    empty:         'Liste boş — harika!',
    noResult:      'Sonuç bulunamadı.',
    errBoth:       'Lütfen her iki JSON dosyasını da yükle.',
    errParse:      'Geçersiz JSON dosyası:',
    privacy:       'Tüm veriler yalnızca tarayıcında işlenir. Hiçbir bilgi dışarıya gönderilmez.',
    since:         'Takip tarihi:',
    unknown:       'Tarih bilinmiyor',
  },
  en: {
    eyebrow:       'Instagram Tools',
    title1:        'Follow',
    title2:        'Analyzer',
    subtitle:      'Upload your JSON files to see who isn\'t following back and who you haven\'t followed.',
    dropLabelFollow:    'Following',
    dropHintFollow:     'following.json • pick or drag',
    dropLabelFollowers: 'Followers',
    dropHintFollowers:  'followers_1.json • pick or drag',
    btnAnalyze:    'Run Analysis →',
    loading:       'Analyzing...',
    statFollowing: 'Following',
    statFollowers: 'Followers',
    statGhost:     'Not Following Back',
    statFans:      'Unreturned Fans',
    pillRed:       'Not Following Back',
    pillBlue:      'Unreturned Fans',
    titleRed:      'I follow them\nbut they don\'t follow me',
    titleBlue:     'They follow me\nbut I don\'t follow them',
    search:        'Search...',
    empty:         'Empty list — great!',
    noResult:      'No results found.',
    errBoth:       'Please upload both JSON files.',
    errParse:      'Invalid JSON file:',
    privacy:       'All data is processed locally in your browser. Nothing is sent anywhere.',
    since:         'Following since:',
    unknown:       'Date unknown',
  }
};

/* ─── STATE ─────────────────────────────────────────────────── */
let currentLang = 'tr';
let loadedFiles  = { following: null, followers: null };
let rawUnfollowers = [];  /* [{ username, timestamp }] */
let rawFans        = [];

/* ─── AVATAR COLORS ─────────────────────────────────────────── */
const AV_RED  = ['#3d1020','#5a1830','#78203f'];
const AV_BLUE = ['#0d2240','#122e55','#173b6b'];

function avatarColor(username, palette) {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/* ─── DATE FORMATTING ───────────────────────────────────────── */
function formatDate(ts, lang) {
  if (!ts) return LANG[lang].unknown;
  try {
    return new Date(ts * 1000).toLocaleDateString(
      lang === 'tr' ? 'tr-TR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  } catch {
    return LANG[lang].unknown;
  }
}

/* ─── PARSE JSON ────────────────────────────────────────────── */
function parseUsers(data) {
  /* Returns Map<username_lowercase, timestamp|null> */
  let items = [];
  if (Array.isArray(data))                         items = data;
  else if (data.relationships_following)            items = data.relationships_following;
  else if (data.relationships_followers)            items = data.relationships_followers;
  else {
    const key = Object.keys(data)[0];
    if (key && Array.isArray(data[key]))            items = data[key];
  }

  const map = new Map();

  items.forEach(item => {
    let username  = null;
    let timestamp = null;

    if (item.string_list_data && item.string_list_data.length > 0) {
      const sld = item.string_list_data[0];

      /* timestamp */
      if (sld.timestamp) timestamp = sld.timestamp;

      /* username: prefer 'value', fall back to href, then title */
      if (sld.value && sld.value.trim() !== '') {
        username = sld.value.trim();
      } else if (sld.href) {
        const m = sld.href.match(/instagram\.com\/_?u?\/?([^/?#\s]+)/);
        if (m) username = m[1];
      }
    }

    if (!username && item.title && item.title.trim() !== '') {
      username = item.title.trim();
    }

    if (username) {
      map.set(username.toLowerCase(), { username, timestamp });
    }
  });

  return map;
}

/* ─── RENDER LIST ───────────────────────────────────────────── */
function createUserItem(entry, palette) {
  const { username, timestamp } = entry;
  const lang = currentLang;
  const t    = LANG[lang];

  const li = document.createElement('li');
  li.className = 'user-item';
  li.dataset.u = username.toLowerCase();

  const av = document.createElement('div');
  av.className = 'user-av';
  av.style.background = avatarColor(username, palette);
  av.textContent = username.slice(0, 2).toUpperCase();

  const info = document.createElement('div');
  info.className = 'user-info';

  const a = document.createElement('a');
  a.className = 'user-link';
  a.href = `https://www.instagram.com/${username}`;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = username;

  const dateEl = document.createElement('div');
  dateEl.className = 'user-date';
  dateEl.textContent = timestamp
    ? `${t.since} ${formatDate(timestamp, lang)}`
    : t.unknown;

  info.appendChild(a);
  info.appendChild(dateEl);

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', 'ext-icon');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.innerHTML = `<path d="M3 8h10M9 4l4 4-4 4"/>`;

  li.appendChild(av);
  li.appendChild(info);
  li.appendChild(icon);
  return li;
}

function renderList(listId, countId, arr, palette) {
  const list    = document.getElementById(listId);
  const countEl = document.getElementById(countId);
  const t       = LANG[currentLang];

  list.innerHTML = '';
  countEl.textContent = arr.length;

  if (arr.length === 0) {
    list.innerHTML = `<div class="list-empty">${t.empty}</div>`;
    return;
  }

  arr.forEach(entry => list.appendChild(createUserItem(entry, palette)));
}

function filterList(listId, query, source, palette) {
  const list = document.getElementById(listId);
  const q    = query.toLowerCase().trim();
  const t    = LANG[currentLang];
  const filtered = q ? source.filter(e => e.username.toLowerCase().includes(q)) : source;

  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = `<div class="list-empty">${t.noResult}</div>`;
    return;
  }
  filtered.forEach(e => list.appendChild(createUserItem(e, palette)));
}

/* ─── FILE HANDLING ─────────────────────────────────────────── */
function handleFile(type, input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      loadedFiles[type] = data;

      const zoneId = type === 'following' ? 'dropFollowing' : 'dropFollowers';
      const nameId = type === 'following' ? 'nameFollowing' : 'nameFollowers';
      document.getElementById(zoneId).classList.add('loaded');
      document.getElementById(nameId).textContent = file.name;
      hideError();
    } catch (err) {
      showError(LANG[currentLang].errParse + ' ' + file.name);
    }
  };
  reader.readAsText(file);
}

/* ─── ANALYZE ───────────────────────────────────────────────── */
function analyze() {
  hideError();
  const t = LANG[currentLang];

  if (!loadedFiles.following || !loadedFiles.followers) {
    showError(t.errBoth);
    return;
  }

  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('resultsSection').style.display = 'none';

  /* slight delay so spinner shows */
  setTimeout(() => {
    const following = parseUsers(loadedFiles.following);
    const followers = parseUsers(loadedFiles.followers);

    /* unfollowers: I follow them, they don't follow me */
    rawUnfollowers = [...following.entries()]
      .filter(([k]) => !followers.has(k))
      .map(([, v]) => v)
      .sort((a, b) => a.username.localeCompare(b.username));

    /* fans: they follow me, I don't follow them */
    rawFans = [...followers.entries()]
      .filter(([k]) => !following.has(k))
      .map(([, v]) => v)
      .sort((a, b) => a.username.localeCompare(b.username));

    /* stats */
    document.getElementById('statFollowing').textContent = following.size;
    document.getElementById('statFollowers').textContent = followers.size;
    document.getElementById('statGhost').textContent     = rawUnfollowers.length;
    document.getElementById('statFans').textContent      = rawFans.length;

    renderList('unfollowersList', 'unfollowerCount', rawUnfollowers, AV_RED);
    renderList('fansList',        'fanCount',        rawFans,        AV_BLUE);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    /* re-trigger animation */
    document.querySelectorAll('#resultsSection .fade-up').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }, 220);
}

/* ─── LANGUAGE ──────────────────────────────────────────────── */
function setLang(lang) {
  currentLang = lang;
  const t = LANG[lang];

  /* toggle buttons */
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  /* hero */
  document.getElementById('heroEyebrow').textContent = t.eyebrow;
  document.getElementById('heroTitle1').textContent  = t.title1;
  document.getElementById('heroTitle2').textContent  = t.title2;
  document.getElementById('heroSub').textContent     = t.subtitle;

  /* drops */
  document.getElementById('dropLabelFollowing').textContent  = t.dropLabelFollow;
  document.getElementById('dropHintFollowing').textContent   = t.dropHintFollow;
  document.getElementById('dropLabelFollowers').textContent  = t.dropLabelFollowers;
  document.getElementById('dropHintFollowers').textContent   = t.dropHintFollowers;

  /* button */
  document.getElementById('analyzeBtn').textContent = t.btnAnalyze;

  /* loading */
  document.getElementById('loadingText').textContent = t.loading;

  /* stats labels */
  document.getElementById('labelFollowing').textContent = t.statFollowing;
  document.getElementById('labelFollowers').textContent = t.statFollowers;
  document.getElementById('labelGhost').textContent     = t.statGhost;
  document.getElementById('labelFans').textContent      = t.statFans;

  /* panels */
  document.getElementById('pillRed').textContent   = t.pillRed;
  document.getElementById('titleRed').innerHTML    = t.titleRed.replace('\n', '<br>');
  document.getElementById('pillBlue').textContent  = t.pillBlue;
  document.getElementById('titleBlue').innerHTML   = t.titleBlue.replace('\n', '<br>');

  /* search placeholders */
  document.querySelectorAll('.panel-search input').forEach(inp => {
    inp.placeholder = t.search;
  });

  /* footer */
  document.getElementById('footerPrivacy').textContent = t.privacy;

  /* re-render lists with new language dates if results shown */
  if (document.getElementById('resultsSection').style.display !== 'none') {
    renderList('unfollowersList', 'unfollowerCount', rawUnfollowers, AV_RED);
    renderList('fansList',        'fanCount',        rawFans,        AV_BLUE);
  }
}

/* ─── HELPERS ───────────────────────────────────────────────── */
function showError(msg) {
  const el = document.getElementById('errorBox');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError() {
  document.getElementById('errorBox').style.display = 'none';
}

/* ─── DRAG & DROP ───────────────────────────────────────────── */
function initDragDrop() {
  ['dropFollowing', 'dropFollowers'].forEach(id => {
    const zone = document.getElementById(id);
    const type = id === 'dropFollowing' ? 'following' : 'followers';
    const inputId = type === 'following' ? 'fileFollowing' : 'fileFollowers';

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const input = document.getElementById(inputId);
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleFile(type, input);
    });
  });
}

/* ─── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDragDrop();
  setLang('tr');
});