/**
 * Gwangju Accident Investigation Center
 * Main Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Header Scroll Effect ──────────────────────────────────────
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.style.boxShadow = window.scrollY > 50
                ? '0 5px 20px rgba(0,0,0,0.1)'
                : '0 2px 15px rgba(0,0,0,0.05)';
        });
    }

    // ── Search Toggle (index.html only) ──────────────────────────
    const searchBtn = document.getElementById('searchToggle');
    const searchSection = document.querySelector('.search-section');
    if (searchBtn && searchSection) {
        searchBtn.addEventListener('click', () => {
            const searchInput = searchSection.querySelector('input');
            if (searchInput) {
                searchInput.focus();
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ── Hero Slider (index.html only) ────────────────────────────
    const heroItems = document.querySelectorAll('.hero-item');
    if (heroItems.length > 1) {
        let currentHeroIndex = 0;
        setInterval(() => {
            heroItems[currentHeroIndex].classList.remove('active');
            currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
            heroItems[currentHeroIndex].classList.add('active');
        }, 6000);
    }

    // ── Card Hover Effect ─────────────────────────────────────────
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.borderColor = 'var(--primary-color)');
        card.addEventListener('mouseleave', () => card.style.borderColor = '#F1F5F9');
    });

    // ── Search Input (index.html only) ───────────────────────────
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) alert(`'${query}'에 대한 검색 결과를 로드합니다.`);
            }
        });

        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent.replace('#', '');
                searchInput.focus();
            });
        });
    }

    // ── Sidebar Tab Navigation ────────────────────────────────────
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const tabContents = mainContent.querySelectorAll('.tab-content');
    if (tabContents.length === 0) return;

    const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
    const breadcrumb = document.querySelector('.breadcrumb');

    // GNB 현재 페이지 활성화
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.gnb > li > a').forEach(link => {
        const linkFile = link.getAttribute('href').split('#')[0];
        link.closest('li').classList.toggle('active', linkFile === currentPath);
    });

    // 탭 전환 함수
    const switchTab = (tabId) => {
        if (!tabId) return;

        let found = false;
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active-tab');
                found = true;
            } else {
                content.classList.remove('active-tab');
            }
        });

        if (!found) return;

        // 사이드바 활성 상태 업데이트
        sidebarLinks.forEach(link => {
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
                if (breadcrumb) {
                    // 마지막 <span> 태그만 찾아 현재 탭 이름으로 업데이트
                    const spans = breadcrumb.querySelectorAll('span');
                    if (spans.length > 0) {
                        spans[spans.length - 1].textContent = link.innerText.trim();
                    }
                }
            } else {
                link.classList.remove('active');
            }
        });

        // 아이콘 렌더링 보장
        if (window.lucide) {
            lucide.createIcons();
        }
    };

    // 사이드바 클릭 이벤트
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
            // 해시 업데이트 (hashchange 무한루프 방지를 위해 pushState 사용)
            history.pushState(null, null, '#' + tabId);
        });
    });

    // 초기 로드 및 해시 처리
    const applyHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            switchTab(hash);
        } else {
            // 기본 탭: active 클래스가 있는 링크 또는 첫 번째 링크
            const defaultLink = document.querySelector('.sidebar-menu a.active') || sidebarLinks[0];
            if (defaultLink) switchTab(defaultLink.getAttribute('data-tab'));
        }
    };

    applyHash();

    // 뒤로가기/앞으로가기 대응
    window.addEventListener('hashchange', applyHash);
});
