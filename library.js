document.addEventListener('DOMContentLoaded', () => {
    // === 초기 시드(Seed) 데이터 ===
    const seedData = [
        {
            id: 'res-1',
            type: 'tech',
            title: '[기술지침] 고소작업대 작업계획서 표준서식 (고용노동부)',
            format: 'HWP',
            size: '3.2MB',
            date: '2026-04-14',
            downloadUrl: 'https://drive.google.com/uc?export=download&id=1cONtV7X-l1s7PXrg3xB2LA_hsspNtkBj'
        },
        {
            id: 'res-2',
            type: 'tech',
            title: '[기술지침] 2026 건설공사 추락사고 예방 기술 가이드 기술 가이드',
            format: 'PDF',
            size: '15.2MB',
            date: '2026-03-10',
            downloadUrl: '#'
        },
        {
            id: 'res-3',
            type: 'tech',
            title: '[정밀조사] 기계설비 끼임 사고 원인 분석 및 대책 사례집',
            format: 'PDF',
            size: '8.5MB',
            date: '2026-02-28',
            downloadUrl: '#'
        },
        {
            id: 'res-4',
            type: 'tech',
            title: '산업재해 원인조사 데이터 연보 (2025년 기준)',
            format: 'XLSX',
            size: '4.2MB',
            date: '2026-01-15',
            downloadUrl: '#'
        },
        {
            id: 'res-5',
            type: 'manual',
            title: '[매뉴얼] 사업장 자기율 자율 예방 체계 구축 실무 가이드',
            format: 'PDF',
            size: '22.0MB',
            date: '2026-03-20',
            downloadUrl: '#'
        },
        {
            id: 'res-6',
            type: 'manual',
            title: '위험성평가 실시 및 사후관리 체크리스트 양식',
            format: 'DOCX',
            size: '1.1MB',
            date: '2026-03-05',
            downloadUrl: '#'
        }
    ];

    // === 로컬 스토리지 초기화 ===
    if (!localStorage.getItem('libraryData')) {
        localStorage.setItem('libraryData', JSON.stringify(seedData));
    }

    // === 렌더링 함수 ===
    const renderLibrary = () => {
        const data = JSON.parse(localStorage.getItem('libraryData')) || [];
        const isAdmin = localStorage.getItem('admin_active') === 'true';

        // 컨테이너 비우기
        const techGrid = document.querySelector('#lib-tech .resource-grid');
        const manualGrid = document.querySelector('#lib-manual .resource-grid');
        
        if (techGrid) techGrid.innerHTML = '';
        if (manualGrid) manualGrid.innerHTML = '';

        // 전역 어드민 UI 토글
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        data.forEach(item => {
            // 아이콘 매핑
            let iconCode = 'file-text';
            if (item.format === 'XLSX') iconCode = 'database';
            if (item.title.includes('체크리스트')) iconCode = 'check-square';
            if (item.type === 'manual' && item.format === 'PDF') iconCode = 'book-open';

            const adminDeleteHTML = isAdmin ? `<button class="btn-admin-delete" data-id="${item.id}" title="자료 삭제"><i data-lucide="trash-2"></i></button>` : '';

            const cardHTML = `
                <div class="resource-card" style="position:relative;">
                    ${adminDeleteHTML}
                    <i data-lucide="${iconCode}" class="file-icon"></i>
                    <h4>${item.title}</h4>
                    <p class="meta">${item.format} | ${item.size} | ${item.date}</p>
                    <a href="${item.downloadUrl}" target="${item.downloadUrl === '#' ? '_self' : '_blank'}" class="btn-download"><i data-lucide="download" style="width:14px; margin-right:5px;"></i> 📄 서식 다운로드</a>
                </div>
            `;

            if (item.type === 'tech' && techGrid) techGrid.insertAdjacentHTML('beforeend', cardHTML);
            if (item.type === 'manual' && manualGrid) manualGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Lucide 아이콘 재렌더링
        if (window.lucide) lucide.createIcons();
    };

    // === 초기 렌더링 ===
    renderLibrary();

    // === 삭제 기능 위임 ===
    document.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-admin-delete');
        if (deleteBtn) {
            if(confirm('이 자료를 삭제하시겠습니까?')) {
                const id = deleteBtn.getAttribute('data-id');
                let data = JSON.parse(localStorage.getItem('libraryData')) || [];
                data = data.filter(item => item.id !== id);
                localStorage.setItem('libraryData', JSON.stringify(data));
                renderLibrary();
            }
        }
    });

    // === 관리자 모달 및 추가 기능 ===
    const addModal = document.getElementById('adminAddModal');
    const openAddBtns = document.querySelectorAll('.open-add-modal');
    const closeAddBtn = document.getElementById('closeAddModal');
    const addForm = document.getElementById('adminAddForm');

    openAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTab = document.querySelector('.tab-content.active-tab').id;
            document.getElementById('resType').value = currentTab === 'lib-tech' ? 'tech' : 'manual';
            addModal.style.display = 'flex';
        });
    });

    if (closeAddBtn) {
        closeAddBtn.addEventListener('click', () => { addModal.style.display = 'none'; });
    }

    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('resTitle').value;
            const driveUrl = document.getElementById('resLink').value;
            const type = document.getElementById('resType').value;
            const format = document.getElementById('resFormat').value;

            // 구글 드라이브 ID 추출
            let driveId = driveUrl;
            const match = driveUrl.match(/(?:d\/|id=)([\w-]{25,})/);
            if (match && match[1]) {
                driveId = match[1];
            }

            const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
            const date = new Date().toISOString().split('T')[0];

            const newItem = {
                id: 'res-' + Date.now(),
                type: type,
                title: title,
                format: format,
                size: '알 수 없음',
                date: date,
                downloadUrl: downloadUrl
            };

            let data = JSON.parse(localStorage.getItem('libraryData')) || [];
            data.unshift(newItem); // 맨 앞에 추가
            localStorage.setItem('libraryData', JSON.stringify(data));

            renderLibrary();
            addForm.reset();
            addModal.style.display = 'none';
        });
    }

    // 전역에서 Admin 활성화 시 렌더링하도록 구독 (간단한 타이머/MutationObserver 기반으로)
    let lastAdminState = localStorage.getItem('admin_active');
    setInterval(() => {
        if (localStorage.getItem('admin_active') !== lastAdminState) {
            lastAdminState = localStorage.getItem('admin_active');
            renderLibrary();
        }
    }, 1000);
});
