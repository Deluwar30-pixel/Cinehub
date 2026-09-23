// ⚠️ এখানে তোমার TMDB API Key বসাও
const API_KEY = 'YOUR_TMDB_API_KEY';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';
const IMG_BIG = 'https://image.tmdb.org/t/p/original';

// ---------- Fetch Helper ----------
async function fetchMovies(endpoint, containerId, showExclusive = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(`${BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    container.innerHTML = '';
    (data.results || []).forEach(movie => {
      if (!movie.poster_path) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${IMG}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
        ${showExclusive ? '<span class="exclusive">EXCLUSIVE</span>' : ''}
        <span class="rating">⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
        <div class="card-title">${movie.title || movie.name}</div>
      `;
      card.addEventListener('click', () => openModal(movie));
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading:', endpoint, err);
    container.innerHTML = '<p style="color:#888;padding:20px;">⚠️ ডেটা লোড করা যায়নি। API Key ঠিক আছে কিনা দেখো।</p>';
  }
}

// ---------- Load Sections ----------
fetchMovies('/movie/now_playing', 'newMovies', true);
fetchMovies('/trending/movie/week', 'trending', false);
fetchMovies('/movie/top_rated', 'topRated', false);
fetchMovies('/movie/upcoming', 'upcoming', false);

// ---------- Modal ----------
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');

function openModal(movie) {
  document.getElementById('modalImg').src = movie.backdrop_path ? IMG_BIG + movie.backdrop_path : IMG + movie.poster_path;
  document.getElementById('modalTitle').textContent = movie.title || movie.name;
  document.getElementById('modalMeta').textContent =
    `⭐ ${movie.vote_average?.toFixed(1) || 'N/A'} | 📅 ${movie.release_date || movie.first_air_date || 'N/A'}`;
  document.getElementById('modalOverview').textContent = movie.overview || 'কোনো বিবরণ নেই।';
  modal.classList.add('active');
}

closeModal.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('active'); });

// ---------- Search ----------
const searchInput = document.getElementById('searchInput');
const searchSection = document.getElementById('searchSection');
const searchResults = document.getElementById('searchResults');
let searchTimeout;

searchInput.addEventListener('input', e => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  if (query.length < 2) {
    searchSection.style.display = 'none';
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${BASE}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      searchSection.style.display = 'block';
      searchResults.innerHTML = '';
      if (!data.results || data.results.length === 0) {
        searchResults.innerHTML = '<p style="color:#888;">কিছু পাওয়া যায়নি 😔</p>';
        return;
      }
      data.results.forEach(movie => {
        if (!movie.poster_path) return;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${IMG}${movie.poster_path}" alt="${movie.title}">
          <span class="rating">⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
          <div class="card-title">${movie.title}</div>
        `;
        card.addEventListener('click', () => openModal(movie));
        searchResults.appendChild(card);
      });
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) { console.error(err); }
  }, 500);
});

// ---------- Mobile Menu ----------
const menuToggle = document.getElementById('menuToggle');
const menu = document.querySelector('.menu');
menuToggle?.addEventListener('click', () => menu.classList.toggle('open'));

// ---------- Hero Auto Slider ----------
const heroSlides = [
  {
    img: 'https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg',
    title: 'Dune: Part Two',
    desc: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  {
    img: 'https://image.tmdb.org/t/p/original/1X7vow16X7CnCoexXh4H4F2yDJv.jpg',
    title: 'Deadpool & Wolverine',
    desc: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him.'
  },
  {
    img: 'https://image.tmdb.org/t/p/original/tElnmtQ6yz1PWpmWyHcS6Lc8J1d.jpg',
    title: 'Oppenheimer',
    desc: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
  }
];

const hero = document.getElementById('hero');
let currentSlide = 0;

function createSlides() {
  hero.innerHTML = '';
  heroSlides.forEach((slide, i) => {
    const div = document.createElement('div');
    div.className = 'hero-slide' + (i === 0 ? ' active' : '');
    div.style.backgroundImage = `url('${slide.img}')`;
    div.innerHTML = `
      <div class="hero-overlay">
        <span class="tag">🔥 Featured</span>
        <h1>${slide.title}</h1>
        <p>${slide.desc}</p>
        <div class="hero-buttons">
          <button class="btn-play"><i class="fa-solid fa-play"></i> Watch Now</button>
          <button class="btn-info"><i class="fa-solid fa-circle-info"></i> More Info</button>
        </div>
      </div>
    `;
    hero.appendChild(div);
  });
}

function nextSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}

createSlides();
setInterval(nextSlide, 5000);