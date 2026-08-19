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

// 渲染表格（合并 序号/需求职位/需求人数/剩余人数/渠道 单元格）
function renderTable(list) {
    var tbody = document.getElementById('totalTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="28" style="text-align:center;padding:30px;color:#999;">暂无数据，请先在「每周招聘」中录入并提交数据</td></tr>';
        return;
    }

    var html = '';
    var posIndex = 0;
    var i = 0;
    while (i < list.length) {
        var item = list[i];
        // 计算当前职位的连续行数
        var posSpan = 1;
        while (i + posSpan < list.length && list[i + posSpan].positionName === item.positionName) {
            posSpan++;
        }
        posIndex++;

        // 遍历该职位的每一行
        for (var r = 0; r < posSpan; r++) {
            var row = list[i + r];
            var isFirst = (r === 0);
            // 渠道单元格：计算从当前行开始连续相同渠道的行数
            var chSpan = 1;
            while (r + chSpan < posSpan) {
                var next = list[i + r + chSpan];
                if ((row.channel || '') === (next.channel || '')) {
                    chSpan++;
                } else {
                    break;
                }
            }

            html += '<tr>';

            // 序号列：职位首行合并
            if (isFirst) {
                html += '<td rowspan="' + posSpan + '" class="merged-cell">' + posIndex + '</td>';
            }
            // 需求职位列：职位首行合并
            if (isFirst) {
                html += '<td rowspan="' + posSpan + '" class="merged-cell position-cell">' + escapeHtml(item.positionName) + '</td>';
            }
            // 需求人数：职位首行合并
            if (isFirst) {
                html += '<td rowspan="' + posSpan + '" class="merged-cell">' + val(item.demandCount) + '</td>';
            }
            // 剩余人数：职位首行合并
            if (isFirst) {
                html += '<td rowspan="' + posSpan + '" class="merged-cell">' + val(item.remainingCount) + '</td>';
            }
            // 渠道列：仅当是职位首行，或渠道发生变化时才输出（合并相同渠道）
            if (r === 0 || (row.channel || '') !== (list[i + r - 1].channel || '')) {
                html += '<td rowspan="' + chSpan + '" class="merged-cell">' + escapeHtml(row.channel || '') + '</td>';
            }
            // 子渠道列
            html += '<td>' + escapeHtml(row.subChannel || '') + '</td>';

            html += '<td>' + val(row.resumeReceived) + '</td>' +
                '<td>' + val(row.writtenExamScheduled) + '</td>' +
                '<td>' + val(row.writtenExamCompleted) + '</td>' +
                '<td>' + val(row.writtenExamAccumulated) + '</td>' +
                '<td>' + pct(row.examAttendanceRate) + '</td>' +
                '<td>' + pct(row.examPassRate) + '</td>' +
                '<td>' + val(row.firstInterview) + '</td>' +
                '<td>' + val(row.secondInterview) + '</td>' +
                '<td>' + val(row.hired) + '</td>' +
                '<td>' + val(row.hiredAccumulated) + '</td>' +
                '<td>' + pct(row.interviewPassRate) + '</td>' +
                '<td>' + val(row.offerSigned) + '</td>' +
                '<td>' + pct(row.signRate) + '</td>' +
                '<td>' + val(row.offerRejected) + '</td>' +
                '<td>' + pct(row.rejectRate) + '</td>' +
                '<td>' + val(row.contractBroken) + '</td>' +
                '<td>' + pct(row.breachRate) + '</td>' +
                '<td>' + val(row.pendingContract) + '</td>' +
                '<td>' + val(row.considering) + '</td>' +
                '<td>' + val(row.pendingCommunication) + '</td>' +
                '<td>' + val(row.totalOnboarded) + '</td>' +
                '<td>' + escapeHtml(row.remark || '') + '</td>' +
            '</tr>';
        }
        i += posSpan;
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
