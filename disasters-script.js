/**
 * Serious Disaster Status (Accidents) Logic
 */

const supabaseUrl = 'https://jtjkfkiijowzbiuxvmzv.supabase.co';
const supabaseKey = 'sb_publishable_6Sf5Pdk5IDG4j9w8ybMeSQ_jjKJYVB2';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('admin_active') === 'true';
    const disasterContainer = document.getElementById('disasterContainer');
    const openModalBtn = document.getElementById('openDisasterModal');
    const closeModalBtn = document.getElementById('closeDisasterModal');
    const modalOverlay = document.getElementById('disasterModalOverlay');
    const disasterForm = document.getElementById('disasterForm');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-region]');
    const modalTitle = document.querySelector('#disasterModalOverlay h3');
    
    const deleteModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModal');

    // ── Admin UI Setup ──────────────────────────────────────────
    if (isAdmin && openModalBtn) {
        openModalBtn.style.display = 'block';
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            disasterForm.reset();
            document.getElementById('d_id').value = '';
            modalTitle.innerText = '중대재해 사례 등록';
            modalOverlay.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }
    
    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    }

    // ── Fetch and Render ─────────────────────────────────────────
    const fetchAccidents = async (region) => {
        disasterContainer.innerHTML = '<div style="padding: 100px 0; text-align: center; color: #94A3B8;">데이터를 불러오는 중입니다...</div>';
        
        try {
            const { data, error } = await supabaseClient
                .from('accidents')
                .select('*')
                .eq('region', region)
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderAccidents(data, region);
        } catch (error) {
            console.error("Fetch error:", error);
            disasterContainer.innerHTML = '<div style="padding: 100px 0; text-align: center; color: #E63946;">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        }
    };

    const renderAccidents = (data, region) => {
        if (!data || data.length === 0) {
            disasterContainer.innerHTML = `<div style="padding: 100px 0; text-align: center; color: #94A3B8;">${region} 지역에 등록된 사례가 없습니다.</div>`;
            return;
        }

        disasterContainer.innerHTML = data.map(item => {
            const causeList = item.cause ? item.cause.split('\n').filter(l => l.trim()).map(l => `<li>${l}</li>`).join('') : '<li>정보 없음</li>';
            const preventionList = item.prevention ? item.prevention.split('\n').filter(l => l.trim()).map(l => `<li>${l}</li>`).join('') : '<li>정보 없음</li>';
            
            return `
                <article class="report-card" style="position: relative;">
                    ${isAdmin ? `
                        <div class="admin-card-actions" style="position: absolute; top: 20px; right: 20px; display: flex; gap: 8px;">
                            <button type="button" class="btn-edit-action" data-id="${item.id}" style="padding: 5px 10px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 4px; font-size: 12px; cursor: pointer; color: #64748B;">수정</button>
                            <button type="button" class="btn-delete-action" data-id="${item.id}" style="padding: 5px 10px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 4px; font-size: 12px; cursor: pointer; color: #E11D48;">삭제</button>
                        </div>
                    ` : ''}
                    <div class="report-header">
                        <h4 class="report-title">${item.title}</h4>
                    </div>
                    <div class="report-summary-box">
                        <strong>사고 개요:</strong> ${item.summary || '상세 내용 없음'}
                    </div>
                    <div class="report-grid">
                        <div class="report-group">
                            <h5><i data-lucide="alert-triangle"></i> 발생 원인</h5>
                            <ul class="report-list">
                                ${causeList}
                            </ul>
                        </div>
                        <div class="report-group">
                            <h5><i data-lucide="shield-check"></i> 예방 대책</h5>
                            <ul class="report-list">
                                ${preventionList}
                            </ul>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // 버튼 이벤트 바인딩 (인라인 함수 대신 addeventlistener 사용)
        if (isAdmin) {
            document.querySelectorAll('.btn-edit-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const targetItem = data.find(it => it.id == id);
                    if (targetItem) editAccident(targetItem);
                });
            });
            document.querySelectorAll('.btn-delete-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    openDeleteModal(id);
                });
            });
        }

        if (window.lucide) lucide.createIcons();
    };

    // ── Admin Functions ──────────────────────────────────────────
    const editAccident = (item) => {
        document.getElementById('d_id').value = item.id;
        document.getElementById('d_title').value = item.title;
        document.getElementById('d_summary').value = item.summary || '';
        document.getElementById('d_cause').value = item.cause || '';
        document.getElementById('d_prevention').value = item.prevention || '';
        
        modalTitle.innerText = '중대재해 사례 수정';
        modalOverlay.style.display = 'flex';
    };

    const openDeleteModal = (id) => {
        document.getElementById('delete_target_id').value = id;
        deleteModal.style.display = 'flex';
    };

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            const id = document.getElementById('delete_target_id').value;
            if (!id) return;

            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerText = '삭제 중...';

            try {
                // DELETE 메서드가 차단될 경우를 대비해 Method Override (POST) 시도
                const response = await fetch(`${supabaseUrl}/rest/v1/accidents?id=eq.${id}`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'X-HTTP-Method-Override': 'DELETE',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const { error } = await supabaseClient
                        .from('accidents')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                }

                alert("사례가 성공적으로 삭제되었습니다.");
                deleteModal.style.display = 'none';
                
                const activeLink = document.querySelector('.sidebar-menu a.active');
                if (activeLink) fetchAccidents(activeLink.getAttribute('data-region'));
            } catch (error) {
                console.error("Delete error:", error);
                alert("삭제에 실패했습니다. (원인: " + error.message + ")");
            } finally {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerText = '삭제하기';
            }
        });
    }

    // ── Sidebar Region Interaction ──────────────────────────────
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const region = link.getAttribute('data-region');
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            fetchAccidents(region);
        });
    });

    // ── Form Submission (Register/Update) ──────────────────────────
    if (disasterForm) {
        disasterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = disasterForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            const id = document.getElementById('d_id').value;
            
            submitBtn.disabled = true;
            submitBtn.innerText = '처리 중...';

            const activeLink = document.querySelector('.sidebar-menu a.active');
            const currentRegion = activeLink ? activeLink.getAttribute('data-region') : '광주';

            const payload = {
                region: currentRegion,
                title: document.getElementById('d_title').value,
                summary: document.getElementById('d_summary').value,
                cause: document.getElementById('d_cause').value,
                prevention: document.getElementById('d_prevention').value,
                category: '' 
            };

            if (id) payload.id = parseInt(id);

            try {
                const { error } = await supabaseClient
                    .from('accidents')
                    .upsert(payload);

                if (error) throw error;

                alert(id ? "사례가 수정되었습니다." : "중대재해 사례가 등록되었습니다.");
                modalOverlay.style.display = 'none';
                disasterForm.reset();
                if (activeLink) fetchAccidents(activeLink.getAttribute('data-region'));
            } catch (error) {
                console.error("Save error:", error);
                alert("처리에 실패했습니다. (원인: " + error.message + ")");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    }

    const initialRegion = document.querySelector('.sidebar-menu a.active')?.getAttribute('data-region') || '광주';
    fetchAccidents(initialRegion);
});
