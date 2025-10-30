const API_BASE = '/api';

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadSeats();
    loadBookings();
});

// 切换标签页
function switchTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// ==================== 用户管理 ====================

// 加载用户列表
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const result = await response.json();
        
        if (result.success) {
            displayUsers(result.data);
        }
    } catch (error) {
        console.error('加载用户失败:', error);
    }
}

// 显示用户列表
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>${user.email || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td class="action-btns">
                <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 显示添加用户弹窗
function showAddUserModal() {
    document.getElementById('userModalTitle').textContent = '添加用户';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'block';
}

// 编辑用户
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE}/users/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const user = result.data;
            document.getElementById('userModalTitle').textContent = '编辑用户';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('password').value = '';
            document.getElementById('password').required = false;
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('userModal').style.display = 'block';
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败');
    }
}

// 关闭用户弹窗
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('password').required = true;
}

// 保存用户
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    try {
        let response;
        if (userId) {
            // 更新用户
            response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else {
            // 创建用户
            response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('保存成功');
            closeUserModal();
            loadUsers();
        } else {
            alert(result.message || '保存失败');
        }
    } catch (error) {
        console.error('保存用户失败:', error);
        alert('保存失败');
    }
});

// 删除用户
async function deleteUser(id) {
    if (!confirm('确定要删除这个用户吗？删除后相关预约也会被删除。')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('删除成功');
            loadUsers();
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除失败');
    }
}

// ==================== 座位管理 ====================

// 加载座位列表
async function loadSeats() {
    try {
        const response = await fetch(`${API_BASE}/seats`);
        const result = await response.json();
        
        if (result.success) {
            displaySeats(result.data);
        }
    } catch (error) {
        console.error('加载座位失败:', error);
    }
}

// 显示座位列表
function displaySeats(seats) {
    const tbody = document.getElementById('seatsTableBody');
    
    if (seats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = seats.map(seat => `
        <tr>
            <td>${seat.id}</td>
            <td>${seat.seat_number}</td>
            <td>${seat.area}</td>
            <td>${seat.floor}楼</td>
            <td><span class="status-badge status-${seat.status}">${getStatusText(seat.status)}</span></td>
            <td><span class="${seat.has_power ? 'yes-badge' : 'no-badge'}">${seat.has_power ? '✓' : '✗'}</span></td>
            <td><span class="${seat.has_lamp ? 'yes-badge' : 'no-badge'}">${seat.has_lamp ? '✓' : '✗'}</span></td>
            <td class="action-btns">
                <button class="btn btn-primary btn-sm" onclick="editSeat(${seat.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSeat(${seat.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    const map = {
        'available': '可用',
        'occupied': '占用',
        'maintenance': '维护中'
    };
    return map[status] || status;
}

// 显示添加座位弹窗
function showAddSeatModal() {
    document.getElementById('seatModalTitle').textContent = '添加座位';
    document.getElementById('seatForm').reset();
    document.getElementById('seatId').value = '';
    document.getElementById('seatModal').style.display = 'block';
}

// 编辑座位
async function editSeat(id) {
    try {
        const response = await fetch(`${API_BASE}/seats/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const seat = result.data;
            document.getElementById('seatModalTitle').textContent = '编辑座位';
            document.getElementById('seatId').value = seat.id;
            document.getElementById('seatNumber').value = seat.seat_number;
            document.getElementById('area').value = seat.area;
            document.getElementById('floor').value = seat.floor;
            document.getElementById('status').value = seat.status;
            document.getElementById('hasPower').checked = seat.has_power;
            document.getElementById('hasLamp').checked = seat.has_lamp;
            document.getElementById('seatModal').style.display = 'block';
        }
    } catch (error) {
        console.error('获取座位信息失败:', error);
        alert('获取座位信息失败');
    }
}

// 关闭座位弹窗
function closeSeatModal() {
    document.getElementById('seatModal').style.display = 'none';
}

// 保存座位
document.getElementById('seatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const seatId = document.getElementById('seatId').value;
    const seatData = {
        seat_number: document.getElementById('seatNumber').value,
        area: document.getElementById('area').value,
        floor: parseInt(document.getElementById('floor').value),
        status: document.getElementById('status').value,
        has_power: document.getElementById('hasPower').checked,
        has_lamp: document.getElementById('hasLamp').checked
    };
    
    try {
        let response;
        if (seatId) {
            // 更新座位
            response = await fetch(`${API_BASE}/seats/${seatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seatData)
            });
        } else {
            // 创建座位
            response = await fetch(`${API_BASE}/seats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seatData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('保存成功');
            closeSeatModal();
            loadSeats();
        } else {
            alert(result.message || '保存失败');
        }
    } catch (error) {
        console.error('保存座位失败:', error);
        alert('保存失败');
    }
});

// 删除座位
async function deleteSeat(id) {
    if (!confirm('确定要删除这个座位吗？删除后相关预约也会被删除。')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/seats/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('删除成功');
            loadSeats();
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除座位失败:', error);
        alert('删除失败');
    }
}

// ==================== 预约管理 ====================

// 加载预约列表
async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings`);
        const result = await response.json();
        
        if (result.success) {
            displayBookings(result.data);
        }
    } catch (error) {
        console.error('加载预约失败:', error);
    }
}

// 显示预约列表
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${booking.user_name}</td>
            <td>${booking.seat_number}</td>
            <td>${booking.area}</td>
            <td>${booking.booking_date}</td>
            <td>${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}</td>
            <td><span class="booking-status status-${booking.status}">${getBookingStatusText(booking.status)}</span></td>
            <td class="action-btns">
                <button class="btn btn-danger btn-sm" onclick="deleteBooking(${booking.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function getBookingStatusText(status) {
    const map = {
        'pending': '待确认',
        'confirmed': '已确认',
        'cancelled': '已取消',
        'completed': '已完成',
        'overdue': '已过期'
    };
    return map[status] || status;
}

// 删除预约
async function deleteBooking(id) {
    if (!confirm('确定要删除这条预约记录吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/bookings/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('删除成功');
            loadBookings();
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除预约失败:', error);
        alert('删除失败');
    }
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

