const API_BASE = '/api';

// ====== 新增：登录/注册 本地会话 ======
const TOKEN_KEY = 'authToken';
const USER_KEY  = 'authUser';

let currentUser = null;
let selectedSeat = null;
let searchParams = {};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();         // << 先初始化登录/注册UI（可能会设置 currentUser）
    if (!currentUser) {
        // 未登录时可保留下拉框选择老方式（演示/测试用）
        loadUsers();
    } else {
        // 已登录直接加载“我的预约”
        loadMyBookings();
    }
    setDefaultDate();
    loadTodayStats();
});

// ====== 登录/注册 辅助函数 ======
function saveAuth(token, user) {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    if (user)  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

function readAuth() {
    try {
        const token = sessionStorage.getItem(TOKEN_KEY);
        const user  = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
        return { token, user };
    } catch {
        return { token: null, user: null };
    }
}

function initAuthUI() {
    const { token, user } = readAuth();
    const authSection  = document.getElementById('authSection');
    const loginForm    = document.getElementById('login-form');
    const regForm      = document.getElementById('register-form');
    const showRegBtn   = document.getElementById('show-register');
    const cancelRegBtn = document.getElementById('cancel-register');
    const authLogged   = document.getElementById('auth-logged');
    const logoutBtn    = document.getElementById('logoutBtn');

    // 事件绑定（只绑定一次）
    if (showRegBtn) {
        showRegBtn.onclick = () => {
            loginForm.style.display = 'none';
            regForm.style.display = 'block';
        };
    }
    if (cancelRegBtn) {
        cancelRegBtn.onclick = () => {
            regForm.style.display = 'none';
            loginForm.style.display = 'block';
        };
    }
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            clearAuth();
            currentUser = null;
            document.getElementById('currentUser').textContent = '';
            // 显示登录表单、隐藏“已登录”
            if (authSection) {
                loginForm.style.display = 'block';
                regForm.style.display   = 'none';
                authLogged.style.display = 'none';
            }
            // 重新显示用户下拉框提示
            const select = document.getElementById('userSelect');
        if (!select) return;
            if (select) select.parentElement.style.display = '';
            document.getElementById('myBookings').innerHTML =
              '<div class="empty-state"><div class="empty-state-icon">👤</div><p>请先登录或选择用户</p></div>';
        };
    }

    // 已登录：设置 currentUser、隐藏登录区、隐藏用户下拉框
    if (token && user) {
        currentUser = {
            id: user.id,
            name: user.name && user.name.trim() ? user.name : user.username,
            username: user.username
        };
        document.getElementById('currentUser').textContent = `当前用户: ${currentUser.name}`;
        if (authSection) {
            loginForm.style.display   = 'none';
            regForm.style.display     = 'none';
            authLogged.style.display  = 'block';
        }
        const select = document.getElementById('userSelect');
        if (!select) return;
        if (select) select.parentElement.style.display = 'none'; // 隐藏老的“选择用户”UI
    } else {
        // 未登录：显示登录表单
        if (authSection) {
            loginForm.style.display   = 'block';
            regForm.style.display     = 'none';
            authLogged.style.display  = 'none';
        }
    }

    // 绑定登录提交
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!username || !password) return alert('请输入用户名和密码');

            try {
                const resp = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await resp.json();
                if (!resp.ok) return alert(data.message || '登录失败');

                saveAuth(data.token, data.user);
                currentUser = {
                    id: data.user.id,
                    name: data.user.name && data.user.name.trim() ? data.user.name : data.user.username,
                    username: data.user.username
                };
                document.getElementById('currentUser').textContent = `当前用户: ${currentUser.name}`;
                // 登录成功：隐藏登录区，隐藏选择用户，加载我的预约
                loginForm.style.display = 'none';
                document.getElementById('auth-logged').style.display = 'block';
                const select = document.getElementById('userSelect');
        if (!select) return;
                if (select) select.parentElement.style.display = 'none';
                loadMyBookings();
            } catch (err) {
                console.error(err);
                alert('登录失败');
            }
        };
    }

    // 绑定注册提交
    if (regForm) {
        regForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value.trim();
            const password = document.getElementById('new-password').value.trim();
            if (!username || !password) return alert('请输入用户名和密码');

            try {
                const resp = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await resp.json();
                if (!resp.ok) return alert(data.message || '注册失败');

                alert('注册成功，已自动登录');
                saveAuth(data.token, data.user);
                currentUser = {
                    id: data.user.id,
                    name: data.user.name && data.user.name.trim() ? data.user.name : data.user.username,
                    username: data.user.username
                };
                document.getElementById('currentUser').textContent = `当前用户: ${currentUser.name}`;
                // 注册成功：切换到“已登录”视图
                regForm.style.display = 'none';
                document.getElementById('auth-logged').style.display = 'block';
                const select = document.getElementById('userSelect');
        if (!select) return;
                if (select) select.parentElement.style.display = 'none';
                loadMyBookings();
            } catch (err) {
                console.error(err);
                alert('注册失败');
            }
        };
    }
}

// ====== 你原有逻辑（选座、预约等） ======

// 设置默认日期为今天
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('searchDate').value = today;
}

// 加载用户列表（未登录时依然可用，兼容老流程）
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('userSelect');
        if (!select) return;
            result.data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.username})`;
                select.appendChild(option);
            });

            // 监听用户选择
            select.addEventListener('change', (e) => {
                const userId = e.target.value;
                if (userId) {
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    currentUser = {
                        id: userId,
                        name: selectedOption.textContent
                    };
                    document.getElementById('currentUser').textContent = `当前用户: ${currentUser.name}`;
                    loadMyBookings();
                } else {
                    currentUser = null;
                    document.getElementById('currentUser').textContent = '';
                    document.getElementById('myBookings').innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>请先选择用户</p></div>';
                }
            });
        }
    } catch (error) {
        console.error('加载用户失败:', error);
        showError('加载用户失败');
    }
}

// 查询可用座位
async function searchAvailableSeats() {
    const date = document.getElementById('searchDate').value;
    const startTime = document.getElementById('searchStartTime').value;
    const endTime = document.getElementById('searchEndTime').value;

    if (!date || !startTime || !endTime) {
        showError('请填写完整的查询条件');
        return;
    }

    if (startTime >= endTime) {
        showError('结束时间必须大于开始时间');
        return;
    }

    searchParams = { date, startTime, endTime };

    try {
        const response = await fetch(`${API_BASE}/seats/available?date=${date}&start_time=${startTime}&end_time=${endTime}`);
        const result = await response.json();

        if (result.success) {
            displaySeats(result.data);
            document.getElementById('seatCount').textContent = `(共${result.count}个)`;
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('查询座位失败:', error);
        showError('查询座位失败');
    }
}

// 显示座位列表
function displaySeats(seats) {
    const container = document.getElementById('seatsList');

    if (seats.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>该时间段暂无可用座位</p></div>';
        return;
    }

    container.innerHTML = seats.map(seat => `
        <div class="seat-card" onclick="selectSeat(${seat.id})">
            <div class="seat-number">${seat.seat_number}</div>
            <div class="seat-info">区域：${seat.area}</div>
            <div class="seat-info">楼层：${seat.floor}楼</div>
            <div class="seat-features">
                ${seat.has_power ? '<span class="feature-badge">有电源</span>' : ''}
            </div>
        </div>
    `).join('');
}

// 选择座位
function selectSeat(seatId) {
    if (!currentUser) {
        showError('请先登录或选择用户');
        return;
    }

    if (!searchParams.date) {
        showError('请先查询可用座位');
        return;
    }

    fetch(`${API_BASE}/seats/${seatId}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                selectedSeat = result.data;
                showBookingModal();
            }
        })
        .catch(error => {
            console.error('获取座位信息失败:', error);
            showError('获取座位信息失败');
        });
}

// 显示预约确认弹窗
function showBookingModal() {
    const modal = document.getElementById('bookingModal');
    const details = document.getElementById('bookingDetails');

    details.innerHTML = `
        <div class="detail-item"><span class="detail-label">座位号:</span><span class="detail-value">${selectedSeat.seat_number}</span></div>
        <div class="detail-item"><span class="detail-label">区域:</span><span class="detail-value">${selectedSeat.area}</span></div>
        <div class="detail-item"><span class="detail-label">楼层:</span><span class="detail-value">${selectedSeat.floor}楼</span></div>
        <div class="detail-item"><span class="detail-label">日期:</span><span class="detail-value">${searchParams.date}</span></div>
        <div class="detail-item"><span class="detail-label">时间:</span><span class="detail-value">${searchParams.startTime} - ${searchParams.endTime}</span></div>
        <div class="detail-item"><span class="detail-label">预约人:</span><span class="detail-value">${currentUser.name}</span></div>
    `;

    modal.style.display = 'block';
}

// 关闭预约弹窗
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// 确认预约
async function confirmBooking() {
    try {
        const bookingData = {
            user_id: currentUser.id,
            seat_id: selectedSeat.id,
            booking_date: searchParams.date,
            start_time: searchParams.startTime,
            end_time: searchParams.endTime
        };

        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('预约成功！');
            closeBookingModal();
            searchAvailableSeats();
            loadMyBookings();
            loadTodayStats();
        } else {
            showError(result.message || '预约失败');
        }
    } catch (error) {
        console.error('预约失败:', error);
        showError('预约失败');
    }
}

// 加载我的预约
async function loadMyBookings() {
    if (!currentUser) {
        document.getElementById('myBookings').innerHTML = '<div class="empty-state"><p>请先登录或选择用户</p></div>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/user/${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            displayBookings(result.data);
        }
    } catch (error) {
        console.error('加载预约失败:', error);
        showError('加载预约失败');
    }
}

// 显示预约列表
function displayBookings(bookings) {
    const container = document.getElementById('myBookings');

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无预约记录</p></div>';
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-seat">${booking.seat_number}</div>
                <span class="booking-status status-${booking.status}">${getStatusText(booking.status)}</span>
            </div>
            <div class="booking-info">区域：${booking.area}</div>
            <div class="booking-info">日期：${booking.booking_date}</div>
            <div class="booking-info">时间：${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}</div>
            ${booking.status === 'confirmed' || booking.status === 'pending' ? `
                <div class="booking-actions">
                    <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">取消预约</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 状态文本
function getStatusText(status) {
    const m = { 'pending':'待确认', 'confirmed':'已确认', 'cancelled':'已取消', 'completed':'已完成', 'overdue':'已过期' };
    return m[status] || status;
}

// 取消预约
async function cancelBooking(bookingId) {
    if (!confirm('确定要取消这个预约吗？')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            showSuccess('预约已取消');
            loadMyBookings();
            loadTodayStats();
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('取消预约失败:', error);
        showError('取消预约失败');
    }
}

// 今日统计
async function loadTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const response = await fetch(`${API_BASE}/bookings/stats/${today}`);
        const result = await response.json();
        if (result.success) {
            displayStats(result.data);
        }
    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

function displayStats(stats) {
    const container = document.getElementById('todayStats');
    container.innerHTML = `
        <div class="stat-card"><div class="stat-value">${stats.total_bookings || 0}</div><div class="stat-label">总预约</div></div>
        <div class="stat-card"><div class="stat-value">${stats.confirmed || 0}</div><div class="stat-label">已确认</div></div>
        <div class="stat-card"><div class="stat-value">${stats.completed || 0}</div><div class="stat-label">已完成</div></div>
        <div class="stat-card"><div class="stat-value">${stats.cancelled || 0}</div><div class="stat-label">已取消</div></div>
    `;
}

// 通用提示
function showError(message) { alert('错误：' + message); }
function showSuccess(message) { alert('成功：' + message); }

// 点击弹窗外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) closeBookingModal();
}
