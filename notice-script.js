/**
 * Notice Board (알림마당) Supabase 연동 스크립트
 */

const supabaseUrlNotice = 'https://jtjkfkiijowzbiuxvmzv.supabase.co';
const supabaseKeyNotice = 'sb_publishable_6Sf5Pdk5IDG4j9w8ybMeSQ_jjKJYVB2';

// 전역 스코프에 없으면 생성 방지 (충돌 주의)
const supabaseNotice = window.supabase ? window.supabase.createClient(supabaseUrlNotice, supabaseKeyNotice) : null;

document.addEventListener('DOMContentLoaded', () => {
    if (!supabaseNotice) {
        console.error("Supabase SDK가 로드되지 않았습니다.");
        return;
    }

    const tbody = document.getElementById('notice-list-body');
    const addModal = document.getElementById('noticeAddModal');
    const openAddBtns = document.querySelectorAll('.open-notice-add');
    const closeAddBtn = document.getElementById('closeNoticeAdd');
    const addForm = document.getElementById('noticeAddForm');
    
    // 리스트 뷰 영역
    const listView = document.getElementById('notice-list-view');
    // 상세 뷰 영역
    const detailView = document.getElementById('notice-detail-view');

    const renderNotices = async () => {
        const isAdmin = localStorage.getItem('admin_active') === 'true';

        // Admin 버튼 토글
        const adminElements = document.querySelectorAll('.admin-only-notice');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4">데이터를 불러오는 중입니다...</td></tr>';
        }

        // Supabase에서 데이터 가져오기 (is_notice 내림차순 -> 공지 우선, 그 다음 id 내림차순 -> 최신순)
        const { data, error } = await supabaseNotice
            .from('notices')
            .select('*')
            .order('is_notice', { ascending: false })
            .order('id', { ascending: false });

        if (error) {
            console.error(error);
            if(tbody) tbody.innerHTML = '<tr><td colspan="4">통신 에러가 발생했습니다.</td></tr>';
            return;
        }

        if (!data || data.length === 0) {
            if(tbody) tbody.innerHTML = '<tr><td colspan="4">등록된 공지사항이 없습니다.</td></tr>';
            return;
        }

        let html = '';
        data.forEach((item, index) => {
            // 유효성 검증 (사용자가 임의로 테이블을 만들어서 예약된 컬럼이 없을 경우를 대비한 방어코드)
            const isNotice = item.is_notice === true || item.is_notice === 'true';
            
            // ID가 UUID처럼 길게 나오면 단순 순번으로 대체
            const isUUID = typeof item.id === 'string' && item.id.length > 10;
            const displayId = isUUID ? (data.length - index) : item.id;
            const bdgHTML = isNotice ? `<span class="badge badge-notice">공지</span>` : displayId;
            
            // date 컬럼이 없으면 created_at 컬럼을 사용, 그것도 없으면 '최근'으로 표시
            const rawDate = item.date || item.created_at || new Date().toISOString();
            const cleanDate = rawDate.split('T')[0];
            
            // 날짜 비교 (3일 이내면 N 뱃지)
            const itemDate = new Date(cleanDate);
            const now = new Date();
            const isRecent = (now - itemDate) / (1000 * 60 * 60 * 24) <= 3;
            const newIcon = isRecent ? `<span class="badge badge-new" style="margin-left: 5px;">N</span>` : '';

            // 제목 처리
            const catBadge = item.category && item.category !== '일반공지' ? `<span style="color:#2563eb; font-weight:bold; margin-right:5px;">[${item.category}]</span>` : '';
            const titleHTML = isNotice ? `<strong>${catBadge}${item.title || '제목 없음'}</strong>` : `${catBadge}${item.title || '제목 없음'}`;

            // 관리자 수정/삭제 버튼
            const editBtn = isAdmin ? `<button class="btn-notice-edit" data-id="${item.id}" style="border:none; background:#2563eb; color:white; padding:2px 6px; border-radius:3px; margin-left:10px; cursor:pointer;" title="수정"><i data-lucide="edit-3" style="width:12px;"></i></button>` : '';
            const delBtn = isAdmin ? `<button class="btn-notice-delete" data-id="${item.id}" style="border:none; background:red; color:white; padding:2px 6px; border-radius:3px; margin-left:5px; cursor:pointer;" title="삭제"><i data-lucide="trash-2" style="width:12px;"></i></button>` : '';

            // 조회수 방어코드
            const viewsCount = item.views !== undefined ? item.views : 0;

            html += `
                <tr class="notice-row" data-id="${item.id}" style="cursor: pointer;">
                    <td data-label="번호">${bdgHTML}</td>
                    <td data-label="제목" class="txt-left">${titleHTML} ${newIcon} ${editBtn}${delBtn}</td>
                    <td data-label="작성일">${cleanDate}</td>
                    <td data-label="조회수" class="view-count-${item.id}">${viewsCount}</td>
                </tr>
            `;
        });
        
        if(tbody) tbody.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    };

    // 최초 렌더링
    renderNotices();

    // ── 이벤트 위임 ──────────────────────────────────────────
    document.addEventListener('click', async (e) => {
        // 1. 관리자 글 삭제 기능
        const delBtn = e.target.closest('.btn-notice-delete');
        if (delBtn) {
            e.stopPropagation(); // 행 클릭 방지
            if(confirm('이 공지사항을 삭제하시겠습니까?')) {
                const id = delBtn.getAttribute('data-id');
                const { error } = await supabaseNotice.from('notices').delete().eq('id', id);
                if (error) alert("삭제 중 오류가 발생했습니다.");
                else renderNotices();
            }
            return;
        }

        // 1.5. 관리자 글 수정 기능
        const editBtn = e.target.closest('.btn-notice-edit');
        if (editBtn) {
            e.stopPropagation();
            const id = editBtn.getAttribute('data-id');
            editNoticeData(id);
            return;
        }

        // 2. 글 상세 보기 (행 클릭)
        const row = e.target.closest('.notice-row');
        if (row && !e.target.closest('button')) {
            const id = row.getAttribute('data-id');
            showDetailView(id);
        }
    });

    // 상세 보기 함수
    const showDetailView = async (id) => {
        // 조회수 1 증가
        const { data: viewData, error: viewError } = await supabaseNotice.rpc('increment_notice_views', { row_id: id });
        // NOTE: rpc가 없으면 단순 update로 처리 (RLS를 위해 프론트에서 +1)
        if (viewError && viewError.code === "PGRST202") {
            // RPC 함수가 생성되지 않았을 경우, 수동으로 +1 시도 (원래는 동시성 고려해야 함)
            const countTD = document.querySelector(`.view-count-${id}`);
            const curViews = parseInt(countTD ? countTD.innerText : 0);
            await supabaseNotice.from('notices').update({ views: curViews + 1 }).eq('id', id);
        }

        // 데이터 다시 불러오기
        const { data, error } = await supabaseNotice.from('notices').select('*').eq('id', id).single();
        if (error || !data) {
            alert("게시글을 불러올 수 없습니다.");
            return;
        }

        // 뷰어 DOM 세팅
        const displayCategory = data.category && data.category !== '일반공지' ? `[${data.category}] ` : '';
        document.getElementById('detail-title').innerText = displayCategory + (data.title || '제목 없음');
        
        // 관리자용 뷰어 내 수정버튼 지원
        if(localStorage.getItem('admin_active') === 'true') {
            const detailActions = document.querySelector('.page-actions');
            if(detailActions && !document.getElementById('detail-edit-btn')) {
                const ebtn = document.createElement('button');
                ebtn.className = 'action-btn';
                ebtn.id = 'detail-edit-btn';
                ebtn.title = '수정하기';
                ebtn.innerHTML = '<i data-lucide="edit"></i>';
                ebtn.onclick = () => { editNoticeData(id); };
                detailActions.insertBefore(ebtn, detailActions.firstChild);
            } else if(document.getElementById('detail-edit-btn')) {
                document.getElementById('detail-edit-btn').onclick = () => { editNoticeData(id); };
            }
        }
        
        // 마크다운 파싱 (marked 라이브러리 사용)
        let content = data.content || '';
        
        // 이미지 URL 자동 감지 (http... .png/jpg/etc 를 ![image](url)로 변환)
        // 단, 이미 ![ ] ( ) 또는 [ ] ( ) 형식이 아닌 경우에만 변환
        const imageRegex = /(?<![!\[])(?<!\[)(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))/gi;
        content = content.replace(imageRegex, '![]($1)');

        const parsedHTML = window.marked && window.marked.parse ? window.marked.parse(content) : content.replace(/\n/g, '<br>');
        
        // 이미지 스타일 보정 (이미지가 너무 크면 본문을 튀어나오지 않게)
        const finalHTML = `<div class="markdown-body">${parsedHTML}</div><style>.markdown-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }</style>`;
        
        // 첨부파일 영역 추가
        let fileHTML = '';
        if (data.file_url) {
            fileHTML = `
                <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
                    <strong style="color: #475569; display:block; margin-bottom:10px;"><i data-lucide="paperclip" style="width:16px;"></i> 첨부자료 다운로드</strong>
                    <a href="${data.file_url}" target="_blank" style="display:inline-flex; align-items:center; gap:5px; background:white; border:1px solid #cbd5e1; padding:8px 12px; border-radius:4px; color:#2563eb; font-weight:bold; text-decoration:none;">
                        <i data-lucide="download" style="width:14px;"></i> ${data.file_name || '파일 다운로드'}
                    </a>
                </div>
            `;
        }

        document.getElementById('detail-content').innerHTML = finalHTML + fileHTML;

        // 리스트 숨기고 상세 보이기
        listView.style.display = 'none';
        detailView.style.display = 'block';
    };

    // 상세 뷰에서 리스트로 돌아가기
    window.backToNoticeList = function() {
        detailView.style.display = 'none';
        listView.style.display = 'block';
        // 목록 최신화(조회수 갱신 위함)
        renderNotices();
    };


    // ── 어드민 등록/수정 모달 ──────────────────────────────────────────
    let noticeEditor = null;
    let currentEditNoticeId = null; // 수정 모드 식별자

    // 수정 창 띄우기 함수
    const editNoticeData = async (id) => {
        const { data, error } = await supabaseNotice.from('notices').select('*').eq('id', id).single();
        if (error || !data) return alert("데이터를 불러오는 데 실패했습니다.");

        currentEditNoticeId = id;
        document.querySelector('#noticeAddModal h3').innerText = "공지사항 수정";
        document.getElementById('notTitle').value = data.title;
        document.getElementById('notIsNotice').checked = data.is_notice;
        if(document.getElementById('notCategory')) document.getElementById('notCategory').value = data.category || '일반공지';
        
        addModal.style.display = 'flex';
        
        if (!noticeEditor && document.getElementById('notContent')) {
            try {
                noticeEditor = new EasyMDE({ element: document.getElementById('notContent'), spellChecker: false, status: false, minHeight: "300px" });
            } catch(e) {}
        }
        
        if (noticeEditor) {
            noticeEditor.value(data.content);
        } else {
            document.getElementById('notContent').value = data.content;
        }
    };

    if (openAddBtns.length > 0) {
        openAddBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentEditNoticeId = null;
                document.querySelector('#noticeAddModal h3').innerText = "새 공지사항 작성";
                addModal.style.display = 'flex';
                // EasyMDE 최초 1회 로드
                if (!noticeEditor && document.getElementById('notContent')) {
                    try {
                        noticeEditor = new EasyMDE({ 
                            element: document.getElementById('notContent'),
                            spellChecker: false,
                            status: false,
                            minHeight: "300px"
                        });
                    } catch(e) { console.warn("EasyMDE load failed", e); }
                }
            });
        });
    }

    if (closeAddBtn) {
        closeAddBtn.addEventListener('click', () => { 
            addModal.style.display = 'none'; 
            addForm.reset(); 
            if (noticeEditor) noticeEditor.value('');
            currentEditNoticeId = null;
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isNotice = document.getElementById('notIsNotice').checked;
            const category = document.getElementById('notCategory') ? document.getElementById('notCategory').value : '일반공지';
            const title = document.getElementById('notTitle').value;
            const content = noticeEditor ? noticeEditor.value() : document.getElementById('notContent').value;
            const fileInput = document.getElementById('notFile');
            
            if (!content.trim()) {
                alert("본문 내용을 입력해 주세요.");
                return;
            }

            const submitBtn = addForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "저장 중...";

            let fileUrl = null;
            let fileName = null;

            // 파일 업로드 처리
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabaseNotice.storage
                    .from('notices_files')
                    .upload('public/' + uniqueFileName, file);

                if (uploadError) {
                    alert("파일 업로드 중 오류가 발생했습니다: " + uploadError.message);
                    submitBtn.disabled = false;
                    submitBtn.innerText = "등록하기";
                    return;
                }

                const { data: urlData } = supabaseNotice.storage
                    .from('notices_files')
                    .getPublicUrl('public/' + uniqueFileName);
                    
                fileUrl = urlData.publicUrl;
                fileName = file.name;
            }

            const insertData = {
                title: title,
                content: content,
                is_notice: isNotice,
                category: category
            };
            if(fileUrl) {
                insertData.file_url = fileUrl;
                insertData.file_name = fileName;
            }

            let error;
            if (currentEditNoticeId) {
                // 수정
                const res = await supabaseNotice.from('notices').update(insertData).eq('id', currentEditNoticeId);
                error = res.error;
            } else {
                // 등록
                const res = await supabaseNotice.from('notices').insert([insertData]);
                error = res.error;
            }

            if (error) {
                alert("처리 중 오류가 발생했습니다: " + error.message);
                console.error(error);
            } else {
                alert(currentEditNoticeId ? "게시글이 성공적으로 수정되었습니다." : "성공적으로 등록되었습니다.");
                addModal.style.display = 'none';
                addForm.reset();
                if(noticeEditor) noticeEditor.value('');
                currentEditNoticeId = null;
                renderNotices();
                // 만약 에디트 중에 상세뷰가 떠있다면 상세뷰도 갱신
                if(detailView.style.display === 'block') {
                    showDetailView(currentEditNoticeId || document.querySelector('.notice-row').getAttribute('data-id')); // 갱신
                    // 단, 위 id는 부정확할수있으니 그냥 목록으로 돌리는게 안전함
                    backToNoticeList();
                }
            }

            submitBtn.disabled = false;
            submitBtn.innerText = "등록하기";
        });
    }

    // 전역 상태 실시간 감지 (타이머)
    let lastAdminState = localStorage.getItem('admin_active');
    setInterval(() => {
        if (localStorage.getItem('admin_active') !== lastAdminState) {
            lastAdminState = localStorage.getItem('admin_active');
            renderNotices();
        }
    }, 1000);
});
