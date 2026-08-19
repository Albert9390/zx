/**
 * 每周招聘数据 JS
 * 采用"先添加周、再添加明细"的两步录入方式
 * 周 = 当前（或所选）日期所在周，周一为开始、周日为结束
 */

var positionList = [];      // 所有需求职位
var weekList = [];          // 所有招聘周
var currentWeekInfo = null; // 当前所选日期的周信息

// 每个职位下的渠道/子渠道行
var CHANNEL_ROWS = [
    {channel: '校招', subChannel: '秋招'},
    {channel: '校招', subChannel: '春招'},
    {channel: '社招', subChannel: ''}
];

// 明细弹框中可编辑字段（顺序与表头一致）
var DETAIL_FIELDS = [
    {key: 'resumeReceived',        type: 'number'},
    {key: 'writtenExamScheduled',  type: 'number'},
    {key: 'writtenExamCompleted',  type: 'number'},
    {key: 'writtenExamAccumulated',type: 'number'},
    {key: 'firstInterview',        type: 'number'},
    {key: 'secondInterview',       type: 'number'},
    {key: 'hired',                 type: 'number'},
    {key: 'hiredCandidates',       type: 'text'},
    {key: 'offerSigned',           type: 'number'},
    {key: 'offerRejected',         type: 'number'},
    {key: 'contractBroken',        type: 'number'},
    {key: 'pendingContract',       type: 'number'},
    {key: 'considering',           type: 'number'},
    {key: 'pendingCommunication',  type: 'number'},
    {key: 'weeklyOnboarded',       type: 'number'},
    {key: 'weeklyOnboardedNames',  type: 'text'},
    {key: 'remark',                type: 'text'}
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadPositions();
    loadWeeks();
});

// 获取当前日期字符串
function today() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
}

// 周标题："2026年第34周"
function weekTitle(w) {
    return w.year + '年第' + w.weekNumber + '周';
}

// 加载所有需求职位
function loadPositions() {
    fetch('/api/position/list')
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                positionList = res.data || [];
            }
        });
}

// 加载所有招聘周
function loadWeeks() {
    fetch('/api/week/list')
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                weekList = res.data || [];
                renderWeeks(weekList);
            } else {
                showToast('加载失败: ' + res.message, 'error');
            }
        });
}

// 渲染周列表
function renderWeeks(list) {
    var tbody = document.getElementById('weekTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">暂无周数据，点击右上角「新增每周数据」开始录入</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
        var w = list[i];
        html += '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td style="font-weight:600;">' + escapeHtml(weekTitle(w)) + '</td>' +
            '<td>' + escapeHtml(w.startDate || '') + '</td>' +
            '<td>' + escapeHtml(w.endDate || '') + '</td>' +
            '<td>' + (w.recordCount || 0) + '</td>' +
            '<td style="white-space:nowrap;">' +
                '<button class="btn btn-warning btn-sm" onclick="editWeekDetail(' + w.id + ')">编辑明细</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="deleteWeek(' + w.id + ')">删除</button>' +
            '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
}

// ===== 第一步：新增招聘周 =====
function openWeekModal() {
    document.getElementById('weekPickerDate').value = today();
    fetchWeekInfo(today());
    document.getElementById('weekModal').classList.add('show');
}

function onWeekDateChange() {
    var d = document.getElementById('weekPickerDate').value;
    if (d) fetchWeekInfo(d);
}

function fetchWeekInfo(date) {
    fetch('/api/week/info?date=' + date)
        .then(res => res.json())
        .then(res => {
            if (res.code === 200 && res.data) {
                currentWeekInfo = res.data;
                document.getElementById('weekInfoTitle').textContent = weekTitle(res.data);
                document.getElementById('weekInfoStart').textContent = res.data.startDate;
                document.getElementById('weekInfoEnd').textContent = res.data.endDate;
            }
        });
}

function closeWeekModal() {
    document.getElementById('weekModal').classList.remove('show');
}

// 创建周，成功后进入第二步（明细）
function createWeekAndOpenDetail() {
    if (!currentWeekInfo) {
        showToast('请先选择日期', 'error');
        return;
    }
    fetch('/api/week/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({startDate: currentWeekInfo.startDate, endDate: currentWeekInfo.endDate})
    })
        .then(res => res.json())
        .then(res => {
            if (res.code === 200 && res.data) {
                showToast('周创建成功，请填写明细', 'success');
                closeWeekModal();
                openDetailModal(res.data, null);
            } else {
                showToast('创建失败: ' + res.message, 'error');
            }
        });
}

// ===== 第二步：周明细 =====
function openDetailModal(week, existingRecords) {
    document.getElementById('detailWeekId').value = week.id;
    document.getElementById('detailModalTitle').textContent = '添加明细 - ' + weekTitle(week)
        + '（' + (week.startDate || '') + ' ~ ' + (week.endDate || '') + '）';

    // 构建已有记录查找表：职位|渠道|子渠道 -> 记录
    var map = {};
    (existingRecords || []).forEach(function(r) {
        map[r.positionName + '|' + r.channel + '|' + (r.subChannel || '')] = r;
    });

    var html = '';
    for (var i = 0; i < positionList.length; i++) {
        var p = positionList[i];
        for (var j = 0; j < CHANNEL_ROWS.length; j++) {
            var cr = CHANNEL_ROWS[j];
            var key = p.positionName + '|' + cr.channel + '|' + cr.subChannel;
            var rec = map[key];
            var isFirst = (j === 0);

            html += '<tr class="detail-row' + (isFirst ? ' position-group' : '') + '"'
                + ' data-position="' + escapeHtml(p.positionName) + '"'
                + ' data-channel="' + escapeHtml(cr.channel) + '"'
                + ' data-subchannel="' + escapeHtml(cr.subChannel) + '">';
            html += '<td>' + (isFirst ? (i + 1) : '') + '</td>';
            html += '<td>' + (isFirst ? escapeHtml(p.positionName) : '') + '</td>';
            html += '<td>' + escapeHtml(cr.channel) + '</td>';
            html += '<td>' + escapeHtml(cr.subChannel) + '</td>';

            for (var k = 0; k < DETAIL_FIELDS.length; k++) {
                var f = DETAIL_FIELDS[k];
                var v = rec ? rec[f.key] : null;
                if (f.type === 'number') {
                    var numVal = (v === null || v === undefined || v === 0) ? '' : v;
                    html += '<td><input type="number" class="detail-input" data-field="' + f.key + '" value="' + numVal + '" min="0" placeholder="0"></td>';
                } else {
                    html += '<td><input type="text" class="detail-input text-input" data-field="' + f.key + '" value="' + escapeHtml(v || '') + '"></td>';
                }
            }
            html += '</tr>';
        }
    }
    document.getElementById('detailTbody').innerHTML = html;
    document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

// 保存明细：收集填写了数据的行，批量提交
function saveDetail() {
    var weekId = document.getElementById('detailWeekId').value;
    if (!weekId) {
        showToast('缺少周信息', 'error');
        return;
    }
    var rows = document.querySelectorAll('#detailTbody .detail-row');
    var list = [];
    rows.forEach(function(row) {
        var rec = {
            positionName: row.getAttribute('data-position'),
            channel: row.getAttribute('data-channel'),
            subChannel: row.getAttribute('data-subchannel') || null
        };
        var hasValue = false;
        row.querySelectorAll('.detail-input').forEach(function(input) {
            var field = input.getAttribute('data-field');
            if (input.type === 'number') {
                var n = parseInt(input.value) || 0;
                rec[field] = n;
                if (n !== 0) hasValue = true;
            } else {
                var s = input.value.trim();
                rec[field] = s;
                if (s) hasValue = true;
            }
        });
        if (hasValue) list.push(rec);
    });

    fetch('/api/weekly/saveBatch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({weekId: parseInt(weekId), list: list})
    })
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('保存成功', 'success');
                closeDetailModal();
                loadWeeks();
            } else {
                showToast('保存失败: ' + res.message, 'error');
            }
        });
}

// 编辑某周的明细
function editWeekDetail(id) {
    fetch('/api/weekly/list?weekId=' + id)
        .then(res => res.json())
        .then(res => {
            var records = (res.code === 200) ? (res.data || []) : [];
            var week = null;
            for (var i = 0; i < weekList.length; i++) {
                if (weekList[i].id === id) {
                    week = weekList[i];
                    break;
                }
            }
            if (!week) {
                showToast('未找到该周信息', 'error');
                return;
            }
            openDetailModal(week, records);
        });
}

// 删除某周及其明细
function deleteWeek(id) {
    if (!confirm('确认删除该周及其所有明细数据吗？此操作不可恢复！')) return;
    fetch('/api/week/' + id, {method: 'DELETE'})
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('删除成功', 'success');
                loadWeeks();
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
