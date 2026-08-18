/**
 * 总报表 JS
 * 总表数据由每周招聘数据按 需求职位 + 渠道 + 子渠道 汇总求和
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 加载总报表数据
function loadData() {
    var params = new URLSearchParams();
    var positionName = document.getElementById('filterPosition').value;
    var channel = document.getElementById('filterChannel').value;
    if (positionName) params.append('positionName', positionName);
    if (channel) params.append('channel', channel);

    fetch('/api/total/list?' + params.toString())
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                renderTable(res.data || []);
                renderStats(res.data || []);
            } else {
                showToast('加载失败: ' + res.message, 'error');
            }
        });
}

// 渲染统计卡片
function renderStats(list) {
    var statsRow = document.getElementById('statsRow');
    if (!list || list.length === 0) {
        statsRow.innerHTML = '';
        return;
    }
    var totalResume = 0, totalExam = 0, totalHired = 0, totalOnboarded = 0;
    for (var i = 0; i < list.length; i++) {
        totalResume += list[i].resumeReceived || 0;
        totalExam += list[i].writtenExamCompleted || 0;
        totalHired += list[i].hired || 0;
        totalOnboarded += list[i].totalOnboarded || 0;
    }
    statsRow.innerHTML =
        statCard(totalResume, '简历收取总量') +
        statCard(totalExam, '笔试完成总量') +
        statCard(totalHired, '录用总量') +
        statCard(totalOnboarded, '累计报到总量');
}

function statCard(value, label) {
    return '<div class="stat-card">' +
        '<div class="stat-value">' + value + '</div>' +
        '<div class="stat-label">' + label + '</div>' +
    '</div>';
}

// 渲染表格
function renderTable(list) {
    var tbody = document.getElementById('totalTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="29" style="text-align:center;padding:30px;color:#999;">暂无数据，请先在「每周招聘」中录入数据</td></tr>';
        return;
    }

    var html = '';
    var currentPos = '';
    var posIndex = 0;

    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        // 职位分组：每个职位的第一行高亮
        var isGroupStart = item.positionName !== currentPos;
        if (isGroupStart) {
            currentPos = item.positionName;
            posIndex++;
        }
        var rowClass = isGroupStart ? 'position-group' : '';

        html += '<tr class="' + rowClass + '">' +
            '<td>' + (isGroupStart ? posIndex : '') + '</td>' +
            '<td>' + (isGroupStart ? escapeHtml(item.positionName) : '') + '</td>' +
            '<td>' + (isGroupStart ? val(item.demandCount) : '') + '</td>' +
            '<td>' + (isGroupStart ? val(item.remainingCount) : '') + '</td>' +
            '<td>' + escapeHtml(item.channel || '') + '</td>' +
            '<td>' + escapeHtml(item.subChannel || '') + '</td>' +
            '<td>' + val(item.resumeReceived) + '</td>' +
            '<td>' + val(item.writtenExamScheduled) + '</td>' +
            '<td>' + val(item.writtenExamCompleted) + '</td>' +
            '<td>' + val(item.writtenExamAccumulated) + '</td>' +
            '<td>' + pct(item.examAttendanceRate) + '</td>' +
            '<td>' + pct(item.examPassRate) + '</td>' +
            '<td>' + val(item.firstInterview) + '</td>' +
            '<td>' + val(item.secondInterview) + '</td>' +
            '<td>' + val(item.hired) + '</td>' +
            '<td>' + val(item.hiredAccumulated) + '</td>' +
            '<td>' + pct(item.interviewPassRate) + '</td>' +
            '<td>' + val(item.offerSigned) + '</td>' +
            '<td>' + pct(item.signRate) + '</td>' +
            '<td>' + val(item.offerRejected) + '</td>' +
            '<td>' + pct(item.rejectRate) + '</td>' +
            '<td>' + val(item.contractBroken) + '</td>' +
            '<td>' + pct(item.breachRate) + '</td>' +
            '<td>' + val(item.pendingContract) + '</td>' +
            '<td>' + val(item.considering) + '</td>' +
            '<td>' + val(item.pendingCommunication) + '</td>' +
            '<td>' + val(item.totalOnboarded) + '</td>' +
            '<td>' + escapeHtml(item.remark || '') + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// 重置筛选
function resetFilter() {
    document.getElementById('filterPosition').value = '';
    document.getElementById('filterChannel').value = '';
    loadData();
}

// ===== 工具函数 =====
function val(v) {
    if (v === null || v === undefined || v === 0) return '<span style="color:#ccc;">0</span>';
    return v;
}

function pct(v) {
    if (v === null || v === undefined || v === 0) return '<span style="color:#ccc;">0%</span>';
    var num = parseFloat(v);
    if (isNaN(num) || num === 0) return '<span style="color:#ccc;">0%</span>';
    return (num * 100).toFixed(1) + '%';
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
