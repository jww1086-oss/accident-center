/**
 * Q&A Board (질의응답) Supabase 연동 스크립트
 */
console.log("✅ Q&A 스크립트 최신 버전 로드됨 (2026-04-22_FINAL)");

const supabaseUrl = 'https://jtjkfkiijowzbiuxvmzv.supabase.co';
const supabaseKey = 'sb_publishable_6Sf5Pdk5IDG4j9w8ybMeSQ_jjKJYVB2';

// 전역 스코프에 없으면 생성 방지
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

document.addEventListener('DOMContentLoaded', () => {
    const qnaList = document.getElementById('qnaList');
    const qnaForm = document.getElementById('qnaForm');
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // ── Modal Actions ──────────────────────────────────────────
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }

    // ── Fetch and Render ─────────────────────────────────────────
    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('qna')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderQnaList(data);
        } catch (error) {
            console.error("Fetch error:", error);
            if (qnaList) qnaList.innerHTML = `<tr><td colspan="5" style="padding: 100px 0; color: #E63946;">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
        }
    };

    const renderQnaList = (data) => {
        const isAdmin = localStorage.getItem('admin_active') === 'true';
        if (isAdmin) {
            document.body.classList.add('admin-active');
        }

        if (!data || data.length === 0) {
            qnaList.innerHTML = `<tr><td colspan="5" style="padding: 100px 0; color: #94A3B8;">등록된 질문이 없습니다.</td></tr>`;
            return;
        }

        qnaList.innerHTML = data.map((q, index) => {
            const date = new Date(q.created_at).toLocaleDateString();
            const statusClass = q.status === '완료' ? 'completed' : 'pending';
            
            const imageRegex = /(?<![!\[])(?<!\[)(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))/gi;
            const contentHTML = q.content.replace(imageRegex, '<img src="$1" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0; display:block; shadow:0 4px 12px rgba(0,0,0,0.1);">').replace(/\n/g, '<br>');
            const answerHTML = q.answer ? q.answer.replace(imageRegex, '<img src="$1" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0; display:block; shadow:0 4px 12px rgba(0,0,0,0.1);">').replace(/\n/g, '<br>') : '';

            return `
                <tr class="qna-row" onclick="toggleQnaDetail(${q.id})">
                    <td data-label="번호">${data.length - index}</td>
                    <td data-label="상태"><span class="badge ${statusClass}">${q.status}</span></td>
                    <td data-label="제목" class="txt-left">
                        <strong>${q.title}</strong>
                        ${isAdmin ? `<button class="btn-admin-reply" onclick="event.stopPropagation(); showAnswerForm(${q.id})" style="margin-left: 10px;">답변하기</button>` : ''}
                        ${isAdmin ? `<button class="btn-admin-edit" onclick="event.stopPropagation(); editQnaOriginal(${q.id})" style="border:none; background:#10b981; color:white; padding:4px 8px; border-radius:3px; margin-left:5px; cursor:pointer;" title="원문수정"><i data-lucide="edit" style="width:14px; height:14px;"></i></button>` : ''}
                        ${isAdmin ? `<button class="btn-admin-delete" onclick="event.stopPropagation(); deleteQna(${q.id})" style="border:none; background:red; color:white; padding:4px 8px; border-radius:3px; margin-left:5px; cursor:pointer;" title="삭제"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>` : ''}
                    </td>
                    <td data-label="작성자">${q.author}</td>
                    <td data-label="등록일">${date}</td>
                </tr>
                <tr id="detail-${q.id}" class="qna-detail-row" style="display: none;">
                    <td colspan="5" style="padding: 0;">
                        <div class="qna-content">
                            <div class="qna-question">
                                <strong class="q-label"><i data-lucide="help-circle"></i> Q. 질문 내용</strong>
                                <p>${contentHTML}</p>
                            </div>
                            ${q.answer ? `
                            <div class="qna-answer">
                                <strong class="a-label"><i data-lucide="message-square"></i> A. 답변</strong>
                                <p>${answerHTML}</p>
                            </div>
                            ` : isAdmin ? '' : '<div class="qna-answer-pending">A. 관리자의 답변을 기다리고 있습니다.</div>'}
                            <div id="answer-form-container-${q.id}"></div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        if (window.lucide) lucide.createIcons();
    };

    window.toggleQnaDetail = (id) => {
        const detailRow = document.getElementById(`detail-${id}`);
        if (!detailRow) return;
        const isVisible = detailRow.style.display === 'table-row';
        document.querySelectorAll('.qna-detail-row').forEach(row => row.style.display = 'none');
        if (!isVisible) detailRow.style.display = 'table-row';
    };

    // ── Form Submit ──────────────────────────────────────────
    if (qnaForm) {
        qnaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('q_title').value;
            const author = document.getElementById('q_author').value;
            const content = document.getElementById('q_content').value;

            try {
                let errorObj;
                if (window.currentEditQnaId) {
                    // 수정 모드
                    const { error } = await supabaseClient
                        .from('qna')
                        .update({ title, author, content })
                        .eq('id', window.currentEditQnaId);
                    errorObj = error;
                } else {
                    // 신규 작성 모드
                    const { error } = await supabaseClient
                        .from('qna')
                        .insert([{ title, author, content, status: '대기중' }]);
                    errorObj = error;
                }

                if (errorObj) throw errorObj;
                
                alert(window.currentEditQnaId ? "질문이 성공적으로 수정되었습니다." : "질문이 성공적으로 등록되었습니다.");
                modalOverlay.style.display = 'none';
                qnaForm.reset();
                window.currentEditQnaId = null;
                fetchQuestions();
            } catch (error) {
                console.error("Submit error:", error);
                alert("등록 중 오류가 발생했습니다.\n상세: " + (error.message || JSON.stringify(error)));
            }
        });
    }

    fetchQuestions();
});

// ── 답변 등록 관련 함수 ──────────────────────────────

function showAnswerForm(id) {
    const container = document.getElementById(`answer-form-container-${id}`);
    const detailRow = document.getElementById(`detail-${id}`);
    if (detailRow) detailRow.style.display = 'table-row';
    
    container.innerHTML = `
        <div class="answer-form" onclick="event.stopPropagation()">
            <textarea id="answer-input-${id}" placeholder="답변 내용을 입력하세요..." style="width:100%; min-height:120px; padding:12px; border:2px solid #E2E8F0; border-radius:8px; margin-bottom:12px; font-family:inherit;"></textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-btn-${id}" style="padding:10px 20px; background:#F1F5F9; color:#64748B; border:none; border-radius:6px; cursor:pointer; font-weight:600;">취소</button>
                <button id="submit-btn-${id}" style="padding:10px 20px; background:#0047A0; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:5px;">
                    <i data-lucide="send" style="width:16px;"></i> 답변 등록
                </button>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    // 이벤트 리스너 등록
    const submitBtn = document.getElementById(`submit-btn-${id}`);
    const cancelBtn = document.getElementById(`cancel-btn-${id}`);
    const textarea = document.getElementById(`answer-input-${id}`);

    cancelBtn.addEventListener('click', () => {
        container.innerHTML = '';
    });

    submitBtn.addEventListener('click', async () => {
        const answer = textarea.value;
        if (!answer.trim()) return alert("답변 내용을 입력해 주세요.");

        // 버튼 상태 변경 (로딩)
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px;"></i> 등록 중...';
        if (window.lucide) lucide.createIcons();

        try {
            console.log(`Fetching existing data for ID ${id} before upsert...`);
            
            // 기존 데이터 가져오기 (필수 필드 누락 방지)
            const { data: existingData, error: fetchError } = await supabaseClient
                .from('qna')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) {
                console.error("Fetch Error:", fetchError);
                throw new Error("기존 데이터를 가져오지 못했습니다.");
            }

            console.log(`Submitting answer for ID ${id} using update...`);
            
            const { error } = await supabaseClient
                .from('qna')
                .update({ answer: answer, status: '완료' })
                .eq('id', id);

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            alert("답변이 성공적으로 등록되었습니다.");
            location.reload();
        } catch (error) {
            console.error("Detailed Error:", error);
            let msg = "답변 등록에 실패했습니다.";
            if (error.message) msg += `\n(원인: ${error.message})`;
            alert(msg);
            
            // 버튼 상태 복구
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = '<i data-lucide="send" style="width:16px;"></i> 답변 등록';
            if (window.lucide) lucide.createIcons();
        }
    });

    textarea.focus();
}

// ── 게시글 삭제 기능 ──────────────────────────────
window.deleteQna = async (id) => {
    console.log("🗑️ 삭제 버튼 클릭됨! (ID:", id, ")");
    if (!confirm('정말로 이 질의응답 게시글을 삭제하시겠습니까?')) {
        console.log("❌ 삭제 취소됨 (또는 브라우저가 알림창을 강제 차단함)");
        return;
    }
    
    console.log("진행 승인됨. Supabase에 삭제 요청 전송 중...");
    try {
        const { error } = await supabaseClient.from('qna').delete().eq('id', id);
        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }
        
        console.log("✅ 삭제 성공! 페이지 새로고침 예약...");
        alert("게시글이 삭제되었습니다.");
        location.reload();
    } catch (error) {
        console.error("Delete Error:", error);
        alert("삭제 중 오류가 발생했습니다.");
    }
};

// ── 게시글 원문(질문) 수정 기능 ──────────────────────────────
window.currentEditQnaId = null;

window.editQnaOriginal = async (id) => {
    try {
        const { data, error } = await supabaseClient.from('qna').select('*').eq('id', id).single();
        if (error || !data) throw error;

        window.currentEditQnaId = id;
        document.querySelector('.qna-modal h3').innerText = "원문 수정";
        document.getElementById('q_author').value = data.author;
        document.getElementById('q_title').value = data.title;
        document.getElementById('q_content').value = data.content;
        
        const overlay = document.getElementById('modalOverlay');
        if(overlay) overlay.style.display = 'flex';
        
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("데이터를 가져오는 중 오류가 발생했습니다.");
    }
};

// 원문 폼 닫기 시 작성모드로 복구
document.addEventListener('DOMContentLoaded', () => {
    const btnCancel = document.getElementById('closeModalBtn');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            window.currentEditQnaId = null;
            document.querySelector('.qna-modal h3').innerText = "질문하기";
        });
    }
});
