/**
 * Q&A Board Supabase Integration
 */

const SUPABASE_URL = 'https://jtjkfkiijowzbiuxvmzv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6Sf5Pdk5IDG4j9w8ybMeSQ_jjKJYVB2';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const qnaList = document.getElementById('qnaList');
    const qnaForm = document.getElementById('qnaForm');
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // ── Load Questions ───────────────────────────────────────────
    const fetchQuestions = async () => {
        const { data, error } = await supabaseClient
            .from('qna')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching Q&A:', error);
            qnaList.innerHTML = `<tr><td colspan="5" style="padding: 100px 0; color: #EF4444;">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
            return;
        }

        renderQnaList(data);
    };

    const renderQnaList = (data) => {
        if (!data || data.length === 0) {
            qnaList.innerHTML = `<tr><td colspan="5" style="padding: 100px 0; color: #94A3B8;">등록된 질문이 없습니다.</td></tr>`;
            return;
        }

        qnaList.innerHTML = '';
        data.forEach((q, index) => {
            const date = new Date(q.created_at).toLocaleDateString();
            const statusClass = q.status === '완료' ? 'badge-completed' : 'badge-waiting';
            
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
                <td>${data.length - index}</td>
                <td><span class="badge ${statusClass}">${q.status}</span></td>
                <td class="txt-left"><strong>${q.title}</strong></td>
                <td>${q.author}</td>
                <td>${date}</td>
            `;

            // 클릭 시 상세 보기 토글
            tr.addEventListener('click', () => toggleDetail(q, tr));
            qnaList.appendChild(tr);

            // 상세 내용 Row (초기에는 숨김)
            const detailTr = document.createElement('tr');
            detailTr.className = 'qna-detail-row';
            detailTr.id = `detail-${q.id}`;
            detailTr.innerHTML = `
                <td colspan="5" style="background: #F8FAFC; padding: 0;">
                    <div style="padding: 30px;">
                        <div class="qna-content">
                            <span class="q">Q. 질문 내용</span>
                            <p>${q.content.replace(/\n/g, '<br>')}</p>
                        </div>
                        <div class="qna-answer">
                            <span class="a">A. 답변</span>
                            <p>${q.answer ? q.answer.replace(/\n/g, '<br>') : '<span style="color: #94A3B8;">관리자의 답변을 기다리고 있습니다.</span>'}</p>
                        </div>
                    </div>
                </td>
            `;
            qnaList.appendChild(detailTr);
        });
    };

    const toggleDetail = (q, row) => {
        const detailRow = document.getElementById(`detail-${q.id}`);
        const isActive = detailRow.classList.contains('active');
        
        // 모든 상세 Row 닫기 (아코디언 방식)
        document.querySelectorAll('.qna-detail-row').forEach(r => r.classList.remove('active'));
        
        if (!isActive) {
            detailRow.classList.add('active');
        }
    };

    // ── Form Submission ──────────────────────────────────────────
    if (qnaForm) {
        qnaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = qnaForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = '등록 중...';

            const formData = new FormData(qnaForm);
            const newQuestion = {
                author: formData.get('author'),
                title: formData.get('title'),
                content: formData.get('content'),
                status: '대기중'
            };

            const { error } = await supabaseClient
                .from('qna')
                .insert([newQuestion]);

            if (error) {
                alert('질문 등록 중 오류가 발생했습니다: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.innerText = '등록하기';
            } else {
                alert('질문이 성공적으로 등록되었습니다.');
                qnaForm.reset();
                modalOverlay.classList.remove('active');
                submitBtn.disabled = false;
                submitBtn.innerText = '등록하기';
                fetchQuestions(); // 목록 새로고침
            }
        });
    }

    // ── Modal Control ────────────────────────────────────────────
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    }

    // 초기 로드
    fetchQuestions();
});
