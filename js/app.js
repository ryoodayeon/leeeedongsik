// API 기본 URL (환경에 따라 자동 설정)
// 개발 환경: localhost, 프로덕션: 현재 호스트
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    // localhost 또는 127.0.0.1이면 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // 프로덕션 환경: 현재 호스트 사용
    return `${window.location.protocol}//${window.location.host}/api`;
})();

// 페이지 전환
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCouponPanels();
    initResetButtons();
    initAddButtons();
    loadCoupons();
    initCoupons();
    initResume();
    initBackButton();
    initURLRouting();
    initGuestbook();
    initHomeNavLinks();
    initScrollToTopButtons();
});

// 위로가기 버튼 초기화
function initScrollToTopButtons() {
    const scrollTopButtons = document.querySelectorAll('.scroll-to-top-btn');
    scrollTopButtons.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper && !charWrapper.hasAttribute('data-initialized')) {
            charWrapper.setAttribute('data-initialized', 'true');
            const text = charWrapper.textContent || '위로가기';
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
}

// 네비게이션 초기화
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .page-link, .resume-index-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
}

// 뒤로가기 버튼 초기화
function initBackButton() {
    const backButtons = document.querySelectorAll('.back-button-btn');
    backButtons.forEach(backButton => {
        // 텍스트를 음절 단위로 분리
        const charWrapper = backButton.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
        
        // 클릭 이벤트 (이미 onclick이 있으면 추가하지 않음)
        if (!backButton.onclick) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                showPage('home');
            });
        }
    });
}

// 페이지 표시
function showPage(pageName) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 모바일에서 쿠폰 페이지 전환 처리
    const isMobile = window.innerWidth <= 768;
    if (isMobile && pageName === 'coupons-status') {
        // 모바일에서는 모바일 페이지로 이동
        pageName = 'coupons-status-mobile';
    }
    
    // 선택된 페이지 표시
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 매뉴얼 페이지로 이동할 때 스크롤을 맨 위로 초기화
        if (pageName === 'manual') {
            setTimeout(() => {
                targetPage.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
            }, 10);
        }
        
        // 모바일 쿠폰 페이지로 이동할 때 스크롤을 맨 위로 초기화 및 콘텐츠 초기화
        if (pageName === 'coupons-status-mobile') {
            setTimeout(() => {
                targetPage.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
                const contentDiv = document.getElementById('coupon-content-display-mobile');
                if (contentDiv) {
                    contentDiv.innerHTML = '';
                    updateCouponMobileButtons();
                }
                
                // has-completed 클래스 제거 (초기 상태로 복원)
                targetPage.classList.remove('has-completed');
                
                // 모든 쿠폰 링크에서 active 클래스 제거
                const couponLinks = document.querySelectorAll('.coupon-index-link');
                couponLinks.forEach(link => link.classList.remove('active'));
                
                // 모든 리스트 항목에서 정렬 클래스 제거
                const couponListItems = document.querySelectorAll('.coupon-index-list li');
                couponListItems.forEach(li => {
                    li.classList.remove('coupon-item-active', 'coupon-item-inactive');
                });
                
                // 위로가기 버튼 숨김
                const buttonsBelowList = document.querySelector('.coupon-buttons-below-list');
                if (buttonsBelowList) {
                    buttonsBelowList.classList.remove('has-active');
                }
            }, 10);
        }
        
        // 홈 페이지로 이동할 때 데스크톱 방명록 영역을 맨 아래로 스크롤 및 방명록 초기화
        if (pageName === 'home') {
            // 방명록 초기화 (이벤트 리스너 재등록)
            setTimeout(() => {
                initGuestbook();
                const desktopMessages = document.getElementById('guestbook-desktop-messages');
                if (desktopMessages) {
                    desktopMessages.scrollTo({
                        top: desktopMessages.scrollHeight,
                        behavior: 'instant'
                    });
                }
            }, 100);
        }
        
        // 방명록 페이지로 이동할 때 방명록 메시지 로드
        if (pageName === 'guestbook') {
            setTimeout(() => {
                loadGuestbookMessages();
            }, 100);
        }
        
        // 이력서 페이지로 이동할 때 스크롤을 맨 위로 초기화
        if (pageName === 'resume') {
            setTimeout(() => {
                targetPage.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
                // 콘텐츠도 초기화
                const contentDiv = document.getElementById('resume-content-display');
                if (contentDiv) {
                    contentDiv.innerHTML = '';
                }
                // 활성화된 링크도 초기화
                document.querySelectorAll('.resume-index-link').forEach(link => {
                    link.classList.remove('active');
                });
                // 리스트 항목 정렬 클래스도 초기화
                document.querySelectorAll('.resume-index-list li').forEach(li => {
                    li.classList.remove('resume-item-active', 'resume-item-inactive');
                });
                // 위로가기 버튼 숨김
                const buttonsBelowList = document.querySelector('.resume-buttons-below-list');
                if (buttonsBelowList) {
                    buttonsBelowList.classList.remove('has-active');
                }
                // 버튼 위치 업데이트
                updateResumeMobileButtons();
            }, 10);
        }
        
        // 쿠폰 발급 현황 페이지로 이동할 때 데이터 로드
        if (pageName === 'coupons-status') {
            setTimeout(() => {
                loadCoupons();
            }, 10);
        }
        
        // 모바일 쿠폰 페이지 데이터 로드
        if (pageName === 'coupons-status-mobile') {
            loadMobileCoupons();
            // 쿠폰 페이지 초기화 (리스트 표시)
            setTimeout(() => {
                initCoupons();
            }, 10);
        }
        
        // 이력서 페이지인 경우 특별 처리하지 않음 (클릭으로 처리)
    }
    
    // 네비게이션 활성화 업데이트
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // URL 해시 업데이트
    if (pageName) {
        window.location.hash = pageName;
    }
}

// 페이지 맨 위로 스크롤
function scrollToTop(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// 모바일 쿠폰 페이지 데이터 로드
async function loadMobileCoupons() {
    try {
        const [issued, completed] = await Promise.all([
            fetch(`${API_BASE_URL}/coupons/issued`).then(r => r.json()),
            fetch(`${API_BASE_URL}/coupons/completed`).then(r => r.json())
        ]);
        
        // 발급목록과 수행목록 모두 렌더링
        renderCoupons('issued-mobile', issued, completed);
        renderCompletedCoupons(issued, completed, 'mobile');
    } catch (error) {
        console.error('쿠폰 로드 실패:', error);
    }
}

// URL 해시 라우팅 초기화
function initURLRouting() {
    // 초기 해시 확인
    if (window.location.hash) {
        const pageName = window.location.hash.substring(1);
        showPage(pageName);
    }
    
    // 해시 변경 감지
    window.addEventListener('hashchange', () => {
        const pageName = window.location.hash.substring(1);
        if (pageName) {
            showPage(pageName);
        }
    });
}

// 쿠폰 패널 초기화
function initCouponPanels() {
    const panelIssued = document.getElementById('panel-issued');
    const panelCompleted = document.getElementById('panel-completed');
    
    if (panelIssued && panelCompleted) {
        // 패널 전체 클릭 이벤트 (버튼, 테이블, 링크 제외)
        panelIssued.addEventListener('click', (e) => {
            // 버튼, 테이블, 링크, 원래대로 버튼 클릭은 제외
            if (e.target.tagName === 'BUTTON' || 
                e.target.closest('button') ||
                e.target.closest('table') ||
                e.target.closest('a') ||
                e.target.closest('.panel-reset-btn')) {
                return;
            }
            expandPanel('issued');
        });
        
        panelCompleted.addEventListener('click', (e) => {
            // 버튼, 테이블, 링크, 원래대로 버튼 클릭은 제외
            if (e.target.tagName === 'BUTTON' || 
                e.target.closest('button') ||
                e.target.closest('table') ||
                e.target.closest('a') ||
                e.target.closest('.panel-reset-btn')) {
                return;
            }
            expandPanel('completed');
        });
    }
    
    // 초기 상태에서 "원래대로" 버튼 숨김
    updateResetButtons();
}

// 패널 확장
function expandPanel(panelType) {
    const panelIssued = document.getElementById('panel-issued');
    const panelCompleted = document.getElementById('panel-completed');
    
    if (panelType === 'issued') {
        // 발급목록 확장
        panelIssued.classList.add('expanded');
        // 수행목록을 오른쪽으로 이동
        // expanded 제거하고 hidden-right 추가
        panelCompleted.classList.remove('expanded');
        // 약간의 지연을 두어 transition이 작동하도록
        setTimeout(() => {
            panelCompleted.classList.add('hidden-right');
        }, 50);
    } else {
        // hidden-right 제거하여 left: 100%에서 left: 50%로 복귀
        panelCompleted.classList.remove('hidden-right');
        panelCompleted.classList.add('expanded');
        panelIssued.classList.remove('expanded');
        // 수행목록 확장 시 발급목록은 그대로 유지 (사라지지 않음)
        panelIssued.classList.remove('hidden-left');
    }
    
    // "원래대로" 버튼 표시/숨김 업데이트
    updateResetButtons();
}

// "원래대로" 버튼 표시/숨김 업데이트
function updateResetButtons() {
    const panelIssued = document.getElementById('panel-issued');
    const panelCompleted = document.getElementById('panel-completed');
    const resetButtons = document.querySelectorAll('.panel-reset-btn');
    const globalBackBtn = document.querySelector('#coupons-status-page .global-back-btn');
    
    const isIssuedExpanded = panelIssued && panelIssued.classList.contains('expanded');
    const isCompletedExpanded = panelCompleted && panelCompleted.classList.contains('expanded');
    const isAnyExpanded = isIssuedExpanded || isCompletedExpanded;
    
    // 뒤로가기 버튼 숨김/표시
    if (globalBackBtn) {
        if (isAnyExpanded) {
            globalBackBtn.style.display = 'none';
        } else {
            globalBackBtn.style.display = 'block';
        }
    }
    
    // "원래대로" 버튼 표시/숨김
    resetButtons.forEach(btn => {
        const panel = btn.closest('.coupon-panel');
        if (panel) {
            if (panel.id === 'panel-issued' && isIssuedExpanded) {
                btn.style.display = 'block';
            } else if (panel.id === 'panel-completed' && isCompletedExpanded) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        }
    });
}

// 패널 위치 초기화
function resetPanelPosition() {
    const panelIssued = document.getElementById('panel-issued');
    const panelCompleted = document.getElementById('panel-completed');
    
    // 기존 패널 구조가 없는 경우 (새로운 구조) 함수 종료
    if (!panelIssued || !panelCompleted) {
        return;
    }
    
    // hidden-right를 먼저 제거하여 left: 100%에서 left: 50%로 복귀
    panelCompleted.classList.remove('hidden-right');
    
    // 약간의 지연 후 expanded 제거
    setTimeout(() => {
        panelIssued.classList.remove('expanded', 'hidden-left');
        panelCompleted.classList.remove('expanded');
        // 클래스 제거 후 상태 갱신
        updateResetButtons();
    }, 10);
    
    // 클래스 제거 사이에도 버튼 상태를 갱신해 깜빡임 방지
    updateResetButtons();
}

// 원래대로 버튼 초기화 (char-wrapper 분리)
function initResetButtons() {
    const resetButtons = document.querySelectorAll('.panel-reset-btn');
    resetButtons.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
}

// 추가 버튼 초기화 (char-wrapper 분리)
function initAddButtons() {
    const addButtons = document.querySelectorAll('.btn-add');
    addButtons.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
}


// 쿠폰 데이터 로드
async function loadCoupons() {
    try {
        const [issued, completed] = await Promise.all([
            fetch(`${API_BASE_URL}/coupons/issued`).then(r => r.json()),
            fetch(`${API_BASE_URL}/coupons/completed`).then(r => r.json())
        ]);
        
        renderCoupons('issued', issued, completed);
        renderCompletedCoupons(issued, completed);
        
        // 패널 클릭 핸들러 초기화 (데스크톱)
        initCouponPanels();
        initResetButtons();
    } catch (error) {
        console.error('쿠폰 로드 실패:', error);
        // 초기 데이터 표시
        const issuedData = [
            { id: 1, order: 1, date: '25.11.15.', worker: '유다연', content: '웹디자인', amount: '3시금(1시간 30분)', issuer: '박중현' },
            { id: 2, order: 2, date: '25.11.07.', worker: '이동식', content: '퍼포먼스촬영', amount: '5시금', issuer: '타이' }
        ];
        const completedData = [
            { id: 1, issued_id: 1, date: '25.12.10.', performer: '정지윤', content: '카레만들기', amount: '3시금(1시간 30분)' }
        ];
        renderCoupons('issued', issuedData, completedData);
        renderCompletedCoupons(issuedData, completedData);
    }
}

// 이름을 이력서 링크로 변환하는 함수
function createResumeLink(name) {
    const nameMap = {
        '콜렉티브 이동식': 'team',
        '구정환': '구정환',
        '민지홍': '민지홍',
        '박중현': '박중현',
        '석유림': '석유림',
        '정지윤': '정지윤'
    };
    
    const resumeKey = nameMap[name];
    if (resumeKey) {
        // 음절 단위로 분리하여 링크 생성
        const chars = name.split('').map((char, index) => {
            const charSpan = char === ' ' ? '&nbsp;' : char;
            return `<span style="--char-index: ${index}" class="resume-link-char">${charSpan}</span>`;
        }).join('');
        
        return `<a href="#" class="resume-name-link" data-resume="${resumeKey}">${chars}</a>`;
    }
    return name;
}

// 모바일에서 amount에서 괄호 안 내용 제거하는 함수
function formatAmountForMobile(amount) {
    if (!amount) return '';
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // 괄호와 그 안의 내용 제거
        return amount.replace(/\([^)]*\)/g, '').trim();
    }
    return amount;
}

// 쿠폰 테이블 렌더링 (발급목록)
function renderCoupons(type, coupons, completedCoupons = [], mode = 'desktop') {
    let tbodyId;
    if (mode === 'content') {
        tbodyId = 'coupon-content-issued-table-body';
    } else if (mode === 'mobile-content') {
        tbodyId = 'coupon-content-mobile-issued-table-body';
    } else {
        tbodyId = type === 'issued-mobile' ? 'issued-table-body-mobile' : `${type}-table-body`;
    }
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    // 수행내역이 있는 발급번호를 추적 (같은 번호로 여러 개의 수행내역이 있을 수 있음)
    const completedCountByIssuedId = {};
    completedCoupons.forEach(completed => {
        if (completed.issued_id) {
            completedCountByIssuedId[completed.issued_id] = (completedCountByIssuedId[completed.issued_id] || 0) + 1;
        }
    });
    
    const rows = [];
    const isMobile = window.innerWidth <= 768 || mode === 'mobile-content';
    
    coupons.forEach((coupon, index) => {
        const order = coupon.order || index + 1;
        const workerLink = createResumeLink(coupon.worker || '');
        const issuerLink = createResumeLink(coupon.issuer || '');
        const amount = isMobile ? formatAmountForMobile(coupon.amount || '') : (coupon.amount || '');
        
        // 발급 쿠폰 행 추가
        rows.push(`
            <tr>
                <td>${order}</td>
                <td>${coupon.date || ''}</td>
                <td>${workerLink}</td>
                <td>${coupon.content || ''}</td>
                <td>${amount}</td>
                <td>${issuerLink}</td>
                <td class="admin-col">
                    <button class="btn-edit" onclick="editCoupon('${type}', ${coupon.id})"><span class="char-wrapper">${'수정'.split('').map((char, i) => `<span style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span></button>
                    <button class="btn-delete" onclick="deleteCoupon('${type}', ${coupon.id})"><span class="char-wrapper">${'삭제'.split('').map((char, i) => `<span style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span></button>
                </td>
            </tr>
        `);
        
        // 수행내역이 2개 이상인 경우, 추가 빈 행 생성 (수행내역 개수 - 1개만큼)
        const completedCount = completedCountByIssuedId[coupon.id] || 0;
        if (completedCount > 1) {
            for (let i = 0; i < completedCount - 1; i++) {
                rows.push(`
                    <tr class="blank-row">
                        <td>${order}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td class="admin-col">-</td>
                    </tr>
                `);
            }
        }
    });
    
    tbody.innerHTML = rows.join('');
    
    // 링크에 이벤트 리스너 추가
    initResumeLinks();
}

// 수행목록 렌더링 (발급 순서에 맞춰서)
function renderCompletedCoupons(issuedCoupons, completedCoupons, mode = 'desktop') {
    let tbodyId;
    if (mode === 'content') {
        tbodyId = 'coupon-content-completed-table-body';
    } else if (mode === 'mobile-content') {
        tbodyId = 'coupon-content-mobile-completed-table-body';
    } else {
        tbodyId = mode === 'mobile' ? 'completed-table-body-mobile' : 'completed-table-body';
    }
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    // 발급 쿠폰별로 수행 내역 그룹화 (같은 issued_id를 가진 모든 completed를 배열로)
    const completedMap = {};
    completedCoupons.forEach(completed => {
        if (!completedMap[completed.issued_id]) {
            completedMap[completed.issued_id] = [];
        }
        completedMap[completed.issued_id].push(completed);
    });
    
    const rows = [];
    
    const isMobile = window.innerWidth <= 768 || mode === 'mobile-content' || mode === 'mobile';
    
    // 발급 쿠폰 순서대로 처리
    issuedCoupons.forEach((issued, index) => {
        const order = issued.order || index + 1;
        const workerLink = createResumeLink(issued.issuer || '');
        const completedList = completedMap[issued.id] || [];
        
        if (completedList.length > 0) {
            // 수행된 내역이 있는 경우 - 각각을 행으로 표시
            completedList.forEach((completed, compIndex) => {
                const photoHtml = isMobile ? '' : (completed.photo ? `<img src="${completed.photo}" alt="사진">` : '-');
                const photoCell = isMobile ? '' : `<td>${photoHtml}</td>`;
                const amount = isMobile ? formatAmountForMobile(completed.amount || '') : (completed.amount || '');
                rows.push(`
                    <tr>
                        <td>${order}</td>
                        <td>${completed.date || ''}</td>
                        <td>${workerLink}</td>
                        <td>${completed.content || ''}</td>
                        <td>${amount}</td>
                        ${photoCell}
                        <td class="admin-col">
                            <button class="btn-edit" onclick="editCoupon('completed', ${completed.id})"><span class="char-wrapper">${'수정'.split('').map((char, i) => `<span style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span></button>
                            <button class="btn-delete" onclick="deleteCoupon('completed', ${completed.id})"><span class="char-wrapper">${'삭제'.split('').map((char, i) => `<span style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span></button>
                        </td>
                    </tr>
                `);
            });
        } else {
            // 수행 내역이 없는 경우 빈 행 생성
            const photoCell = isMobile ? '' : '<td>-</td>';
            rows.push(`
                <tr class="blank-row">
                    <td>${order}</td>
                    <td>-</td>
                    <td>${workerLink}</td>
                    <td>-</td>
                    <td>-</td>
                    ${photoCell}
                    <td class="admin-col">-</td>
                </tr>
            `);
        }
    });
    
    tbody.innerHTML = rows.join('');
    
    // 링크에 이벤트 리스너 추가
    initResumeLinks();
}

// 쿠폰 추가 폼 열기
function openAddForm(type) {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-type').value = type;
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) {
        photoPreview.innerHTML = '';
    }
    
    // 필드 표시/숨기기
    const issuerGroup = document.getElementById('issuer-group');
    const issuedSelectGroup = document.getElementById('issued-select-group');
    const workerGroup = document.getElementById('worker-group');
    const performerGroup = document.getElementById('performer-group');
    const photoGroup = document.getElementById('photo-group');
    const issuedSelect = document.getElementById('issued-select');
    
    const workerField = document.getElementById('worker');
    const issuerField = document.getElementById('issuer');
    
    if (type === 'issued') {
        issuerGroup.style.display = 'block';
        issuedSelectGroup.style.display = 'none';
        workerGroup.style.display = 'block';
        performerGroup.style.display = 'none';
        photoGroup.style.display = 'none';
        // 숨겨진 필드의 required 제거
        if (issuedSelect) {
            issuedSelect.removeAttribute('required');
        }
        // 표시된 필드에 required 추가
        if (workerField) {
            workerField.setAttribute('required', 'required');
        }
        if (issuerField) {
            issuerField.removeAttribute('required'); // 발급자는 선택사항
        }
    } else {
        issuerGroup.style.display = 'none';
        issuedSelectGroup.style.display = 'block';
        workerGroup.style.display = 'none';
        performerGroup.style.display = 'block';
        photoGroup.style.display = 'block';
        // 숨겨진 필드의 required 제거
        if (workerField) {
            workerField.removeAttribute('required');
        }
        if (issuerField) {
            issuerField.removeAttribute('required');
        }
        // 표시된 필드에 required 추가
        if (issuedSelect) {
            issuedSelect.setAttribute('required', 'required');
        }
        // 발급 목록을 선택 옵션에 추가
        loadIssuedOptions().then(() => {
            updateWorkerFromIssued();
        });
    }
    
    document.getElementById('coupon-modal').classList.add('active');
}

// 특정 발급 쿠폰에 대한 수행 등록 폼 열기
function openAddFormForIssued(type, issuedId) {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-type').value = type;
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) {
        photoPreview.innerHTML = '';
    }
    
    const issuerGroup = document.getElementById('issuer-group');
    const issuedSelectGroup = document.getElementById('issued-select-group');
    const workerGroup = document.getElementById('worker-group');
    const performerGroup = document.getElementById('performer-group');
    const photoGroup = document.getElementById('photo-group');
    const issuedSelect = document.getElementById('issued-select');
    
    issuerGroup.style.display = 'none';
    issuedSelectGroup.style.display = 'block';
    workerGroup.style.display = 'none';
    performerGroup.style.display = 'block';
    photoGroup.style.display = 'block';
    
    // 표시된 필드에 required 추가
    if (issuedSelect) {
        issuedSelect.setAttribute('required', 'required');
    }
    
    loadIssuedOptions().then(() => {
        const select = document.getElementById('issued-select');
        if (select) {
            // multiple select인 경우 배열로 설정
            if (select.multiple) {
                select.value = [issuedId.toString()];
            } else {
                select.value = issuedId;
            }
            // 발급 쿠폰 선택 시 발급자 자동 입력
            updateWorkerFromIssued();
        }
    });
    
    document.getElementById('coupon-modal').classList.add('active');
}

// 발급 쿠폰 선택 시 노동자(발급자) 자동 입력
let issuedSelectChangeHandler = null;

function updateWorkerFromIssued() {
    const select = document.getElementById('issued-select');
    const performerField = document.getElementById('performer');
    
    if (!select || !performerField) return;
    
    // 기존 이벤트 리스너 제거
    if (issuedSelectChangeHandler) {
        select.removeEventListener('change', issuedSelectChangeHandler);
    }
    
    // 새 이벤트 리스너 등록
    issuedSelectChangeHandler = async () => {
        const selectedValues = Array.from(select.selectedOptions)
            .map(opt => opt.value)
            .filter(v => v && v !== '');
        
        if (selectedValues.length > 0) {
            try {
                // 첫 번째 선택된 발급 쿠폰의 발급자 정보 가져오기
                const firstId = selectedValues[0];
                const response = await fetch(`${API_BASE_URL}/coupons/issued/${firstId}`);
                if (response.ok) {
                    const issued = await response.json();
                    if (issued && issued.issuer) {
                        performerField.value = issued.issuer;
                    }
                }
            } catch (error) {
                console.error('발급 쿠폰 정보 로드 실패:', error);
            }
        } else {
            performerField.value = '';
        }
    };
    
    select.addEventListener('change', issuedSelectChangeHandler);
}

// 발급 목록을 선택 옵션에 로드
async function loadIssuedOptions() {
    const select = document.getElementById('issued-select');
    try {
        const issued = await fetch(`${API_BASE_URL}/coupons/issued`).then(r => r.json());
        // 발급일자 오래된 순으로 정렬
        issued.sort((a, b) => {
            const dateA = new Date(a.date.replace(/\./g, '-'));
            const dateB = new Date(b.date.replace(/\./g, '-'));
            return dateA - dateB;
        });
        select.innerHTML = '<option value="">선택하세요</option>' + 
            issued.map((item, index) => `<option value="${item.id}">순서 ${index + 1} - ${item.worker} - ${item.content} (${item.amount})</option>`).join('');
    } catch (error) {
        console.error('발급 목록 로드 실패:', error);
    }
}

// 쿠폰 수정
async function editCoupon(type, id) {
    try {
        const response = await fetch(`${API_BASE_URL}/coupons/${type}/${id}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '쿠폰 정보를 불러올 수 없습니다.' }));
            throw new Error(errorData.error || `서버 오류: ${response.status}`);
        }
        
        const coupon = await response.json();
        
        if (!coupon || !coupon.id) {
            throw new Error('쿠폰 데이터가 올바르지 않습니다.');
        }
        
        document.getElementById('coupon-id').value = coupon.id;
        document.getElementById('coupon-type').value = type;
        document.getElementById('date').value = coupon.date || '';
        document.getElementById('content').value = coupon.content || '';
        document.getElementById('amount').value = coupon.amount || '';
        
        const issuerGroup = document.getElementById('issuer-group');
        const issuedSelectGroup = document.getElementById('issued-select-group');
        const workerGroup = document.getElementById('worker-group');
        const performerGroup = document.getElementById('performer-group');
        const photoGroup = document.getElementById('photo-group');
        const photoPreview = document.getElementById('photo-preview');
        
        const workerField = document.getElementById('worker');
        const issuerField = document.getElementById('issuer');
        const issuedSelect = document.getElementById('issued-select');
        
        if (type === 'issued') {
            document.getElementById('worker').value = coupon.worker;
            document.getElementById('issuer').value = coupon.issuer || '';
            issuerGroup.style.display = 'block';
            issuedSelectGroup.style.display = 'none';
            workerGroup.style.display = 'block';
            performerGroup.style.display = 'none';
            photoGroup.style.display = 'none';
            if (photoPreview) {
                photoPreview.innerHTML = '';
            }
            // 숨겨진 필드의 required 제거
            if (issuedSelect) {
                issuedSelect.removeAttribute('required');
            }
            // 표시된 필드에 required 추가
            if (workerField) {
                workerField.setAttribute('required', 'required');
            }
            if (issuerField) {
                issuerField.removeAttribute('required'); // 발급자는 선택사항
            }
        } else {
            document.getElementById('performer').value = coupon.performer || '';
            issuerGroup.style.display = 'none';
            issuedSelectGroup.style.display = 'block';
            workerGroup.style.display = 'none';
            performerGroup.style.display = 'block';
            photoGroup.style.display = 'block';
            
            // 숨겨진 필드의 required 제거
            if (workerField) {
                workerField.removeAttribute('required');
            }
            if (issuerField) {
                issuerField.removeAttribute('required');
            }
            // 표시된 필드에 required 추가
            if (issuedSelect) {
                issuedSelect.setAttribute('required', 'required');
            }
            
            // 사진 미리보기 (기존 사진이 있으면 표시)
            if (photoPreview) {
                if (coupon.photo) {
                    photoPreview.innerHTML = `<img src="${coupon.photo}" alt="현재 사진" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;" data-existing-photo="${coupon.photo}">`;
                } else {
                    photoPreview.innerHTML = '';
                }
            }
            
            loadIssuedOptions().then(() => {
                if (coupon.issued_id) {
                    document.getElementById('issued-select').value = coupon.issued_id;
                }
            });
        }
        
        document.getElementById('coupon-modal').classList.add('active');
    } catch (error) {
        console.error('쿠폰 수정 실패:', error);
        alert('쿠폰 정보를 불러오는데 실패했습니다: ' + error.message);
    }
}

// 쿠폰 삭제
async function deleteCoupon(type, id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/coupons/${type}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '삭제에 실패했습니다.' }));
            throw new Error(errorData.error || `서버 오류: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 수행 쿠폰 삭제 시 발급 쿠폰도 삭제된 경우 순서 재정렬을 위해 데이터 다시 로드
        if (type === 'completed' && result.reorder) {
            // 데이터 다시 로드하여 순서 재정렬
            await loadCoupons();
        } else {
            // 일반적인 경우 데이터 다시 로드
            loadCoupons();
        }
    } catch (error) {
        console.error('쿠폰 삭제 실패:', error);
        alert('삭제에 실패했습니다: ' + error.message);
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('coupon-modal').classList.remove('active');
}

// 사진 미리보기
document.getElementById('photo')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('photo-preview');
    if (preview) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="미리보기" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }
});

// 폼 제출
document.getElementById('coupon-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 숨겨진 필수 필드의 required 속성 제거
    const form = e.target;
    const allRequiredFields = form.querySelectorAll('[required]');
    allRequiredFields.forEach(field => {
        const parent = field.closest('.form-group');
        // 부모가 없거나 숨겨져 있으면 required 제거
        if (!parent || parent.style.display === 'none' || parent.style.display === '') {
            field.removeAttribute('required');
        }
    });
    
    const formData = new FormData(form);
    const type = formData.get('type');
    const id = formData.get('id');
    
    // 데이터 객체 생성
    const data = {
        date: formData.get('date'),
        content: formData.get('content'),
        amount: formData.get('amount')
    };
    
    // 수행 쿠폰인 경우
    if (type === 'completed') {
        // multiple select인 경우 첫 번째 선택된 값 사용
        const issuedSelect = document.getElementById('issued-select');
        let issuedId = null;
        if (issuedSelect && issuedSelect.multiple) {
            const selectedValues = Array.from(issuedSelect.selectedOptions)
                .map(opt => opt.value)
                .filter(v => v && v !== '');
            issuedId = selectedValues.length > 0 ? parseInt(selectedValues[0]) : null;
        } else {
            issuedId = formData.get('issued_id') ? parseInt(formData.get('issued_id')) : null;
        }
        // 수정 시에도 issued_id가 필요하므로 항상 포함
        if (issuedId) {
            data.issued_id = issuedId;
        } else if (id) {
            // 수정 시 issued_id가 없으면 기존 데이터에서 가져오기
            try {
                const existingResponse = await fetch(`${API_BASE_URL}/coupons/${type}/${id}`);
                const existingCoupon = await existingResponse.json();
                if (existingCoupon.issued_id) {
                    data.issued_id = existingCoupon.issued_id;
                }
            } catch (error) {
                console.error('기존 issued_id 로드 실패:', error);
            }
        }
        
        
        if (formData.get('performer')) {
            data.performer = formData.get('performer');
        }
        
        // 사진 처리 (base64로 변환)
        const photoFile = formData.get('photo');
        if (photoFile && photoFile.size > 0) {
            const reader = new FileReader();
            data.photo = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(photoFile);
            });
        } else if (id) {
            // 수정 시 기존 사진이 있고 새로 업로드하지 않았다면 기존 사진 유지
            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview && photoPreview.querySelector('img')) {
                const existingImg = photoPreview.querySelector('img');
                // data-existing-photo 속성에서 기존 사진 가져오기
                if (existingImg.hasAttribute('data-existing-photo')) {
                    data.photo = existingImg.getAttribute('data-existing-photo');
                } else if (existingImg.src && existingImg.src.startsWith('data:')) {
                    data.photo = existingImg.src;
                } else {
                    // 기존 쿠폰 데이터에서 사진 가져오기
                    try {
                        const existingResponse = await fetch(`${API_BASE_URL}/coupons/${type}/${id}`);
                        const existingCoupon = await existingResponse.json();
                        if (existingCoupon.photo) {
                            data.photo = existingCoupon.photo;
                        }
                    } catch (error) {
                        console.error('기존 사진 로드 실패:', error);
                    }
                }
            } else {
                // 미리보기 이미지가 없어도 수정 시 기존 사진 유지
                try {
                    const existingResponse = await fetch(`${API_BASE_URL}/coupons/${type}/${id}`);
                    const existingCoupon = await existingResponse.json();
                    if (existingCoupon.photo) {
                        data.photo = existingCoupon.photo;
                    }
                } catch (error) {
                    console.error('기존 사진 로드 실패:', error);
                }
            }
        }
    } else {
        // 발급 쿠폰인 경우
        if (formData.get('worker')) {
            data.worker = formData.get('worker');
        }
        if (formData.get('issuer')) {
            data.issuer = formData.get('issuer');
        }
    }
    
    const url = id 
        ? `${API_BASE_URL}/coupons/${type}/${id}`
        : `${API_BASE_URL}/coupons/${type}`;
    
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadCoupons();
            
            // 모바일 페이지에서 현재 표시 중인 콘텐츠가 있으면 다시 렌더링
            const couponMobilePage = document.getElementById('coupons-status-mobile-page');
            const isMobile = couponMobilePage && couponMobilePage.classList.contains('active');
            if (isMobile) {
                const activeLink = document.querySelector('.coupon-index-link.active');
                if (activeLink) {
                    const couponType = activeLink.getAttribute('data-coupon');
                    await showCouponContent(couponType);
                }
            }
        } else {
            const error = await response.json();
            alert('저장에 실패했습니다: ' + (error.error || ''));
        }
    } catch (error) {
        console.error('쿠폰 저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
});

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('coupon-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// 이력서로 이동하는 함수 (쿠폰 테이블에서 호출)
function goToResume(resumeKey) {
    // resume-page로 이동
    showPage('resume');
    
    // 이력서 목록에서 해당 링크 찾기
    setTimeout(() => {
        const resumePage = document.getElementById('resume-page');
        if (resumePage && resumePage.classList.contains('active')) {
            const targetLink = document.querySelector(`.resume-index-link[data-resume="${resumeKey}"]`);
            if (targetLink) {
                handleResumeClick(targetLink, resumeKey);
            } else {
                // 링크가 없으면 직접 내용 표시
                showResumeContent(resumeKey);
            }
        }
    }, 100);
}

// 쿠폰 테이블의 이력서 링크 초기화
function initResumeLinks() {
    const resumeNameLinks = document.querySelectorAll('.resume-name-link');
    resumeNameLinks.forEach(link => {
        // 이미 이벤트가 추가되었는지 확인
        if (!link.hasAttribute('data-initialized')) {
            link.setAttribute('data-initialized', 'true');
            
            // 클릭 이벤트
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const resumeKey = this.getAttribute('data-resume');
                if (resumeKey) {
                    goToResume(resumeKey);
                }
            });
            
            // 호버 이벤트로 파도타기 애니메이션
            link.addEventListener('mouseenter', function() {
                const chars = this.querySelectorAll('.resume-link-char');
                chars.forEach((char, index) => {
                    // 애니메이션을 재시작하기 위해 초기화
                    char.style.animation = 'none';
                    // 리플로우 강제
                    // eslint-disable-next-line no-unused-expressions
                    char.offsetHeight;
                    char.style.animation = '';
                    setTimeout(() => {
                        char.style.animation = 'charWave 0.6s ease-in-out';
                        char.style.animationDelay = `${index * 0.05}s`;
                    }, 0);
                });
            });
            
            link.addEventListener('mouseleave', function() {
                const chars = this.querySelectorAll('.resume-link-char');
                chars.forEach(char => {
                    char.style.animation = '';
                    char.style.animationDelay = '';
                });
            });
        }
    });
}

// 쿠폰 페이지 초기화
function initCoupons() {
    // 텍스트를 글자 단위로 분리
    const couponLinks = document.querySelectorAll('.coupon-index-link');
    couponLinks.forEach(link => {
        const charWrapper = link.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
    
    // 클릭 이벤트
    couponLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const couponType = link.getAttribute('data-coupon');
            
            // coupons-status-page 또는 coupons-status-mobile-page가 활성화되어 있는지 확인
            const couponPage = document.getElementById('coupons-status-page');
            const couponMobilePage = document.getElementById('coupons-status-mobile-page');
            const isActive = (couponPage && couponPage.classList.contains('active')) || 
                           (couponMobilePage && couponMobilePage.classList.contains('active'));
            
            if (!isActive) {
                // 모바일인지 확인하여 적절한 페이지로 이동
                const isMobile = window.innerWidth <= 768;
                const targetPage = isMobile ? 'coupons-status-mobile' : 'coupons-status';
                showPage(targetPage);
                setTimeout(() => {
                    handleCouponClick(link, couponType);
                }, 100);
            } else {
                handleCouponClick(link, couponType);
            }
        });
    });
    
    // 모바일 뒤로가기/위로가기 버튼 초기화
    const couponMobileBackBtns = document.querySelectorAll('.coupon-mobile-back-btn, .coupon-mobile-back-btn-list');
    couponMobileBackBtns.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('home');
        });
    });
    
    const couponMobileScrollTopBtns = document.querySelectorAll('.coupon-mobile-scroll-top-btn, .coupon-mobile-scroll-top-btn-list');
    couponMobileScrollTopBtns.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
    
    // 콘텐츠 변경 감지하여 버튼 위치 전환
    updateCouponMobileButtons();
    const contentDiv = document.getElementById('coupon-content-display');
    const contentDivMobile = document.getElementById('coupon-content-display-mobile');
    if (contentDiv) {
        const observer = new MutationObserver(() => {
            updateCouponMobileButtons();
        });
        observer.observe(contentDiv, { childList: true, subtree: true });
    }
    if (contentDivMobile) {
        const observer = new MutationObserver(() => {
            updateCouponMobileButtons();
        });
        observer.observe(contentDivMobile, { childList: true, subtree: true });
    }
}

// 쿠폰 페이지 모바일 버튼 위치 업데이트
function updateCouponMobileButtons() {
    // 데스크톱/모바일 페이지 확인
    const couponPage = document.getElementById('coupons-status-page');
    const couponMobilePage = document.getElementById('coupons-status-mobile-page');
    const isMobile = couponMobilePage && couponMobilePage.classList.contains('active');
    
    const contentDiv = isMobile 
        ? document.getElementById('coupon-content-display-mobile')
        : document.getElementById('coupon-content-display');
    const buttonsBelowContent = document.querySelector('.coupon-buttons-below-content');
    const buttonsBelowList = document.querySelector('.coupon-buttons-below-list');
    
    if (!contentDiv || !buttonsBelowContent || !buttonsBelowList) return;
    
    // 스크롤 가능 여부 확인
    const isScrollable = contentDiv.scrollHeight > contentDiv.clientHeight;
    const hasContent = contentDiv.innerHTML.trim() !== '';
    
    // 콘텐츠가 있고 스크롤 가능하면 콘텐츠 하단 버튼 표시, 리스트 하단 버튼 숨김
    if (hasContent && isScrollable) {
        buttonsBelowContent.style.display = 'flex';
        buttonsBelowList.style.display = 'none';
    } else {
        // 콘텐츠가 없거나 스크롤 불가능하면 리스트 하단 버튼 표시, 콘텐츠 하단 버튼 숨김
        buttonsBelowContent.style.display = 'none';
        buttonsBelowList.style.display = 'flex';
    }
    
    // 위로가기 버튼은 스크롤 가능할 때만 표시
    const scrollTopBtn = buttonsBelowList.querySelector('.scroll-to-top-btn');
    if (scrollTopBtn) {
        if (hasContent && isScrollable) {
            buttonsBelowList.classList.add('has-active');
        } else {
            buttonsBelowList.classList.remove('has-active');
        }
    }
}

// 쿠폰 클릭 처리
function handleCouponClick(link, couponType) {
    const couponLinks = document.querySelectorAll('.coupon-index-link');
    const couponListItems = document.querySelectorAll('.coupon-index-list li');
    const buttonsBelowList = document.querySelector('.coupon-buttons-below-list');
    
    // 모든 링크에서 active 클래스 제거
    couponLinks.forEach(l => l.classList.remove('active'));
    // 모든 리스트 항목에서 정렬 클래스 제거
    couponListItems.forEach(li => {
        li.classList.remove('coupon-item-active', 'coupon-item-inactive');
    });
    
    // 클릭된 링크에 active 추가
    link.classList.add('active');
    // 클릭된 항목의 부모 li에 active 클래스 추가
    const activeLi = link.closest('li');
    if (activeLi) {
        activeLi.classList.add('coupon-item-active');
        // 나머지 항목들에 inactive 클래스 추가
        couponListItems.forEach(li => {
            if (li !== activeLi) {
                li.classList.add('coupon-item-inactive');
            }
        });
    }
    
    // 위로가기 버튼 표시
    if (buttonsBelowList) {
        buttonsBelowList.classList.add('has-active');
    }
    
    // 즉시 내용 표시
    showCouponContent(couponType);
    
    // 파도 애니메이션 효과 (글자 단위) - 비동기로 실행
    const charSpans = link.querySelectorAll('.char-wrapper span');
    charSpans.forEach((span, index) => {
        setTimeout(() => {
            span.style.animation = 'charWave 0.3s ease-in-out';
            setTimeout(() => {
                span.style.animation = '';
            }, 300);
        }, index * 20);
    });
}

// 쿠폰 내용 표시
async function showCouponContent(type) {
    // 데스크톱/모바일 페이지 확인
    const couponPage = document.getElementById('coupons-status-page');
    const couponMobilePage = document.getElementById('coupons-status-mobile-page');
    const isMobile = couponMobilePage && couponMobilePage.classList.contains('active');
    const activePage = isMobile ? couponMobilePage : couponPage;
    
    if (!activePage || !activePage.classList.contains('active')) {
        console.error('coupons-status-page가 활성화되지 않았습니다.');
        return;
    }
    
    // 수행이력 선택 시 전체 페이지 배경색 변경
    if (type === 'completed') {
        activePage.classList.add('has-completed');
    } else {
        activePage.classList.remove('has-completed');
    }
    
    const contentDiv = isMobile 
        ? document.getElementById('coupon-content-display-mobile')
        : document.getElementById('coupon-content-display');
    if (!contentDiv) {
        console.error('coupon-content-display를 찾을 수 없습니다.');
        return;
    }
    
    // 콘텐츠 표시 후 버튼 위치 업데이트 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 체크)
    setTimeout(() => {
        updateCouponMobileButtons();
    }, 100);
    
    try {
        const [issued, completed] = await Promise.all([
            fetch(`${API_BASE_URL}/coupons/issued`).then(r => r.json()),
            fetch(`${API_BASE_URL}/coupons/completed`).then(r => r.json())
        ]);
        
        const tbodyIdPrefix = isMobile ? 'coupon-content-mobile' : 'coupon-content';
        
        if (type === 'issued') {
            // 발급목록 표시
            const amountHeader = isMobile ? '시금' : '시금(시간)';
            const tableHtml = `
                <div class="coupon-panel-content">
                    <div class="coupon-panel-header">
                        <h2>발급목록</h2>
                        <button class="btn-add" onclick="openAddForm('issued')"><span class="char-wrapper">추가</span></button>
                    </div>
                    <div class="coupon-table-wrapper">
                        <table class="coupons-table">
                            <thead>
                                <tr>
                                    <th>순서</th>
                                    <th>발급일자</th>
                                    <th>노동자</th>
                                    <th>노동내용</th>
                                    <th>${amountHeader}</th>
                                    <th>발급자</th>
                                    <th class="admin-col">관리</th>
                                </tr>
                            </thead>
                            <tbody id="${tbodyIdPrefix}-issued-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            contentDiv.innerHTML = tableHtml;
            renderCoupons('issued', issued, completed, isMobile ? 'mobile-content' : 'content');
        } else if (type === 'completed') {
            // 수행목록 표시
            const amountHeader = isMobile ? '시금' : '시금(시간)';
            const photoHeader = isMobile ? '' : '<th>사진</th>';
            const tableHtml = `
                <div class="coupon-panel-content panel-completed">
                    <div class="coupon-panel-header">
                        <h2>수행목록</h2>
                        <button class="btn-add" onclick="openAddForm('completed')"><span class="char-wrapper">추가</span></button>
                    </div>
                    <div class="coupon-table-wrapper">
                        <table class="coupons-table">
                            <thead>
                                <tr>
                                    <th>순서</th>
                                    <th>수행일자</th>
                                    <th>노동자</th>
                                    <th>노동내용</th>
                                    <th>${amountHeader}</th>
                                    ${photoHeader}
                                    <th class="admin-col">관리</th>
                                </tr>
                            </thead>
                            <tbody id="${tbodyIdPrefix}-completed-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            contentDiv.innerHTML = tableHtml;
            renderCompletedCoupons(issued, completed, isMobile ? 'mobile-content' : 'content');
        }
        
        // 추가 버튼 초기화
        initAddButtons();
    } catch (error) {
        console.error('쿠폰 내용 로드 실패:', error);
    }
}

// 이력서 초기화
function initResume() {
    // 텍스트를 글자 단위로 분리
    const resumeLinks = document.querySelectorAll('.resume-index-link');
    resumeLinks.forEach(link => {
        const charWrapper = link.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
    
    // 클릭 이벤트
    resumeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const resumeName = link.getAttribute('data-resume');
            
            // resume-page가 활성화되어 있는지 확인
            const resumePage = document.getElementById('resume-page');
            if (!resumePage || !resumePage.classList.contains('active')) {
                // resume-page로 이동
                showPage('resume');
                setTimeout(() => {
                    handleResumeClick(link, resumeName);
                }, 100);
            } else {
                handleResumeClick(link, resumeName);
            }
        });
    });
    
    // 모바일 뒤로가기/위로가기 버튼 초기화
    const resumeMobileBackBtns = document.querySelectorAll('.resume-mobile-back-btn, .resume-mobile-back-btn-list');
    resumeMobileBackBtns.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('home');
        });
    });
    
    const resumeMobileScrollTopBtns = document.querySelectorAll('.resume-mobile-scroll-top-btn, .resume-mobile-scroll-top-btn-list');
    resumeMobileScrollTopBtns.forEach(btn => {
        const charWrapper = btn.querySelector('.char-wrapper');
        if (charWrapper) {
            const text = charWrapper.textContent;
            charWrapper.innerHTML = text.split('').map((char, index) => {
                const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                return charSpan.replace('<span', `<span style="--char-index: ${index}"`);
            }).join('');
        }
    });
    
    // 콘텐츠 변경 감지하여 버튼 위치 전환
    updateResumeMobileButtons();
    const contentDiv = document.getElementById('resume-content-display');
    if (contentDiv) {
        const observer = new MutationObserver(() => {
            updateResumeMobileButtons();
        });
        observer.observe(contentDiv, { childList: true, subtree: true });
    }
}

// 이력서 페이지 모바일 버튼 위치 업데이트
function updateResumeMobileButtons() {
    const contentDiv = document.getElementById('resume-content-display');
    const buttonsBelowContent = document.querySelector('.resume-buttons-below-content');
    const buttonsBelowList = document.querySelector('.resume-buttons-below-list');
    
    if (!contentDiv || !buttonsBelowContent || !buttonsBelowList) return;
    
    // 콘텐츠가 있으면 콘텐츠 하단 버튼 표시, 리스트 하단 버튼 숨김
    if (contentDiv.innerHTML.trim() !== '') {
        buttonsBelowContent.classList.add('show');
        buttonsBelowList.classList.add('hide');
    } else {
        // 콘텐츠가 없으면 리스트 하단 버튼 표시, 콘텐츠 하단 버튼 숨김
        buttonsBelowContent.classList.remove('show');
        buttonsBelowList.classList.remove('hide');
    }
}

// 이력서 클릭 처리
function handleResumeClick(link, resumeName) {
    const resumeLinks = document.querySelectorAll('.resume-index-link');
    const resumeListItems = document.querySelectorAll('.resume-index-list li');
    const buttonsBelowList = document.querySelector('.resume-buttons-below-list');
    
    // 클릭된 항목의 부모 li 확인
    const activeLi = link.closest('li');
    
    // 한 번에 모든 변경사항 적용 (리플로우 최소화)
    resumeLinks.forEach(l => {
        if (l === link) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    });
    
    // 리스트 항목 클래스 업데이트 (제거 후 추가가 아닌 바로 설정)
    resumeListItems.forEach(li => {
        if (li === activeLi) {
            li.classList.remove('resume-item-inactive');
            li.classList.add('resume-item-active');
        } else {
            li.classList.remove('resume-item-active');
            li.classList.add('resume-item-inactive');
        }
    });
    
    // 위로가기 버튼 표시
    if (buttonsBelowList) {
        buttonsBelowList.classList.add('has-active');
    }
    
    // 즉시 내용 표시 (성능 개선)
    showResumeContent(resumeName);
    
    // 파도 애니메이션 효과 (글자 단위) - 비동기로 실행
    const charSpans = link.querySelectorAll('.char-wrapper span');
    charSpans.forEach((span, index) => {
        setTimeout(() => {
            span.style.animation = 'charWave 0.3s ease-in-out';
            setTimeout(() => {
                span.style.animation = '';
            }, 300);
        }, index * 20);
    });
    
    // 오른쪽으로 이동하는 애니메이션 (더 짧게)
    link.classList.add('moving');
    setTimeout(() => {
        link.classList.remove('moving');
    }, 400);
}

// 이력서 내용 표시 (오른쪽 패널)
function showResumeContent(name) {
    const resumePage = document.getElementById('resume-page');
    if (!resumePage || !resumePage.classList.contains('active')) {
        console.error('resume-page가 활성화되지 않았습니다.');
        return;
    }
    
    const contentDiv = document.getElementById('resume-content-display');
    if (!contentDiv) {
        console.error('resume-content-display를 찾을 수 없습니다.');
        return;
    }
    
    // 콘텐츠 표시 후 버튼 위치 업데이트
    setTimeout(() => {
        updateResumeMobileButtons();
    }, 10);
    
    // 데스크톱/모바일 구분
    const isMobile = window.innerWidth <= 768;
    const displayTitle = !isMobile; // 데스크톱에서만 타이틀 표시
    
    // 팀 이력인 경우
    if (name === 'team') {
        const titleHtml = displayTitle ? '<h3>콜렉티브 이동식</h3>' : '';
        contentDiv.innerHTML = `
            <article class="individual-resume">
                ${titleHtml}
                <div class="resume-section">
                    <h4>구성</h4>
                    <p>구정환, 민지홍, 박중현, 석유림, 정지윤</p>
                </div>

                <div class="resume-section">
                    <h4>소개</h4>
                    <p>
                        2024년 겨울, 한예종 미술원 재학생 5명이 모여 결성된 '콜렉티브 이동식'은 미술계의 '예비적 존재자'로서 느끼는 한계와 갈증, 그 과정을 함께 나누며 오히려 확고한 토대 없이 흔들리는 존재로서 '비작업'의 영역에 머물고자 한다. 손에 잡히든 잡히지 않든 무언가를 시도하며 유머와 회복, 실천의 가능성을 모색해나간다. 이들이 함께 주목하는 것은 장소성, 관계성, 미완성, 이동성이다.
                    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;「2025 성북구청 마을만들기 공모사업」의 지원을 받아 '안녕기획부'라는 이름으로도 활동하고 있다. 돌곶이의 역사와 일상을 바탕으로 마을과 이웃의 '안녕'을 도모하는 프로젝트를 진행 중이다. 이 기획은 석관동이 과거 국가안전기획부가 자리했던 곳으로, 현재는 이웃주민과 학생 작업자들이 교차하는 공간임에도 불구하고 여전히 서로의 안녕을 묻는 시도가 부재하다는 문제의식에서 출발했다. 학생 작업자와 이웃을 연결하는 영상 스크리닝, 관객과의 대화, 제작 워크샵 등의 프로그램을 운영해왔다.
                    </p>
                </div>

                <div class="resume-section">
                    <h4>경력 및 공모당선</h4>
                    <ul>
                        <li>문화예술 / 성북구청 마을만들기 공모 사업 &lt;돌곶이 마실극장 : 열린 영상제&gt; / 화랑 어린이 공원 / 2025</li>
                        <li>문화예술 / 돌곶이 생활예술문화센터 지원 – 이미지 지도 제작 워크샵 및 사진전 &lt;기억지도 만들기&gt; / 돌곶이생활예술문화센터 / 2025</li>
                        <li>문화예술 / 돌곶이 생활예술문화센터 지원 – 핀홀 카메라 제작 워크샵 &lt;바늘 구멍 너머로 본 돌곶이&gt; / 돌곶이생활예술문화센터 / 2025</li>
                        <li>문화예술 / 성북구청 마을만들기 공모 사업 &lt;돌곶이 마실극장 : 이웃과의 만남&gt; / 돌곶이생활예술문화센터 / 2025</li>
                        <li>다원예술 / 팔레스타인 후원을 위한 아트마켓 &lt;수박에 줄긋기&gt; / 이태원 LVHS / 2025</li>
                    </ul>
                </div>

                <div class="resume-section">
                    <h4>연락망</h4>
                    <p>인스타그램 : <a href="https://www.instagram.com/leeeedongsik/" target="_blank" class="link-wave"><span class="syllable-wrapper"><span style="--char-index: 0">@</span><span style="--char-index: 1">l</span><span style="--char-index: 2">e</span><span style="--char-index: 3">e</span><span style="--char-index: 4">e</span><span style="--char-index: 5">e</span><span style="--char-index: 6">d</span><span style="--char-index: 7">o</span><span style="--char-index: 8">n</span><span style="--char-index: 9">g</span><span style="--char-index: 10">s</span><span style="--char-index: 11">i</span><span style="--char-index: 12">k</span></span></a></p>
                    <p>메일 : <a href="mailto:leeeedongsik@gmail.com" class="link-wave"><span class="syllable-wrapper"><span style="--char-index: 0">l</span><span style="--char-index: 1">e</span><span style="--char-index: 2">e</span><span style="--char-index: 3">e</span><span style="--char-index: 4">e</span><span style="--char-index: 5">d</span><span style="--char-index: 6">o</span><span style="--char-index: 7">n</span><span style="--char-index: 8">g</span><span style="--char-index: 9">s</span><span style="--char-index: 10">i</span><span style="--char-index: 11">k</span><span style="--char-index: 12">@</span><span style="--char-index: 13">g</span><span style="--char-index: 14">m</span><span style="--char-index: 15">a</span><span style="--char-index: 16">i</span><span style="--char-index: 17">l</span><span style="--char-index: 18">.</span><span style="--char-index: 19">c</span><span style="--char-index: 20">o</span><span style="--char-index: 21">m</span></span></a></p>
                </div>
            </article>
        `;
        return;
    }
    
    // 개인 이력서인 경우
    const resumeData = resumeDatabase[name];
    
    if (!resumeData) {
        contentDiv.innerHTML = '<p>이력서를 찾을 수 없습니다.</p>';
        return;
    }
    
    // 데스크톱에서만 타이틀 표시
    const titleHtml = displayTitle ? `<h3>${name}</h3>` : '';
    
    contentDiv.innerHTML = `
        <article class="individual-resume">
            ${titleHtml}
            ${resumeData.note ? `<p class="note">${resumeData.note}</p>` : ''}
            
            <div class="resume-section">
                <h4>할 수 있는 일</h4>
                <ol>
                    ${resumeData.canDo.map(item => `
                        <li>
                            <strong>${item.title}</strong>
                            <p>${item.description}</p>
                        </li>
                    `).join('')}
                </ol>
            </div>
            
            <div class="resume-section">
                <h4>${resumeData.wantToDoTitle || '해보고 싶은 일'}</h4>
                ${Array.isArray(resumeData.wantToDo) 
                    ? `<ul>${resumeData.wantToDo.map(item => {
                        if (typeof item === 'object' && item.title) {
                            return `<li><strong>${item.title}</strong><p>${item.description}</p></li>`;
                        }
                        return `<li>${item}</li>`;
                    }).join('')}</ul>`
                    : `<p>${resumeData.wantToDo}</p>`
                }
            </div>
            
            ${resumeData.cannotDo && resumeData.cannotDo.length > 0 ? `
            <div class="resume-section">
                <h4>할 수 없는 일</h4>
                <ul>
                    ${resumeData.cannotDo.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </article>
    `;
    
    // 페이드인 애니메이션 (더 빠르게)
    contentDiv.style.opacity = '0';
    requestAnimationFrame(() => {
        contentDiv.style.transition = 'opacity 0.3s ease';
        contentDiv.style.opacity = '1';
    });
}

// 홈 네비게이션 링크 초기화 (텍스트 추가 및 파도 애니메이션)
function initHomeNavLinks() {
    const navLinks = document.querySelectorAll('.home-nav-link');
    const isMobile = window.innerWidth <= 768;
    
    // data-page 속성에 따라 텍스트 매핑
    const navTextMap = {
        'manual': '시금제 메뉴얼',
        'coupons-status': '시금쿠폰 발급 현황',
        'coupons-status-issued': '시금쿠폰 발급 현황(발급)',
        'coupons-status-completed': '시금쿠폰 발급 현황(수행)',
        'resume': '콜렉티브 이동식 이력서',
        'guestbook': '방명록'
    };
    
    navLinks.forEach((link) => {
        const pageName = link.getAttribute('data-page');
        const text = navTextMap[pageName];
        
        if (text) {
            const charWrapper = link.querySelector('.char-wrapper');
            if (charWrapper) {
                charWrapper.innerHTML = text.split('').map((char, charIndex) => {
                    const charSpan = char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`;
                    return charSpan.replace('<span', `<span style="--char-index: ${charIndex}"`);
                }).join('');
            }
        }
        
        // 클릭 이벤트
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                showPage(page);
            }
        });
    });
}

// 방명록 초기화
function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    if (!form) {
        console.error('방명록 폼을 찾을 수 없습니다.');
        return;
    }
    
    console.log('방명록 폼 초기화 시작');
    
    const submitBtn = form.querySelector('.guestbook-submit-btn');
    
    // 전송 버튼 텍스트 설정 및 파도 애니메이션
    if (submitBtn) {
        const charWrapper = submitBtn.querySelector('.char-wrapper');
        if (charWrapper && !charWrapper.hasAttribute('data-initialized')) {
            charWrapper.setAttribute('data-initialized', 'true');
            const text = '전송';
            charWrapper.innerHTML = text.split('').map((char, index) => {
                return `<span style="--char-index: ${index}">${char}</span>`;
            }).join('');
        }
    }
    
    // 기존 이벤트 리스너가 있는지 확인하고 제거
    const existingHandler = form._submitHandler;
    if (existingHandler) {
        console.log('기존 이벤트 리스너 제거');
        form.removeEventListener('submit', existingHandler);
    }
    
    // 폼 제출 이벤트 핸들러
    const submitHandler = async (e) => {
        console.log('폼 제출 이벤트 발생');
        e.preventDefault();
        e.stopPropagation();
        
        const input = document.getElementById('guestbook-input');
        if (!input) {
            console.error('입력 필드를 찾을 수 없습니다.');
            return;
        }
        
        const message = input.value.trim();
        console.log('입력된 메시지:', message);
        
        if (message) {
            try {
                console.log('API 요청 시작:', `${API_BASE_URL}/guestbook`);
                const response = await fetch(`${API_BASE_URL}/guestbook`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message })
                });
                
                console.log('API 응답 상태:', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('방명록 저장 성공:', result);
                    input.value = '';
                    loadGuestbookMessages();
                } else {
                    let errorMessage = '방명록 저장에 실패했습니다.';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        console.error('방명록 저장 실패:', errorData);
                    } catch (e) {
                        console.error('방명록 저장 실패 (상태 코드):', response.status, response.statusText);
                        errorMessage = `방명록 저장에 실패했습니다. (${response.status}: ${response.statusText})`;
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('방명록 저장 오류:', error);
                const errorMessage = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
                    ? '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
                    : `방명록 저장 중 오류가 발생했습니다: ${error.message}`;
                alert(errorMessage);
            }
        } else {
            console.log('메시지가 비어있습니다.');
        }
    };
    
    // 핸들러를 폼 객체에 저장 (나중에 제거하기 위해)
    form._submitHandler = submitHandler;
    form.addEventListener('submit', submitHandler);
    console.log('이벤트 리스너 등록 완료');
    
    // 전송 버튼에 직접 클릭 이벤트도 추가 (submit 이벤트가 작동하지 않을 경우 대비)
    if (submitBtn) {
        const existingClickHandler = submitBtn._clickHandler;
        if (existingClickHandler) {
            submitBtn.removeEventListener('click', existingClickHandler);
        }
        
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('전송 버튼 클릭');
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        };
        
        submitBtn._clickHandler = clickHandler;
        submitBtn.addEventListener('click', clickHandler);
        console.log('전송 버튼 클릭 이벤트 등록 완료');
    }
    
    // 방명록 메시지 로드
    loadGuestbookMessages();
}

// 방명록 메시지 로드
async function loadGuestbookMessages() {
    try {
        // 방명록 메시지 불러오기
        const response = await fetch(`${API_BASE_URL}/guestbook`);
        if (response.ok) {
            const messages = await response.json();
            displayGuestbookMessages(messages);
        }
    } catch (error) {
        console.error('방명록 로드 오류:', error);
    }
}

// 방명록 메시지 표시
function displayGuestbookMessages(messages) {
    const isMobile = window.innerWidth <= 768;
    
    // 테스트 메시지는 이미 삭제되었으므로 필터링 불필요
    const filteredMessages = messages;
    
    // 모바일 컨테이너 (홈 화면 아래)
    const mobileContainer = document.getElementById('guestbook-messages');
    
    // 데스크톱 컨테이너 (홈 화면 오른쪽)
    const desktopContainer = document.getElementById('guestbook-desktop-messages');
    
    // 방명록 페이지 컨테이너 (데스크톱 전용)
    const guestbookPageContainer = document.getElementById('guestbook-messages-container');
    
    // 모바일 메시지 표시 - 마지막 메시지(본인이 입력한 것)만 하나만 표시
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        if (filteredMessages.length > 0) {
            // 마지막 메시지만 표시
            const lastMessage = filteredMessages[filteredMessages.length - 1];
            const messageSpan = document.createElement('span');
            messageSpan.className = 'guestbook-message';
            messageSpan.textContent = lastMessage.message;
            mobileContainer.appendChild(messageSpan);
        }
    }
    
    // 데스크톱 홈 화면 방명록 영역 표시
    if (desktopContainer) {
        desktopContainer.innerHTML = '';
        filteredMessages.forEach((msg) => {
            const messageSpan = document.createElement('span');
            messageSpan.className = 'guestbook-message';
            messageSpan.textContent = msg.message;
            desktopContainer.appendChild(messageSpan);
        });
        
        // 데스크톱 방명록 영역을 맨 아래로 스크롤
        setTimeout(() => {
            desktopContainer.scrollTo({
                top: desktopContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // 방명록 페이지 표시 (날짜별로 그룹화)
    if (guestbookPageContainer) {
        guestbookPageContainer.innerHTML = '';
        
        // 날짜별로 메시지 그룹화
        const messagesByDate = {};
        filteredMessages.forEach((msg) => {
            const date = new Date(msg.created_at);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            
            if (!messagesByDate[dateKey]) {
                messagesByDate[dateKey] = [];
            }
            messagesByDate[dateKey].push(msg);
        });
        
        // 날짜 순서대로 정렬
        const sortedDates = Object.keys(messagesByDate).sort();
        
        sortedDates.forEach((dateKey) => {
            const dateMessages = messagesByDate[dateKey];
            const date = new Date(dateKey);
            const dateStr = `${date.getFullYear().toString().substring(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}.`;
            
            // 날짜 표시 (해당 날짜의 첫 번째 메시지 위에만)
            const dateDiv = document.createElement('div');
            dateDiv.className = 'guestbook-date';
            dateDiv.textContent = dateStr;
            guestbookPageContainer.appendChild(dateDiv);
            
            // 해당 날짜의 메시지들 표시
            dateMessages.forEach((msg) => {
                const messageSpan = document.createElement('span');
                messageSpan.className = 'guestbook-message';
                messageSpan.textContent = msg.message;
                guestbookPageContainer.appendChild(messageSpan);
            });
        });
    }
}

