/**
 * Gwangju Accident Investigation Center
 * Main Interactivity Script
 */

// ── 전역 관리자 함수 (커스텀 모달 방식) ──────────────────────────────
const createAdminModal = (mode = 'login') => {
    // 기존 모달이 있으면 제거 (모드 전환 대응)
    const existing = document.getElementById('adminModalOverlay');
    if (existing) existing.remove();
    
    const isLogin = mode === 'login';
    const title = isLogin ? '관리자 인증' : '관리자 로그아웃';
    const content = isLogin 
        ? '<input type="password" id="adminPassword" placeholder="비밀번호를 입력하세요">'
        : '<p style="margin-bottom: 20px; color: #475569;">관리자 모드를 종료하시겠습니까?</p>';
    const confirmText = isLogin ? '확인' : '로그아웃';

    const modalHTML = `
        <div class="modal-overlay" id="adminModalOverlay">
            <div class="admin-modal">
                <h3>${title}</h3>
                ${content}
                <div class="modal-btns">
                    <button type="button" class="btn-close" id="adminModalClose">취소</button>
                    <button type="button" class="btn-login" id="adminModalConfirm">${confirmText}</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('adminModalOverlay');
    const confirmBtn = document.getElementById('adminModalConfirm');
    const closeBtn = document.getElementById('adminModalClose');
    const input = document.getElementById('adminPassword');

    const handleConfirm = () => {
        if (isLogin) {
            if (input.value === "3151") {
                localStorage.setItem('admin_active', 'true');
                alert("관리자 모드로 전환되었습니다.");
                location.reload();
            } else {
                alert("비밀번호가 틀렸습니다.");
                input.value = "";
                input.focus();
            }
        } else {
            localStorage.removeItem('admin_active');
            location.reload();
        }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    if (input) {
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleConfirm(); });
        setTimeout(() => input.focus(), 100);
    }
    
    closeBtn.addEventListener('click', () => { overlay.style.display = 'none'; });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
};

window.showAdminLogin = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    createAdminModal('login');
    const overlay = document.getElementById('adminModalOverlay');
    overlay.style.display = 'flex';
};

window.adminLogout = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    createAdminModal('logout');
    const overlay = document.getElementById('adminModalOverlay');
    overlay.style.display = 'flex';
};

// ── 관리자 상태 체크 및 전역 이벤트 위임 ──────────────────────────────
const updateAdminUI = () => {
    const isAdmin = localStorage.getItem('admin_active') === 'true';
    const adminBtns = document.querySelectorAll('.admin-toggle');
    
    if (isAdmin) {
        document.body.classList.add('admin-active');
        adminBtns.forEach(btn => {
            btn.innerHTML = '<i data-lucide="log-out" style="width:14px; margin-right:4px;"></i> 관리자 로그아웃';
        });
    } else {
        document.body.classList.remove('admin-active');
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// 전역 클릭 이벤트 위임 (어느 페이지에서든 .admin-toggle 클릭 시 작동)
document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.admin-toggle');
    if (toggleBtn) {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        
        console.log("Admin Toggle Clicked!"); // 디버그용 로그
        
        const isAdmin = localStorage.getItem('admin_active') === 'true';
        if (isAdmin) {
            window.adminLogout(e);
        } else {
            window.showAdminLogin(e);
        }
    }
}, true); // 캡처링 단계에서 우선 포착

document.addEventListener('DOMContentLoaded', () => {
    updateAdminUI();

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

    // ── Sidebar Tab Navigation (페이지별 선택적 실행) ────────────────
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const tabContents = mainContent.querySelectorAll('.tab-content');
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
        const breadcrumb = document.querySelector('.breadcrumb');

        if (tabContents.length > 0) {
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
                            const spans = breadcrumb.querySelectorAll('span');
                            if (spans.length > 0) {
                                spans[spans.length - 1].textContent = link.innerText.trim();
                            }
                        }
                    } else {
                        link.classList.remove('active');
                    }
                });

                if (window.lucide) lucide.createIcons();
            };

            // 사이드바 클릭 이벤트
            sidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = link.getAttribute('data-tab');
                    switchTab(tabId);
                    history.pushState(null, null, '#' + tabId);
                });
            });

            // 초기 로드 및 해시 처리
            const applyHash = () => {
                const hash = window.location.hash.replace('#', '');
                if (hash) {
                    switchTab(hash);
                } else {
                    const defaultLink = document.querySelector('.sidebar-menu a.active') || sidebarLinks[0];
                    if (defaultLink) switchTab(defaultLink.getAttribute('data-tab'));
                }
            };

            applyHash();
            window.addEventListener('hashchange', applyHash);
        }
    }

    // GNB 현재 페이지 활성화 (모든 페이지 공통)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.gnb > li > a').forEach(link => {
        const linkFile = link.getAttribute('href').split('#')[0];
        link.closest('li').classList.toggle('active', linkFile === currentPath);
    });

    // Mobile Menu Toggle (모든 페이지 공통)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const gnbContainer = document.querySelector('.gnb-container');

    if (mobileMenuBtn && gnbContainer) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            gnbContainer.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (gnbContainer.classList.contains('active') && !gnbContainer.contains(e.target)) {
                gnbContainer.classList.remove('active');
            }
        });
    }
});
