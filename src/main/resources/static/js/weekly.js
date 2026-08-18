/**
 * 每周招聘数据 JS
 * 按日期范围管理数据，默认开始/结束日期为当前日期
 */

var positionList = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadPositions();
    // 日期默认当前日期
    document.getElementById('filterStartDate').value = today();
    document.getElementById('filterEndDate').value = today();
    loadData();
});

// 获取当前日期字符串
function today() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
}

// 加载职位下拉列表
function loadPositions() {
    fetch('/api/position/list')
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                positionList = res.data || [];
                // 填充筛选下拉
                var filterSel = document.getElementById('filterPosition');
                filterSel.innerHTML = '<option value="">全部</option>';
                // 填充模态框下拉
                var modalSel = document.getElementById('positionName');
                modalSel.innerHTML = '<option value="">请选择</option>';
                for (var i = 0; i < positionList.length; i++) {
                    var p = positionList[i];
                    filterSel.innerHTML += '<option value="' + escapeHtml(p.positionName) + '">' + escapeHtml(p.positionName) + '</option>';
                    modalSel.innerHTML += '<option value="' + escapeHtml(p.positionName) + '">' + escapeHtml(p.positionName) + '</option>';
                }
            }
        });
}

// 加载每周数据
function loadData() {
    var params = new URLSearchParams();
    var positionName = document.getElementById('filterPosition').value;
    var channel = document.getElementById('filterChannel').value;
    var subChannel = document.getElementById('filterSubChannel').value;
    var startDate = document.getElementById('filterStartDate').value;
    var endDate = document.getElementById('filterEndDate').value;

    if (positionName) params.append('positionName', positionName);
    if (channel) params.append('channel', channel);
    if (subChannel) params.append('subChannel', subChannel);
    // 按日期范围筛选
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    fetch('/api/weekly/list?' + params.toString())
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                renderTable(res.data || []);
            } else {
                showToast('加载失败: ' + res.message, 'error');
            }
        });
}

// 渲染表格
function renderTable(list) {
    var tbody = document.getElementById('weeklyTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="23" style="text-align:center;padding:30px;color:#999;">暂无数据</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var dateRange = '';
        if (item.startDate || item.endDate) {
            dateRange = (item.startDate || '') + (item.endDate ? ' ~ ' + item.endDate : '');
        }
        html += '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + escapeHtml(item.positionName) + '</td>' +
            '<td>' + escapeHtml(item.channel || '') + '</td>' +
            '<td>' + escapeHtml(item.subChannel || '') + '</td>' +
            '<td>' + val(item.resumeReceived) + '</td>' +
            '<td>' + val(item.writtenExamScheduled) + '</td>' +
            '<td>' + val(item.writtenExamCompleted) + '</td>' +
            '<td>' + val(item.writtenExamAccumulated) + '</td>' +
            '<td>' + val(item.firstInterview) + '</td>' +
            '<td>' + val(item.secondInterview) + '</td>' +
            '<td>' + val(item.hired) + '</td>' +
            '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;" title="' + escapeHtml(item.hiredCandidates || '') + '">' + escapeHtml(item.hiredCandidates || '') + '</td>' +
            '<td>' + val(item.offerSigned) + '</td>' +
            '<td>' + val(item.offerRejected) + '</td>' +
            '<td>' + val(item.contractBroken) + '</td>' +
            '<td>' + val(item.pendingContract) + '</td>' +
            '<td>' + val(item.considering) + '</td>' +
            '<td>' + val(item.pendingCommunication) + '</td>' +
            '<td>' + val(item.weeklyOnboarded) + '</td>' +
            '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;" title="' + escapeHtml(item.weeklyOnboardedNames || '') + '">' + escapeHtml(item.weeklyOnboardedNames || '') + '</td>' +
            '<td>' + escapeHtml(item.remark || '') + '</td>' +
            '<td style="white-space:nowrap;">' + escapeHtml(dateRange) + '</td>' +
            '<td style="white-space:nowrap;">' +
                '<button class="btn btn-warning btn-sm" onclick="openEditModal(' + item.id + ')">编辑</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="deleteWeekly(' + item.id + ')">删除</button>' +
            '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// 打开新增模态框
function openAddModal() {
    document.getElementById('modalTitle').textContent = '新增每周招聘数据';
    document.getElementById('editId').value = '';
    // 重置所有输入
    var inputs = document.querySelectorAll('#weeklyModal input, #weeklyModal select');
    inputs.forEach(function(el) {
        if (el.type === 'hidden') return;
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else if (el.type === 'number') {
            el.value = '0';
        } else {
            el.value = '';
        }
    });
    document.getElementById('channel').value = '校招';
    document.getElementById('subChannel').value = '秋招';
    onChannelChange();
    // 日期默认当前日期
    document.getElementById('startDate').value = today();
    document.getElementById('endDate').value = today();
    document.getElementById('weeklyModal').classList.add('show');
}

// 打开编辑模态框
function openEditModal(id) {
    fetch('/api/weekly/' + id)
        .then(res => res.json())
        .then(res => {
            if (res.code === 200 && res.data) {
                var item = res.data;
                document.getElementById('modalTitle').textContent = '编辑每周招聘数据';
                document.getElementById('editId').value = item.id;
                document.getElementById('positionName').value = item.positionName;
                document.getElementById('channel').value = item.channel;
                document.getElementById('subChannel').value = item.subChannel || '秋招';
                onChannelChange();
                document.getElementById('resumeReceived').value = item.resumeReceived || 0;
                document.getElementById('writtenExamScheduled').value = item.writtenExamScheduled || 0;
                document.getElementById('writtenExamCompleted').value = item.writtenExamCompleted || 0;
                document.getElementById('writtenExamAccumulated').value = item.writtenExamAccumulated || 0;
                document.getElementById('firstInterview').value = item.firstInterview || 0;
                document.getElementById('secondInterview').value = item.secondInterview || 0;
                document.getElementById('hired').value = item.hired || 0;
                document.getElementById('hiredCandidates').value = item.hiredCandidates || '';
                document.getElementById('offerSigned').value = item.offerSigned || 0;
                document.getElementById('offerRejected').value = item.offerRejected || 0;
                document.getElementById('contractBroken').value = item.contractBroken || 0;
                document.getElementById('pendingContract').value = item.pendingContract || 0;
                document.getElementById('considering').value = item.considering || 0;
                document.getElementById('pendingCommunication').value = item.pendingCommunication || 0;
                document.getElementById('weeklyOnboarded').value = item.weeklyOnboarded || 0;
                document.getElementById('weeklyOnboardedNames').value = item.weeklyOnboardedNames || '';
                document.getElementById('remark').value = item.remark || '';
                document.getElementById('startDate').value = item.startDate || '';
                document.getElementById('endDate').value = item.endDate || '';
                document.getElementById('weeklyModal').classList.add('show');
            }
        });
}

// 关闭模态框
function closeModal() {
    document.getElementById('weeklyModal').classList.remove('show');
}

// 渠道变化时控制子渠道显隐
function onChannelChange() {
    var channel = document.getElementById('channel').value;
    var subGroup = document.getElementById('subChannelGroup');
    if (channel === '社招') {
        subGroup.style.display = 'none';
        document.getElementById('subChannel').value = '';
    } else {
        subGroup.style.display = '';
        if (!document.getElementById('subChannel').value) {
            document.getElementById('subChannel').value = '秋招';
        }
    }
}

function onPositionChange() {}

// 保存每周数据
function saveWeekly() {
    var positionName = document.getElementById('positionName').value;
    if (!positionName) {
        showToast('请选择需求职位', 'error');
        return;
    }
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    if (!startDate || !endDate) {
        showToast('请选择开始日期和结束日期', 'error');
        return;
    }
    var data = {
        positionName: positionName,
        channel: document.getElementById('channel').value,
        subChannel: document.getElementById('subChannel').value || null,
        resumeReceived: parseInt(document.getElementById('resumeReceived').value) || 0,
        writtenExamScheduled: parseInt(document.getElementById('writtenExamScheduled').value) || 0,
        writtenExamCompleted: parseInt(document.getElementById('writtenExamCompleted').value) || 0,
        writtenExamAccumulated: parseInt(document.getElementById('writtenExamAccumulated').value) || 0,
        firstInterview: parseInt(document.getElementById('firstInterview').value) || 0,
        secondInterview: parseInt(document.getElementById('secondInterview').value) || 0,
        hired: parseInt(document.getElementById('hired').value) || 0,
        hiredCandidates: document.getElementById('hiredCandidates').value,
        offerSigned: parseInt(document.getElementById('offerSigned').value) || 0,
        offerRejected: parseInt(document.getElementById('offerRejected').value) || 0,
        contractBroken: parseInt(document.getElementById('contractBroken').value) || 0,
        pendingContract: parseInt(document.getElementById('pendingContract').value) || 0,
        considering: parseInt(document.getElementById('considering').value) || 0,
        pendingCommunication: parseInt(document.getElementById('pendingCommunication').value) || 0,
        weeklyOnboarded: parseInt(document.getElementById('weeklyOnboarded').value) || 0,
        weeklyOnboardedNames: document.getElementById('weeklyOnboardedNames').value,
        remark: document.getElementById('remark').value,
        startDate: startDate || null,
        endDate: endDate || null
    };
    var id = document.getElementById('editId').value;
    var url = '/api/weekly/add';
    var method = 'POST';
    if (id) {
        data.id = parseInt(id);
        url = '/api/weekly/update';
        method = 'PUT';
    }
    fetch(url, {
        method: method,
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
        });
}

// 删除
function deleteWeekly(id) {
    if (!confirm('确认删除这条每周招聘数据吗？')) return;
    fetch('/api/weekly/' + id, {method: 'DELETE'})
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

// 重置筛选
function resetFilter() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterPosition').value = '';
    document.getElementById('filterChannel').value = '';
    document.getElementById('filterSubChannel').value = '';
    loadData();
}

// ===== 工具函数 =====
function val(v) {
    if (v === null || v === undefined || v === 0) return '<span style="color:#ccc;">0</span>';
    return v;
}

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
