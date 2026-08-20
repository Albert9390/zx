/**
 * 用户管理 JS
 * 依赖 common.js 中的 escapeHtml / showToast / formatTime（页面已先行引入）。
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    loadData();
});

// 加载用户列表
function loadData() {
    fetch('/api/user/list')
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                renderTable(res.data || []);
            } else {
                showToast('加载失败: ' + res.message, 'error');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('加载失败', 'error');
        });
}

// 渲染表格
function renderTable(list) {
    const tbody = document.getElementById('userTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无用户</td></tr>';
        return;
    }
    let html = '';
    for (let i = 0; i < list.length; i++) {
        const u = list[i];
        const roleHtml = (u.role === 'ADMIN')
            ? '<span class="badge badge-warning">管理员</span>'
            : '<span class="badge badge-info">普通用户</span>';
        const statusHtml = (u.status === 1)
            ? '<span class="badge badge-success">启用</span>'
            : '<span class="badge" style="background:var(--danger-light);color:var(--danger-color);">禁用</span>';
        const toggleBtn = (u.status === 1)
            ? '<button class="btn btn-warning btn-sm" onclick="toggleStatus(' + u.id + ', 0)">禁用</button>'
            : '<button class="btn btn-success btn-sm" onclick="toggleStatus(' + u.id + ', 1)">启用</button>';
        html += '<tr>'
            + '<td>' + (i + 1) + '</td>'
            + '<td>' + escapeHtml(u.username) + '</td>'
            + '<td>' + escapeHtml(u.realName || '') + '</td>'
            + '<td>' + roleHtml + '</td>'
            + '<td>' + statusHtml + '</td>'
            + '<td>' + escapeHtml(formatTime(u.createTime)) + '</td>'
            + '<td style="white-space:nowrap;">'
                + '<button class="btn btn-info btn-sm" onclick="openEditModal(' + u.id + ')">编辑</button> '
                + '<button class="btn btn-secondary btn-sm" onclick="openResetModal(' + u.id + ')">重置密码</button> '
                + toggleBtn + ' '
                + '<button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ', \'' + escapeHtml(u.username) + '\')">删除</button>'
            + '</td>'
            + '</tr>';
    }
    tbody.innerHTML = html;
}

// 打开新增模态框
function openModal() {
    document.getElementById('modalTitle').textContent = '新增用户';
    document.getElementById('editId').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('realName').value = '';
    document.getElementById('role').value = 'USER';
    document.getElementById('passwordGroup').style.display = '';
    document.getElementById('userModal').classList.add('show');
}

// 打开编辑模态框
function openEditModal(id) {
    fetch('/api/user/list')
        .then(res => res.json())
        .then(res => {
            const list = res.data || [];
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === id) {
                    const u = list[i];
                    document.getElementById('modalTitle').textContent = '编辑用户';
                    document.getElementById('editId').value = u.id;
                    document.getElementById('username').value = u.username;
                    document.getElementById('realName').value = u.realName || '';
                    document.getElementById('role').value = u.role;
                    document.getElementById('passwordGroup').style.display = 'none';
                    document.getElementById('userModal').classList.add('show');
                    return;
                }
            }
        });
}

// 关闭模态框
function closeModal() {
    document.getElementById('userModal').classList.remove('show');
}

// 保存用户（新增或编辑）
function saveUser() {
    const id = document.getElementById('editId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const realName = document.getElementById('realName').value.trim();
    const role = document.getElementById('role').value;

    if (!username) {
        showToast('请输入用户名', 'error');
        return;
    }
    if (!role) {
        showToast('请选择角色', 'error');
        return;
    }

    if (id) {
        // 编辑：不修改密码
        fetch('/api/user/update', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: parseInt(id), username: username, realName: realName, role: role})
        })
            .then(res => res.json())
            .then(res => {
                if (res.code === 200) {
                    showToast('保存成功', 'success');
                    closeModal();
                    loadData();
                } else {
                    showToast('保存失败: ' + res.message, 'error');
                }
            });
    } else {
        // 新增：需要密码
        if (!password) {
            showToast('请输入密码', 'error');
            return;
        }
        fetch('/api/user/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password, realName: realName, role: role})
        })
            .then(res => res.json())
            .then(res => {
                if (res.code === 200) {
                    showToast('新增成功', 'success');
                    closeModal();
                    loadData();
                } else {
                    showToast('新增失败: ' + res.message, 'error');
                }
            });
    }
}

// 打开重置密码模态框
function openResetModal(id) {
    document.getElementById('resetId').value = id;
    document.getElementById('resetPassword').value = '';
    document.getElementById('resetModal').classList.add('show');
}

// 关闭重置密码模态框
function closeResetModal() {
    document.getElementById('resetModal').classList.remove('show');
}

// 执行重置密码
function doResetPassword() {
    const id = document.getElementById('resetId').value;
    const pwd = document.getElementById('resetPassword').value;
    if (!pwd) {
        showToast('请输入新密码', 'error');
        return;
    }
    fetch('/api/user/' + id + '/resetPassword', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({newPassword: pwd})
    })
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('密码已重置', 'success');
                closeResetModal();
            } else {
                showToast('重置失败: ' + res.message, 'error');
            }
        });
}

// 启用/禁用
function toggleStatus(id, status) {
    const tip = (status === 0) ? '确认禁用该用户吗？' : '确认启用该用户吗？';
    if (!confirm(tip)) return;
    fetch('/api/user/' + id + '/status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status: status})
    })
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('操作成功', 'success');
                loadData();
            } else {
                showToast('操作失败: ' + res.message, 'error');
            }
        });
}

// 删除用户
function deleteUser(id, name) {
    if (!confirm('确认删除用户「' + name + '」吗？')) return;
    fetch('/api/user/' + id, {method: 'DELETE'})
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('删除成功', 'success');
                loadData();
            } else {
                showToast('删除失败: ' + res.message, 'error');
            }
        });
}
