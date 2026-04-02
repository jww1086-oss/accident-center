/**
 * Q&A Page Supabase Logic
 */

const supabaseClient = supabase.createClient(
    'https://jtjkfkiijowzbiuxvmzv.supabase.co',
    'sb_publishable_6Sf5Pdk5IDG4j9w8ybMeSQ_jjKJYVB2'
);

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
            
            return `
                <tr class="qna-row" onclick="toggleQnaDetail(${q.id})">
                    <td data-label="번호">${data.length - index}</td>
                    <td data-label="상태"><span class="badge ${statusClass}">${q.status}</span></td>
                    <td data-label="제목" class="txt-left">
                        <strong>${q.title}</strong>
                        ${isAdmin ? `<button class="btn-admin-reply" onclick="event.stopPropagation(); showAnswerForm(${q.id})">답변하기</button>` : ''}
                    </td>
                    <td data-label="작성자">${q.author}</td>
                    <td data-label="등록일">${date}</td>
                </tr>
                <tr id="detail-${q.id}" class="qna-detail-row" style="display: none;">
                    <td colspan="5" style="padding: 0;">
                        <div class="qna-content">
                            <div class="qna-question">
                                <strong class="q-label"><i data-lucide="help-circle"></i> Q. 질문 내용</strong>
                                <p>${q.content.replace(/\n/g, '<br>')}</p>
                            </div>
                            ${q.answer ? `
                            <div class="qna-answer">
                                <strong class="a-label"><i data-lucide="message-square"></i> A. 답변</strong>
                                <p>${q.answer.replace(/\n/g, '<br>')}</p>
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
                const { error } = await supabaseClient
                    .from('qna')
                    .insert([{ title, author, content, status: '대기중' }]);

                if (error) throw error;
                alert("질문이 성공적으로 등록되었습니다.");
                modalOverlay.style.display = 'none';
                qnaForm.reset();
                fetchQuestions();
            } catch (error) {
                console.error("Insert error:", error);
                alert("등록에 실패했습니다.");
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

            console.log(`Submitting answer for ID ${id} using safe upsert...`);
            
            // 모든 기존 필드를 포함하여 upsert 수행 (POST 메서드 사용으로 CORS 우회)
            const { error } = await supabaseClient
                .from('qna')
                .upsert({ 
                    ...existingData,
                    answer: answer, 
                    status: '완료' 
                });

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
