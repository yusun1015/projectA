// 데이터 저장소 (실제 환경에서는 서버/데이터베이스 사용)
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let currentProjectId = null;
let currentCalendarDate = new Date(); // 현재 캘린더에 표시되는 날짜

// 검색 상태
let scheduleSearchQuery = '';
let staffSearchQuery = '';
let actorSearchQuery = '';
let contractSearchQuery = '';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    currentCalendarDate = new Date(); // 오늘 날짜로 초기화
    renderProjectList();
    setupEventListeners();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 프로젝트 생성 버튼
    document.getElementById('createProjectBtn').addEventListener('click', openProjectModal);
    
    // 프로젝트 생성 폼
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    
    // 목록으로 돌아가기
    document.getElementById('backToListBtn').addEventListener('click', backToListView);
    
    // 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // 모달 닫기
    setupModalClose();
    
    // 스케줄 관리
    document.getElementById('addScheduleBtn').addEventListener('click', () => openScheduleModal());
    document.getElementById('scheduleForm').addEventListener('submit', handleScheduleSubmit);
    
    // 스케줄 검색
    const scheduleSearchInput = document.getElementById('scheduleSearchInput');
    if (scheduleSearchInput) {
        scheduleSearchInput.addEventListener('input', (e) => {
            scheduleSearchQuery = e.target.value.trim().toLowerCase();
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                renderScheduleList(project.schedules);
                // 검색은 리스트 뷰에만 적용, 캘린더는 전체 스케줄 기준
            }
        });
    }

    // 스케줄 뷰 토글 (리스트 ↔ 캘린더)
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchScheduleView(e.target.closest('.view-toggle-btn').dataset.view));
    });
    
    // 캘린더 네비게이션
    document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
    // 오늘 버튼
    const todayBtn = document.getElementById('todayBtn');
    if (todayBtn) {
        todayBtn.addEventListener('click', goToToday);
    }
    
    // 스태프 관리
    document.getElementById('addStaffBtn').addEventListener('click', () => openStaffModal());
    document.getElementById('staffForm').addEventListener('submit', handleStaffSubmit);
    // 스태프 검색
    const staffSearchInput = document.getElementById('staffSearchInput');
    if (staffSearchInput) {
        staffSearchInput.addEventListener('input', (e) => {
            staffSearchQuery = e.target.value.trim().toLowerCase();
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                renderStaffList(project.staff);
            }
        });
    }
    
    // 배우 관리
    document.getElementById('addActorBtn').addEventListener('click', () => openActorModal());
    document.getElementById('actorForm').addEventListener('submit', handleActorSubmit);
    // 배우 검색
    const actorSearchInput = document.getElementById('actorSearchInput');
    const actorImageInput = document.getElementById('actorImage');
    if (actorSearchInput) {
        actorSearchInput.addEventListener('input', (e) => {
            actorSearchQuery = e.target.value.trim().toLowerCase();
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                renderActorList(project.actors);
            }
        });
    }
    if (actorImageInput) {
        actorImageInput.addEventListener('change', handleActorImageChange);
    }

    // 예산 관리
    const setTotalBudgetBtn = document.getElementById('setTotalBudgetBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (setTotalBudgetBtn) {
        setTotalBudgetBtn.addEventListener('click', openBudgetTotalModal);
    }
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => openExpenseModal());
    }
    const budgetTotalForm = document.getElementById('budgetTotalForm');
    const expenseForm = document.getElementById('expenseForm');
    if (budgetTotalForm) {
        budgetTotalForm.addEventListener('submit', handleBudgetTotalSubmit);
    }
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }

    // 계약서 관리
    document.getElementById('addContractBtn').addEventListener('click', () => openContractModal());
    document.getElementById('contractForm').addEventListener('submit', handleContractSubmit);
    // 계약서 검색
    const contractSearchInput = document.getElementById('contractSearchInput');
    if (contractSearchInput) {
        contractSearchInput.addEventListener('input', (e) => {
            contractSearchQuery = e.target.value.trim().toLowerCase();
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                renderContractList(project.contracts);
            }
        });
    }
    // 인력 유형 변경 시 인력 목록 업데이트
    const contractPersonType = document.getElementById('contractPersonType');
    if (contractPersonType) {
        contractPersonType.addEventListener('change', updateContractPersonList);
    }
    // 계약서 파일 업로드 미리보기
    const contractFileInput = document.getElementById('contractFile');
    if (contractFileInput) {
        contractFileInput.addEventListener('change', handleContractFileChange);
    }
}

// 프로젝트 생성 모달 열기
function openProjectModal() {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    
    title.textContent = '새 프로젝트 생성';
    form.reset();
    document.getElementById('projectId').value = '';
    modal.style.display = 'block';
}

// 프로젝트 수정 모달 열기
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    
    title.textContent = '프로젝트 수정';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectStartDate').value = project.startDate;
    document.getElementById('projectEndDate').value = project.endDate;
    
    modal.style.display = 'block';
}

// 프로젝트 삭제
function deleteProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n주의: 이 프로젝트의 모든 스케줄, 스태프, 배우 정보도 함께 삭제됩니다.`)) {
        return;
    }
    
    projects = projects.filter(p => p.id !== projectId);
    saveProjects();
    renderProjectList();
    
    // 현재 보고 있던 프로젝트를 삭제한 경우 목록 뷰로 돌아가기
    if (currentProjectId === projectId) {
        backToListView();
    }
    
    alert('프로젝트가 삭제되었습니다.');
}

// 프로젝트 생성
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const project = {
        id: Date.now().toString(),
        name: formData.get('projectName'),
        description: formData.get('projectDescription'),
        startDate: formData.get('projectStartDate'),
        endDate: formData.get('projectEndDate'),
        schedules: [],
        staff: [],
        actors: [],
        contracts: [], // 계약서 정보
        // 예산 정보
        totalBudget: 0,
        expenses: [],
        createdAt: new Date().toISOString()
    };
    
    projects.push(project);
    saveProjects();
    renderProjectList();
    e.target.reset();
    closeModal('projectModal');
    
    alert('프로젝트가 생성되었습니다.');
}

// 프로젝트 목록 렌더링
function renderProjectList() {
    const projectList = document.getElementById('projectList');
    
    if (projects.length === 0) {
        projectList.innerHTML = '<p class="empty-message">생성된 프로젝트가 없습니다.</p>';
        return;
    }
    
    projectList.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-card-content" onclick="openProjectDetail('${project.id}')">
                <h3>${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.description || '설명 없음')}</p>
                <div class="project-meta">
                    <span>시작일: ${project.startDate}</span>
                    <span>종료일: ${project.endDate}</span>
                </div>
            </div>
            <div class="project-card-actions">
                <button class="btn btn-edit" onclick="event.stopPropagation(); editProject('${project.id}')">수정</button>
                <button class="btn btn-danger" onclick="event.stopPropagation(); deleteProject('${project.id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 프로젝트 상세 관리 열기
function openProjectDetail(projectId) {
    currentProjectId = projectId;
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    // 뷰 전환
    document.getElementById('projectListSection').classList.remove('active');
    document.getElementById('projectDetailSection').classList.add('active');
    
    // 프로젝트 정보 표시
    document.getElementById('detailProjectName').textContent = project.name;
    document.getElementById('detailProjectDescription').textContent = project.description || '';
    
    // 탭 초기화
    switchTab('schedule');
    renderManagementLists();
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 목록 뷰로 돌아가기
function backToListView() {
    document.getElementById('projectDetailSection').classList.remove('active');
    document.getElementById('projectListSection').classList.add('active');
    currentProjectId = null;
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 탭 전환
function switchTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // 탭 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
    
    renderManagementLists();
    
    // 스케줄 탭인 경우 캘린더 뷰가 기본이므로 캘린더 렌더링
    if (tabName === 'schedule') {
        const calendarView = document.getElementById('scheduleCalendarView');
        if (calendarView && calendarView.classList.contains('active')) {
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                renderScheduleCalendar(project.schedules);
            }
        }
    }

    // 예산 탭에서 진입 시 요약/리스트 갱신
    if (tabName === 'budget' && currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
            renderBudgetSummary(project);
            renderExpenseList(project.expenses || []);
        }
    }
    // 계약서 탭에서 진입 시 리스트 갱신
    if (tabName === 'contract' && currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
            renderContractList(project.contracts || []);
        }
    }
}

// 관리 리스트 렌더링
function renderManagementLists() {
    if (!currentProjectId) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    renderScheduleList(project.schedules);
    // 캘린더 뷰가 활성화되어 있으면 캘린더 렌더링
    const calendarView = document.getElementById('scheduleCalendarView');
    if (calendarView && calendarView.classList.contains('active')) {
        renderScheduleCalendar(project.schedules);
    }
    renderStaffList(project.staff);
    renderActorList(project.actors);
    renderContractList(project.contracts || []);
    renderBudgetSummary(project);
    renderExpenseList(project.expenses || []);
}

// 스케줄 목록 렌더링
function renderScheduleList(schedules) {
    const scheduleList = document.getElementById('scheduleList');
    
    // 검색 필터 적용
    let filtered = [...schedules];
    if (scheduleSearchQuery) {
        filtered = filtered.filter((s) => {
            const target = [
                s.title,
                s.location,
                s.description,
                s.date,
                s.time,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return target.includes(scheduleSearchQuery);
        });
    }

    if (filtered.length === 0) {
        scheduleList.innerHTML = '<p class="empty-message">등록된 스케줄이 없습니다.</p>';
        return;
    }
    
    // 날짜별로 정렬
    const sortedSchedules = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    scheduleList.innerHTML = sortedSchedules.map(schedule => `
        <div class="management-item">
            <div class="management-item-content">
                <h4>${escapeHtml(schedule.title)}</h4>
                <p><strong>날짜:</strong> ${schedule.date} ${schedule.time}</p>
                <p><strong>장소:</strong> ${escapeHtml(schedule.location || '미정')}</p>
                <p>${escapeHtml(schedule.description || '')}</p>
            </div>
            <div class="management-item-actions">
                <button class="btn btn-edit" onclick="editSchedule('${schedule.id}')">수정</button>
                <button class="btn btn-danger" onclick="deleteSchedule('${schedule.id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 스태프 목록 렌더링
function renderStaffList(staff) {
    const staffList = document.getElementById('staffList');
    
    // 검색 필터 적용
    let filtered = [...staff];
    if (staffSearchQuery) {
        filtered = filtered.filter((s) => {
            const target = [
                s.name,
                s.role,
                s.contact,
                s.email,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return target.includes(staffSearchQuery);
        });
    }

    if (filtered.length === 0) {
        staffList.innerHTML = '<p class="empty-message">등록된 스태프가 없습니다.</p>';
        return;
    }
    
    staffList.innerHTML = filtered.map(s => `
        <div class="management-item">
            <div class="management-item-content">
                <h4>${escapeHtml(s.name)}</h4>
                <p><strong>역할:</strong> ${escapeHtml(s.role)}</p>
                <p><strong>연락처:</strong> ${escapeHtml(s.contact || '미정')}</p>
                <p><strong>이메일:</strong> ${escapeHtml(s.email || '미정')}</p>
            </div>
            <div class="management-item-actions">
                <button class="btn btn-edit" onclick="editStaff('${s.id}')">수정</button>
                <button class="btn btn-danger" onclick="deleteStaff('${s.id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 배우 목록 렌더링
function renderActorList(actors) {
    const actorList = document.getElementById('actorList');
    
    // 검색 필터 적용
    let filtered = [...actors];
    if (actorSearchQuery) {
        filtered = filtered.filter((a) => {
            const target = [
                a.name,
                a.role,
                a.contact,
                a.email,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return target.includes(actorSearchQuery);
        });
    }

    if (filtered.length === 0) {
        actorList.innerHTML = '<p class="empty-message">등록된 배우가 없습니다.</p>';
        return;
    }
    
    actorList.innerHTML = filtered.map(actor => `
        <div class="management-item actor-item">
            <div class="management-item-content">
                ${actor.image ? `<div class="actor-avatar"><img src="${actor.image}" alt="${escapeHtml(actor.name)}" /></div>` : ''}
                <div class="actor-text">
                <h4>${escapeHtml(actor.name)}</h4>
                <p><strong>역할:</strong> ${escapeHtml(actor.role)}</p>
                <p><strong>연락처:</strong> ${escapeHtml(actor.contact || '미정')}</p>
                <p><strong>이메일:</strong> ${escapeHtml(actor.email || '미정')}</p>
                </div>
            </div>
            <div class="management-item-actions">
                <button class="btn btn-edit" onclick="editActor('${actor.id}')">수정</button>
                <button class="btn btn-danger" onclick="deleteActor('${actor.id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 스케줄 모달 열기
function openScheduleModal(scheduleId = null) {
    const modal = document.getElementById('scheduleModal');
    const form = document.getElementById('scheduleForm');
    const title = document.getElementById('scheduleModalTitle');
    
    if (scheduleId) {
        const project = projects.find(p => p.id === currentProjectId);
        const schedule = project.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            title.textContent = '스케줄 수정';
            document.getElementById('scheduleId').value = schedule.id;
            document.getElementById('scheduleTitle').value = schedule.title;
            document.getElementById('scheduleDate').value = schedule.date;
            document.getElementById('scheduleTime').value = schedule.time;
            document.getElementById('scheduleLocation').value = schedule.location || '';
            document.getElementById('scheduleDescription').value = schedule.description || '';
        }
    } else {
        title.textContent = '스케줄 추가';
        form.reset();
        document.getElementById('scheduleId').value = '';
        // 오늘 날짜와 현재 시간을 기본값으로 설정 (Google Calendar 스타일)
        const now = new Date();
        document.getElementById('scheduleDate').value = formatDate(now);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('scheduleTime').value = `${hours}:${minutes}`;
    }
    
    modal.style.display = 'block';
    // 제목 입력란에 포커스 (Google Calendar처럼 빠른 입력 가능)
    setTimeout(() => {
        document.getElementById('scheduleTitle').focus();
    }, 100);
}

// 날짜 클릭으로 스케줄 모달 열기 (Google Calendar 스타일)
function openScheduleModalFromDate(dateStr) {
    const modal = document.getElementById('scheduleModal');
    const form = document.getElementById('scheduleForm');
    const title = document.getElementById('scheduleModalTitle');
    
    title.textContent = '스케줄 추가';
    form.reset();
    document.getElementById('scheduleId').value = '';
    
    // 클릭한 날짜를 기본값으로 설정
    document.getElementById('scheduleDate').value = dateStr;
    
    // 현재 시간을 기본값으로 설정 (Google Calendar처럼)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('scheduleTime').value = `${hours}:${minutes}`;
    
    modal.style.display = 'block';
    // 제목 입력란에 포커스 (Google Calendar처럼 빠른 입력 가능)
    setTimeout(() => {
        document.getElementById('scheduleTitle').focus();
    }, 100);
}

// 스케줄 저장
function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const scheduleId = document.getElementById('scheduleId').value;
    const schedule = {
        id: scheduleId || Date.now().toString(),
        title: document.getElementById('scheduleTitle').value,
        date: document.getElementById('scheduleDate').value,
        time: document.getElementById('scheduleTime').value,
        location: document.getElementById('scheduleLocation').value,
        description: document.getElementById('scheduleDescription').value
    };
    
    if (scheduleId) {
        const index = project.schedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            project.schedules[index] = schedule;
        }
    } else {
        project.schedules.push(schedule);
    }
    
    saveProjects();
    renderScheduleList(project.schedules);
    renderScheduleCalendar(project.schedules);
    closeModal('scheduleModal');
}

// 스케줄 수정
function editSchedule(scheduleId) {
    openScheduleModal(scheduleId);
}

// 스케줄 삭제
function deleteSchedule(scheduleId) {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    project.schedules = project.schedules.filter(s => s.id !== scheduleId);
    saveProjects();
    renderScheduleList(project.schedules);
    renderScheduleCalendar(project.schedules);
}

// 스케줄 뷰 전환 (리스트 ↔ 캘린더)
function switchScheduleView(view) {
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    document.getElementById('scheduleListView').classList.toggle('active', view === 'list');
    document.getElementById('scheduleCalendarView').classList.toggle('active', view === 'calendar');
    
    if (view === 'calendar') {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
            renderScheduleCalendar(project.schedules);
        }
    }
}

// 캘린더 월 변경
function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
        renderScheduleCalendar(project.schedules);
    }
}

// 오늘 날짜로 이동
function goToToday() {
    currentCalendarDate = new Date();
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
        renderScheduleCalendar(project.schedules);
    }
}

// 스케줄 캘린더 렌더링
function renderScheduleCalendar(schedules) {
    const calendarDays = document.getElementById('calendarDays');
    const monthYear = document.getElementById('calendarMonthYear');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // 월/년도 표시
    monthYear.textContent = `${year}년 ${month + 1}월`;
    
    // 첫 날짜와 마지막 날짜 계산
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 주의 첫날 (일요일)
    
    // 캘린더 생성
    let html = '';
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6주 * 7일
        const dateStr = formatDate(currentDate);
        const daySchedules = schedules.filter(s => s.date === dateStr);
        const isOtherMonth = currentDate.getMonth() !== month;
        const isToday = isTodayDate(currentDate);
        
        html += `<div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}" onclick="openScheduleModalFromDate('${dateStr}')">`;
        html += `<div class="calendar-day-number">${currentDate.getDate()}</div>`;
        
        if (daySchedules.length > 0) {
            html += '<div class="calendar-events">';
            daySchedules.slice(0, 3).forEach(schedule => {
                html += `<div class="calendar-event" onclick="event.stopPropagation(); editSchedule('${schedule.id}')" title="${escapeHtml(schedule.title)}">${escapeHtml(schedule.title)}</div>`;
            });
            if (daySchedules.length > 3) {
                html += `<div class="calendar-event" style="background: #999;" onclick="event.stopPropagation()">+${daySchedules.length - 3}개 더</div>`;
            }
            html += '</div>';
        }
        
        html += '</div>';
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    calendarDays.innerHTML = html;
}

// 날짜 포맷팅 (YYYY-MM-DD)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 오늘 날짜인지 확인
function isTodayDate(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// 스태프 모달 열기
function openStaffModal(staffId = null) {
    const modal = document.getElementById('staffModal');
    const form = document.getElementById('staffForm');
    const title = document.getElementById('staffModalTitle');
    
    if (staffId) {
        const project = projects.find(p => p.id === currentProjectId);
        const staff = project.staff.find(s => s.id === staffId);
        if (staff) {
            title.textContent = '스태프 수정';
            document.getElementById('staffId').value = staff.id;
            document.getElementById('staffName').value = staff.name;
            document.getElementById('staffRole').value = staff.role;
            document.getElementById('staffContact').value = staff.contact || '';
            document.getElementById('staffEmail').value = staff.email || '';
        }
    } else {
        title.textContent = '스태프 추가';
        form.reset();
        document.getElementById('staffId').value = '';
    }
    
    modal.style.display = 'block';
}

// 스태프 저장
function handleStaffSubmit(e) {
    e.preventDefault();
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const staffId = document.getElementById('staffId').value;
    const staff = {
        id: staffId || Date.now().toString(),
        name: document.getElementById('staffName').value,
        role: document.getElementById('staffRole').value,
        contact: document.getElementById('staffContact').value,
        email: document.getElementById('staffEmail').value
    };
    
    if (staffId) {
        const index = project.staff.findIndex(s => s.id === staffId);
        if (index !== -1) {
            project.staff[index] = staff;
        }
    } else {
        project.staff.push(staff);
    }
    
    saveProjects();
    renderStaffList(project.staff);
    closeModal('staffModal');
}

// 스태프 수정
function editStaff(staffId) {
    openStaffModal(staffId);
}

// 스태프 삭제
function deleteStaff(staffId) {
    if (!confirm('이 스태프를 삭제하시겠습니까?')) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    project.staff = project.staff.filter(s => s.id !== staffId);
    saveProjects();
    renderStaffList(project.staff);
}

// 배우 모달 열기
function openActorModal(actorId = null) {
    const modal = document.getElementById('actorModal');
    const form = document.getElementById('actorForm');
    const title = document.getElementById('actorModalTitle');
    const imageInput = document.getElementById('actorImage');
    const previewContainer = document.getElementById('actorImagePreviewContainer');
    const previewImg = document.getElementById('actorImagePreview');
    
    if (actorId) {
        const project = projects.find(p => p.id === currentProjectId);
        const actor = project.actors.find(a => a.id === actorId);
        if (actor) {
            title.textContent = '배우 수정';
            document.getElementById('actorId').value = actor.id;
            document.getElementById('actorName').value = actor.name;
            if (previewContainer && previewImg) {
                if (actor.image) {
                    previewImg.src = actor.image;
                    previewContainer.style.display = 'block';
                } else {
                    previewImg.src = '';
                    previewContainer.style.display = 'none';
                }
            }
            document.getElementById('actorRole').value = actor.role;
            document.getElementById('actorContact').value = actor.contact || '';
            document.getElementById('actorEmail').value = actor.email || '';
        }
    } else {
        title.textContent = '배우 추가';
        form.reset();
        document.getElementById('actorId').value = '';
        if (imageInput) {
            imageInput.value = '';
        }
        if (previewContainer && previewImg) {
            previewImg.src = '';
            previewContainer.style.display = 'none';
        }
    }
    
    modal.style.display = 'block';
}

// 배우 저장
function handleActorSubmit(e) {
    e.preventDefault();
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const actorId = document.getElementById('actorId').value;
    const existingActor = actorId ? project.actors.find(a => a.id === actorId) : null;
    const imageInput = document.getElementById('actorImage');
    const file = imageInput && imageInput.files ? imageInput.files[0] : null;

    const createOrUpdateActor = (imageData) => {
        const actor = {
            id: actorId || Date.now().toString(),
            name: document.getElementById('actorName').value,
            role: document.getElementById('actorRole').value,
            contact: document.getElementById('actorContact').value,
            email: document.getElementById('actorEmail').value,
            image: imageData || (existingActor && existingActor.image) || ''
        };

        if (actorId) {
            const index = project.actors.findIndex(a => a.id === actorId);
            if (index !== -1) {
                project.actors[index] = actor;
            }
        } else {
            project.actors.push(actor);
        }

        saveProjects();
        renderActorList(project.actors);
        closeModal('actorModal');
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            createOrUpdateActor(event.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        createOrUpdateActor(existingActor && existingActor.image ? existingActor.image : '');
    }
}

// 배우 수정
function editActor(actorId) {
    openActorModal(actorId);
}

// 배우 삭제
function deleteActor(actorId) {
    if (!confirm('이 배우를 삭제하시겠습니까?')) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    project.actors = project.actors.filter(a => a.id !== actorId);
    saveProjects();
    renderActorList(project.actors);
}

// 배우 이미지 선택 시 미리보기
function handleActorImageChange(e) {
    const file = e.target.files && e.target.files[0];
    const previewContainer = document.getElementById('actorImagePreviewContainer');
    const previewImg = document.getElementById('actorImagePreview');

    if (!previewContainer || !previewImg) return;

    if (!file) {
        previewImg.src = '';
        previewContainer.style.display = 'none';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        previewImg.src = event.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// =========================
// 예산 관리
// =========================

function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '0원';
    return Number(amount).toLocaleString('ko-KR') + '원';
}

// 예산 요약 렌더링
function renderBudgetSummary(project) {
    const totalEl = document.getElementById('totalBudgetAmount');
    const usedEl = document.getElementById('usedBudgetAmount');
    const remainingEl = document.getElementById('remainingBudgetAmount');

    if (!totalEl || !usedEl || !remainingEl) return;

    const total = project.totalBudget || 0;
    const expenses = project.expenses || [];
    const used = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const remaining = total - used;

    totalEl.textContent = total > 0 ? formatCurrency(total) : '-';
    usedEl.textContent = used > 0 ? formatCurrency(used) : '-';
    remainingEl.textContent = total > 0 ? formatCurrency(remaining) : '-';
}

// 비용 리스트 렌더링
function renderExpenseList(expenses) {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;

    if (!expenses || expenses.length === 0) {
        expenseList.innerHTML = '<p class="empty-message">등록된 비용 내역이 없습니다.</p>';
        return;
    }

    // 최신 사용일 순 정렬
    const sorted = [...expenses].sort((a, b) => {
        const da = new Date(a.date || '1970-01-01');
        const db = new Date(b.date || '1970-01-01');
        return db - da;
    });

    expenseList.innerHTML = sorted.map(expense => `
        <div class="management-item">
            <div class="management-item-content">
                <h4>${escapeHtml(expense.title)}</h4>
                <p><strong>금액:</strong> ${formatCurrency(expense.amount)}</p>
                <p><strong>사용일:</strong> ${expense.date || '-'}</p>
                <p>${escapeHtml(expense.memo || '')}</p>
            </div>
            <div class="management-item-actions">
                <button class="btn btn-edit" onclick="editExpense('${expense.id}')">수정</button>
                <button class="btn btn-danger" onclick="deleteExpense('${expense.id}')">삭제</button>
            </div>
        </div>
    `).join('');
}

// 전체 예산 모달 열기
function openBudgetTotalModal() {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const modal = document.getElementById('budgetTotalModal');
    const input = document.getElementById('totalBudgetInput');
    if (!modal || !input) return;

    input.value = project.totalBudget || 0;
    modal.style.display = 'block';
}

// 전체 예산 저장
function handleBudgetTotalSubmit(e) {
    e.preventDefault();
    if (!currentProjectId) return;

    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const input = document.getElementById('totalBudgetInput');
    const value = Number(input.value || 0);
    project.totalBudget = isNaN(value) ? 0 : value;

    saveProjects();
    renderBudgetSummary(project);
    closeModal('budgetTotalModal');
}

// 비용 모달 열기
function openExpenseModal(expenseId = null) {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const modal = document.getElementById('expenseModal');
    const titleEl = document.getElementById('expenseModalTitle');
    const form = document.getElementById('expenseForm');
    if (!modal || !titleEl || !form) return;

    const idInput = document.getElementById('expenseId');
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const dateInput = document.getElementById('expenseDate');
    const memoInput = document.getElementById('expenseMemo');

    if (expenseId) {
        const expense = project.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        titleEl.textContent = '비용 사용 기록 수정';
        idInput.value = expense.id;
        titleInput.value = expense.title || '';
        amountInput.value = expense.amount || 0;
        dateInput.value = expense.date || '';
        memoInput.value = expense.memo || '';
    } else {
        titleEl.textContent = '비용 사용 기록 추가';
        form.reset();
        idInput.value = '';
        // 기본값: 오늘 날짜
        const today = new Date();
        dateInput.value = formatDate(today);
    }

    modal.style.display = 'block';
}

// 비용 저장
function handleExpenseSubmit(e) {
    e.preventDefault();
    if (!currentProjectId) return;

    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    if (!project.expenses) {
        project.expenses = [];
    }

    const idInput = document.getElementById('expenseId');
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const dateInput = document.getElementById('expenseDate');
    const memoInput = document.getElementById('expenseMemo');

    const expenseId = idInput.value;
    const expense = {
        id: expenseId || Date.now().toString(),
        title: titleInput.value,
        amount: Number(amountInput.value || 0),
        date: dateInput.value,
        memo: memoInput.value
    };

    if (expenseId) {
        const index = project.expenses.findIndex(e2 => e2.id === expenseId);
        if (index !== -1) {
            project.expenses[index] = expense;
        }
    } else {
        project.expenses.push(expense);
    }

    saveProjects();
    renderBudgetSummary(project);
    renderExpenseList(project.expenses);
    closeModal('expenseModal');
}

// 비용 수정
function editExpense(expenseId) {
    openExpenseModal(expenseId);
}

// 비용 삭제
function deleteExpense(expenseId) {
    if (!confirm('이 비용 내역을 삭제하시겠습니까?')) return;
    if (!currentProjectId) return;

    const project = projects.find(p => p.id === currentProjectId);
    if (!project || !project.expenses) return;

    project.expenses = project.expenses.filter(e => e.id !== expenseId);
    saveProjects();
    renderBudgetSummary(project);
    renderExpenseList(project.expenses);
}

// 모달 닫기 설정
function setupModalClose() {
    const modals = ['projectModal', 'scheduleModal', 'staffModal', 'actorModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => closeModal(modalId));
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    });
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 프로젝트 저장 (로컬스토리지)
function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 계약서 목록 렌더링
function renderContractList(contracts) {
    const contractList = document.getElementById('contractList');
    
    // 검색 필터 적용
    let filtered = [...contracts];
    if (contractSearchQuery) {
        filtered = filtered.filter((c) => {
            const project = projects.find(p => p.id === currentProjectId);
            if (!project) return false;
            
            // 인력 이름 찾기
            let personName = '';
            if (c.personType === 'actor') {
                const actor = project.actors.find(a => a.id === c.personId);
                personName = actor ? actor.name : '';
            } else if (c.personType === 'staff') {
                const staff = project.staff.find(s => s.id === c.personId);
                personName = staff ? staff.name : '';
            }
            
            const target = [
                personName,
                c.title,
                c.memo,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return target.includes(contractSearchQuery);
        });
    }

    if (filtered.length === 0) {
        contractList.innerHTML = '<p class="empty-message">등록된 계약서가 없습니다.</p>';
        return;
    }
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    // 계약일 기준 내림차순 정렬 (최신순)
    const sortedContracts = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    contractList.innerHTML = sortedContracts.map(contract => {
        // 인력 이름 찾기
        let personName = '';
        let personRole = '';
        if (contract.personType === 'actor') {
            const actor = project.actors.find(a => a.id === contract.personId);
            if (actor) {
                personName = actor.name;
                personRole = actor.role;
            }
        } else if (contract.personType === 'staff') {
            const staff = project.staff.find(s => s.id === contract.personId);
            if (staff) {
                personName = staff.name;
                personRole = staff.role;
            }
        }
        
        const fileIcon = contract.fileName ? '📄' : '📝';
        const expiryInfo = contract.expiryDate ? 
            `<p><strong>만료일:</strong> ${contract.expiryDate} ${isContractExpired(contract.expiryDate) ? '<span style="color: #d73a49; font-weight: 600;">(만료됨)</span>' : ''}</p>` : 
            '';
        
        return `
            <div class="management-item">
                <div class="management-item-content">
                    <h4>${fileIcon} ${escapeHtml(contract.title)}</h4>
                    <p><strong>인력:</strong> ${escapeHtml(personName)} (${contract.personType === 'actor' ? '배우' : '스태프'})</p>
                    ${personRole ? `<p><strong>역할:</strong> ${escapeHtml(personRole)}</p>` : ''}
                    <p><strong>계약일:</strong> ${contract.date}</p>
                    ${expiryInfo}
                    ${contract.fileName ? `<p><strong>파일:</strong> ${escapeHtml(contract.fileName)}</p>` : ''}
                    ${contract.memo ? `<p>${escapeHtml(contract.memo)}</p>` : ''}
                </div>
                <div class="management-item-actions">
                    ${contract.fileData ? `<button class="btn btn-secondary" onclick="downloadContract('${contract.id}')" style="margin-right: 0.5rem;">다운로드</button>` : ''}
                    <button class="btn btn-edit" onclick="editContract('${contract.id}')">수정</button>
                    <button class="btn btn-danger" onclick="deleteContract('${contract.id}')">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

// 계약서 만료 여부 확인
function isContractExpired(expiryDate) {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry < today;
}

// 계약서 모달 열기
function openContractModal(contractId = null) {
    const modal = document.getElementById('contractModal');
    const form = document.getElementById('contractForm');
    const title = document.getElementById('contractModalTitle');
    
    if (contractId) {
        const project = projects.find(p => p.id === currentProjectId);
        const contract = project.contracts.find(c => c.id === contractId);
        if (contract) {
            title.textContent = '계약서 수정';
            document.getElementById('contractId').value = contract.id;
            document.getElementById('contractPersonType').value = contract.personType;
            updateContractPersonList(); // 인력 목록 업데이트
            setTimeout(() => {
                document.getElementById('contractPersonId').value = contract.personId;
            }, 100);
            document.getElementById('contractTitle').value = contract.title;
            document.getElementById('contractDate').value = contract.date;
            document.getElementById('contractExpiryDate').value = contract.expiryDate || '';
            document.getElementById('contractMemo').value = contract.memo || '';
            
            // 기존 파일 정보 표시
            if (contract.fileName) {
                const previewContainer = document.getElementById('contractFilePreviewContainer');
                const preview = document.getElementById('contractFilePreview');
                previewContainer.style.display = 'block';
                preview.innerHTML = `
                    <div style="padding: 0.5rem; background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 3px;">
                        <p style="margin: 0; font-size: 0.875rem;"><strong>현재 파일:</strong> ${escapeHtml(contract.fileName)}</p>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6a737d;">새 파일을 선택하면 기존 파일이 교체됩니다.</p>
                    </div>
                `;
            } else {
                document.getElementById('contractFilePreviewContainer').style.display = 'none';
            }
        }
    } else {
        title.textContent = '계약서 추가';
        form.reset();
        document.getElementById('contractId').value = '';
        document.getElementById('contractPersonId').innerHTML = '<option value="">인력 유형을 먼저 선택하세요</option>';
        document.getElementById('contractFilePreviewContainer').style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// 인력 유형 선택 시 인력 목록 업데이트
function updateContractPersonList() {
    const personType = document.getElementById('contractPersonType').value;
    const personSelect = document.getElementById('contractPersonId');
    
    personSelect.innerHTML = '<option value="">선택하세요</option>';
    
    if (!personType || !currentProjectId) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    if (personType === 'actor') {
        project.actors.forEach(actor => {
            const option = document.createElement('option');
            option.value = actor.id;
            option.textContent = `${actor.name} (${actor.role})`;
            personSelect.appendChild(option);
        });
    } else if (personType === 'staff') {
        project.staff.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = `${staff.name} (${staff.role})`;
            personSelect.appendChild(option);
        });
    }
}

// 계약서 파일 업로드 미리보기
function handleContractFileChange(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('contractFilePreviewContainer');
    const preview = document.getElementById('contractFilePreview');
    
    if (!file) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'block';
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        preview.innerHTML = '<p style="color: #d73a49; font-size: 0.875rem;">파일 크기는 10MB를 초과할 수 없습니다.</p>';
        e.target.value = '';
        return;
    }
    
    // 파일 타입 확인
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';
    
    if (isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
            preview.innerHTML = `
                <div style="margin-top: 0.5rem;">
                    <img src="${event.target.result}" alt="미리보기" style="max-width: 100%; max-height: 200px; border: 1px solid #e1e4e8; border-radius: 3px;">
                    <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #6a737d;">${escapeHtml(file.name)} (${formatFileSize(file.size)})</p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else if (isPdf) {
        preview.innerHTML = `
            <div style="padding: 0.5rem; background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 3px; margin-top: 0.5rem;">
                <p style="margin: 0; font-size: 0.875rem;">📄 <strong>${escapeHtml(file.name)}</strong></p>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6a737d;">${formatFileSize(file.size)}</p>
            </div>
        `;
    } else {
        preview.innerHTML = `
            <div style="padding: 0.5rem; background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 3px; margin-top: 0.5rem;">
                <p style="margin: 0; font-size: 0.875rem;">📄 <strong>${escapeHtml(file.name)}</strong></p>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6a737d;">${formatFileSize(file.size)}</p>
            </div>
        `;
    }
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 계약서 저장
function handleContractSubmit(e) {
    e.preventDefault();
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const contractId = document.getElementById('contractId').value;
    const personType = document.getElementById('contractPersonType').value;
    const personId = document.getElementById('contractPersonId').value;
    const title = document.getElementById('contractTitle').value;
    const date = document.getElementById('contractDate').value;
    const expiryDate = document.getElementById('contractExpiryDate').value;
    const memo = document.getElementById('contractMemo').value;
    const fileInput = document.getElementById('contractFile');
    
    // 파일 처리
    let fileData = null;
    let fileName = null;
    let fileType = null;
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName = file.name;
        fileType = file.type;
        
        // 파일을 Base64로 변환
        const reader = new FileReader();
        reader.onload = (event) => {
            fileData = event.target.result;
            saveContract(contractId, personType, personId, title, date, expiryDate, memo, fileData, fileName, fileType);
        };
        reader.readAsDataURL(file);
    } else {
        // 기존 파일 유지
        if (contractId) {
            const existingContract = project.contracts.find(c => c.id === contractId);
            if (existingContract) {
                fileData = existingContract.fileData;
                fileName = existingContract.fileName;
                fileType = existingContract.fileType;
            }
        }
        saveContract(contractId, personType, personId, title, date, expiryDate, memo, fileData, fileName, fileType);
    }
}

// 계약서 저장 (내부 함수)
function saveContract(contractId, personType, personId, title, date, expiryDate, memo, fileData, fileName, fileType) {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    if (!project.contracts) {
        project.contracts = [];
    }
    
    const contract = {
        id: contractId || Date.now().toString(),
        personType: personType,
        personId: personId,
        title: title,
        date: date,
        expiryDate: expiryDate || null,
        memo: memo || '',
        fileData: fileData,
        fileName: fileName,
        fileType: fileType,
        createdAt: contractId ? project.contracts.find(c => c.id === contractId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };
    
    if (contractId) {
        const index = project.contracts.findIndex(c => c.id === contractId);
        if (index !== -1) {
            project.contracts[index] = contract;
        }
    } else {
        project.contracts.push(contract);
    }
    
    saveProjects();
    renderContractList(project.contracts);
    closeModal('contractModal');
}

// 계약서 수정
function editContract(contractId) {
    openContractModal(contractId);
}

// 계약서 삭제
function deleteContract(contractId) {
    if (!confirm('이 계약서를 삭제하시겠습니까?')) return;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    project.contracts = (project.contracts || []).filter(c => c.id !== contractId);
    saveProjects();
    renderContractList(project.contracts);
}

// 계약서 다운로드
function downloadContract(contractId) {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const contract = project.contracts.find(c => c.id === contractId);
    if (!contract || !contract.fileData) return;
    
    // Base64 데이터를 Blob으로 변환
    const byteCharacters = atob(contract.fileData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contract.fileType || 'application/octet-stream' });
    
    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = contract.fileName || 'contract';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 전역 함수로 등록 (HTML에서 호출하기 위해)
window.openProjectDetail = openProjectDetail;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.openScheduleModalFromDate = openScheduleModalFromDate;
window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;
window.editStaff = editStaff;
window.deleteStaff = deleteStaff;
window.editActor = editActor;
window.deleteActor = deleteActor;
window.editContract = editContract;
window.deleteContract = deleteContract;
window.downloadContract = downloadContract;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
