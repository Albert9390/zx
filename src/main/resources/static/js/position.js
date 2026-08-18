/**
 * 职位管理 JS
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 加载职位列表
function loadData() {
    fetch('/api/position/list')
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
    var tbody = document.getElementById('positionTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无数据</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        html += '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + escapeHtml(item.positionName) + '</td>' +
            '<td>' + (item.demandCount || 0) + '</td>' +
            '<td>' + (item.sortOrder || 0) + '</td>' +
            '<td>' +
                '<button class="btn btn-warning btn-sm" onclick="openEditModal(' + item.id + ')">编辑</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="deletePosition(' + item.id + ', \'' + escapeHtml(item.positionName) + '\')">删除</button>' +
            '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// 打开新增模态框
function openModal() {
    document.getElementById('modalTitle').textContent = '新增职位';
    document.getElementById('editId').value = '';
    document.getElementById('positionName').value = '';
    document.getElementById('demandCount').value = '0';
    document.getElementById('sortOrder').value = '0';
    document.getElementById('positionModal').classList.add('show');
}

// 打开编辑模态框
function openEditModal(id) {
    fetch('/api/position/' + id)
        .then(res => res.json())
        .then(res => {
            if (res.code === 200 && res.data) {
                var item = res.data;
                document.getElementById('modalTitle').textContent = '编辑职位';
                document.getElementById('editId').value = item.id;
                document.getElementById('positionName').value = item.positionName;
                document.getElementById('demandCount').value = item.demandCount || 0;
                document.getElementById('sortOrder').value = item.sortOrder || 0;
                document.getElementById('positionModal').classList.add('show');
            }
        });
}

// 关闭模态框
function closeModal() {
    document.getElementById('positionModal').classList.remove('show');
}

// 保存职位
function savePosition() {
    var id = document.getElementById('editId').value;
    var positionName = document.getElementById('positionName').value.trim();
    if (!positionName) {
        showToast('请输入职位名称', 'error');
        return;
    }
    var data = {
        positionName: positionName,
        demandCount: parseInt(document.getElementById('demandCount').value) || 0,
        sortOrder: parseInt(document.getElementById('sortOrder').value) || 0
    };
    if (id) {
        data.id = parseInt(id);
    }
    fetch('/api/position/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
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
        })
        .catch(err => {
            console.error(err);
            showToast('保存失败', 'error');
        });
}

// 删除职位
function deletePosition(id, name) {
    if (!confirm('确认删除职位「' + name + '」吗？')) return;
    fetch('/api/position/' + id, {method: 'DELETE'})
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

// ===== 工具函数 =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(s) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s];
    });
}

function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 3000);
}
