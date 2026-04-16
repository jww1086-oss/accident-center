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
    const regionCheckboxes = document.querySelectorAll('input[name="region"]');
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

    // ── Fetch Logic ─────────────────────────────────────────────
    const fetchAccidents = async () => {
        disasterContainer.innerHTML = '<div style="padding: 100px 0; text-align: center; color: #94A3B8;">데이터를 불러오는 중입니다...</div>';
        
        // 체크박스가 없으므로 항상 전체 조회
        const isAll = true;

        try {
            let query = supabaseClient
                .from('accidents')
                .select('*')
                .order('created_at', { ascending: false });

            if (!isAll) {
                // '광주' 선택 시 '광주'와 '광주광역시' 모두 포함하여 조회 (DB 저장 방식이 다를 수 있음)
                let dbRegions = [];
                selectedRegions.forEach(r => {
                    if (r === '광주') {
                        dbRegions.push('광주');
                        dbRegions.push('광주광역시');
                    } else {
                        dbRegions.push(r);
                    }
                });
                query = query.in('region', dbRegions);
            }

            const { data, error } = await query;
            if (error) throw error;
            renderAccidents(data, isAll ? '전국' : selectedRegions.join(', '));
        } catch (error) {
            console.error("Fetch error:", error);
            disasterContainer.innerHTML = '<div style="padding: 100px 0; text-align: center; color: #E63946;">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        }
    };

    // ── Checkbox Interaction ────────────────────────────────────
    regionCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === '전국' && cb.checked) {
                regionCheckboxes.forEach(other => {
                    if (other.value !== '전국') other.checked = false;
                });
            } else if (cb.value !== '전국' && cb.checked) {
                const allCb = Array.from(regionCheckboxes).find(c => c.value === '전국');
                if (allCb) allCb.checked = false;
            }
            fetchAccidents();
        });
    });

    const renderAccidents = (data, regionLabel) => {
        if (!data || data.length === 0) {
            disasterContainer.innerHTML = `<div style="padding: 100px 0; text-align: center; color: #94A3B8;">선택된 지역(${regionLabel})에 등록된 사례가 없습니다.</div>`;
            return;
        }

        disasterContainer.innerHTML = data.map(item => {
            const imageRegex = /(?<![!\[])(?<!\[)(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))/gi;
            const imageStyle = 'style="max-width:100%; height:auto; border-radius:8px; margin:10px 0; display:block; box-shadow:0 4px 12px rgba(0,0,0,0.1);"';
            const processText = (text) => text ? text.replace(imageRegex, `<img src="$1" ${imageStyle}>`).replace(/\n/g, '<br>') : '정보 없음';

            return `
                <article class="report-card" style="position: relative;">
                    ${isAdmin ? `
                        <div class="admin-card-actions" style="position: absolute; top: 20px; right: 20px; display: flex; gap: 8px;">
                            <button type="button" class="btn-edit-action" data-id="${item.id}" style="padding: 5px 10px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 4px; font-size: 12px; cursor: pointer; color: #64748B;">수정</button>
                            <button type="button" class="btn-delete-action" data-id="${item.id}" style="padding: 5px 10px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 4px; font-size: 12px; cursor: pointer; color: #E11D48;">삭제</button>
                        </div>
                    ` : ''}
                    <div class="report-header">
                        <span class="report-region-tag">${item.region || '전체'}</span>
                        <h4 class="report-title">${item.title}</h4>
                    </div>
                    <div class="report-summary-box">
                        <strong>사고 개요:</strong><br>${processText(item.summary)}
                    </div>
                    <div class="report-grid">
                        <div class="report-group">
                            <h5><i data-lucide="alert-triangle"></i> 발생 원인</h5>
                            <div class="report-text">${processText(item.cause)}</div>
                        </div>
                        <div class="report-group">
                            <h5><i data-lucide="shield-check"></i> 예방 대책</h5>
                            <div class="report-text">${processText(item.prevention)}</div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        if (isAdmin) {
            document.querySelectorAll('.btn-edit-action').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const targetItem = data.find(it => it.id == id);
                    if (targetItem) editAccident(targetItem);
                };
            });
            document.querySelectorAll('.btn-delete-action').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    openDeleteModal(id);
                };
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
                const { error } = await supabaseClient
                    .from('accidents')
                    .delete()
                    .eq('id', id);
                if (error) throw error;

                alert("사례가 성공적으로 삭제되었습니다.");
                deleteModal.style.display = 'none';
                fetchAccidents();
            } catch (error) {
                console.error("Delete error:", error);
                alert("삭제에 실패했습니다.");
            } finally {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerText = '삭제하기';
            }
        });
    }

    // ── Form Submission ──────────────────────────────────────────
    if (disasterForm) {
        disasterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = disasterForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            const id = document.getElementById('d_id').value;
            
            // 현재 선택된 첫 번째 유효 지역을 저장용 지역으로 사용 (전국 제외)
            const activeRegion = Array.from(regionCheckboxes)
                .find(cb => cb.checked && cb.value !== '전국')?.value || '광주';
            
            const dbRegion = activeRegion === '광주' ? '광주광역시' : activeRegion;

            submitBtn.disabled = true;
            submitBtn.innerText = '처리 중...';

            const payload = {
                region: dbRegion,
                title: document.getElementById('d_title').value,
                summary: document.getElementById('d_summary').value,
                cause: document.getElementById('d_cause').value,
                prevention: document.getElementById('d_prevention').value
            };

            if (id) payload.id = parseInt(id);

            try {
                const { error } = await supabaseClient
                    .from('accidents')
                    .upsert(payload);

                if (error) throw error;

                alert(id ? "사례가 수정되었습니다." : "사례가 등록되었습니다.");
                modalOverlay.style.display = 'none';
                disasterForm.reset();
                fetchAccidents();
            } catch (error) {
                console.error("Save error:", error);
                alert("처리에 실패했습니다.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    }

    // 초기 로드
    fetchAccidents();
});
