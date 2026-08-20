/**
 * 每周招聘数据 JS
 * 采用"先添加周、再添加明细"的两步录入方式
 * 周 = 当前（或所选）日期所在周，周一为开始、周日为结束
 * 依赖 common.js 中的 escapeHtml / showToast（页面已先行引入）。
 */

let positionList = [];      // 所有需求职位
let weekList = [];          // 所有招聘周
let currentWeekInfo = null; // 当前所选日期的周信息
let detailData = {};        // 明细缓存：positionName|channel|subChannel -> 记录对象（搜索重渲染不丢数据）
let detailReadonly = false; // 明细弹框是否只读（已提交周查看时）

// 每个职位下的渠道/子渠道行（与总报表排序一致：校招春招 → 校招秋招 → 社招）
const CHANNEL_ROWS = [
    {channel: '校招', subChannel: '春招'},
    {channel: '校招', subChannel: '秋招'},
    {channel: '社招', subChannel: ''}
];

// 明细弹框中可编辑字段（顺序与表头一致）
const DETAIL_FIELDS = [
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
document.addEventListener('DOMContentLoaded', function () {
    loadPositions();
    loadWeeks();
});

// 获取当前日期字符串
function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
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
    const tbody = document.getElementById('weekTbody');
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">暂无周数据，点击右上角「新增每周数据」开始录入</td></tr>';
        return;
    }
    let html = '';
    for (let i = 0; i < list.length; i++) {
        const w = list[i];
        const submitted = (w.status === 1);
        const statusHtml = submitted
            ? '<span class="badge badge-success">已提交</span>'
            : '<span class="badge badge-warning">未提交</span>';
        const actionHtml = submitted
            ? '<button class="btn btn-info btn-sm" onclick="viewWeekDetail(' + w.id + ')">查看明细</button> '
                + '<button class="btn btn-warning btn-sm" onclick="withdrawWeek(' + w.id + ')">撤回</button>'
            : '<button class="btn btn-warning btn-sm" onclick="editWeekDetail(' + w.id + ')">编辑明细</button> '
                + '<button class="btn btn-success btn-sm" onclick="submitWeek(' + w.id + ')">提交</button> '
                + '<button class="btn btn-danger btn-sm" onclick="deleteWeek(' + w.id + ')">删除</button>';
        html += '<tr>'
            + '<td>' + (i + 1) + '</td>'
            + '<td style="font-weight:600;">' + escapeHtml(weekTitle(w)) + '</td>'
            + '<td>' + escapeHtml(w.startDate || '') + '</td>'
            + '<td>' + escapeHtml(w.endDate || '') + '</td>'
            + '<td>' + (w.recordCount || 0) + '</td>'
            + '<td>' + statusHtml + '</td>'
            + '<td style="white-space:nowrap;">' + actionHtml + '</td>'
            + '</tr>';
    }
    tbody.innerHTML = html;
}

// 提交某周（锁定，计入总报表）
function submitWeek(id) {
    if (!confirm('提交后该周数据将计入总报表，且不可再修改或删除。确认提交吗？')) return;
    fetch('/api/week/' + id + '/submit', {method: 'POST'})
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('提交成功', 'success');
                loadWeeks();
            } else {
                showToast('提交失败: ' + res.message, 'error');
            }
        });
}

// 撤回已提交的周（提交的反操作：解除锁定，恢复为草稿，可重新编辑/删除）
function withdrawWeek(id) {
    if (!confirm('撤回后该周数据将从总报表移除，并恢复为可编辑状态。确认撤回吗？')) return;
    fetch('/api/week/' + id + '/withdraw', {method: 'POST'})
        .then(res => res.json())
        .then(res => {
            if (res.code === 200) {
                showToast('撤回成功', 'success');
                loadWeeks();
            } else {
                showToast('撤回失败: ' + res.message, 'error');
            }
        });
}

// ===== 第一步：新增招聘周 =====
function openWeekModal() {
    document.getElementById('weekPickerDate').value = today();
    fetchWeekInfo(today());
    document.getElementById('weekModal').classList.add('show');
}

function onWeekDateChange() {
    const d = document.getElementById('weekPickerDate').value;
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
function openDetailModal(week, existingRecords, readonly) {
    detailReadonly = !!readonly;
    document.getElementById('detailWeekId').value = week.id;
    document.getElementById('detailModalTitle').textContent = (detailReadonly ? '查看明细' : '添加明细') + ' - ' + weekTitle(week)
        + '（' + (week.startDate || '') + ' ~ ' + (week.endDate || '') + '）';

    // 只读模式下隐藏保存按钮、禁用职位筛选
    document.getElementById('detailSaveBtn').style.display = detailReadonly ? 'none' : '';
    document.getElementById('detailCancelBtn').textContent = detailReadonly ? '关闭' : '取消';
    document.getElementById('detailSearchSelect').disabled = detailReadonly;

    // 填充职位下拉选项
    const select = document.getElementById('detailSearchSelect');
    let opts = '<option value="">全部职位</option>';
    for (let i = 0; i < positionList.length; i++) {
        opts += '<option value="' + escapeHtml(positionList[i].positionName) + '">'
            + escapeHtml(positionList[i].positionName) + '</option>';
    }
    select.innerHTML = opts;
    select.value = '';

    // 构建已有记录查找表：职位|渠道|子渠道 -> 记录
    detailData = {};
    (existingRecords || []).forEach(function (r) {
        detailData[r.positionName + '|' + r.channel + '|' + (r.subChannel || '')] = r;
    });

    renderDetailTable('');
    document.getElementById('detailModal').classList.add('show');
}

// 收集当前表格中已填写的输入值到 detailData（搜索重渲染前调用，避免数据丢失）
function collectDetailData() {
    const rows = document.querySelectorAll('#detailTbody .detail-row');
    rows.forEach(function (row) {
        const rec = {
            positionName: row.getAttribute('data-position'),
            channel: row.getAttribute('data-channel'),
            subChannel: row.getAttribute('data-subchannel') || null
        };
        row.querySelectorAll('.detail-input').forEach(function (input) {
            const field = input.getAttribute('data-field');
            if (input.type === 'number') {
                rec[field] = parseInt(input.value) || 0;
            } else {
                rec[field] = input.value.trim();
            }
        });
        detailData[rec.positionName + '|' + rec.channel + '|' + (rec.subChannel || '')] = rec;
    });
}

// 职位搜索（下拉选择）
function onDetailSearch() {
    const kw = document.getElementById('detailSearchSelect').value;
    collectDetailData();
    renderDetailTable(kw);
}

// 渲染明细表格（需求职位列合并 3 行、渠道列合并校招 2 行）
function renderDetailTable(keyword) {
    const kw = (keyword || '').trim();
    const filtered = positionList.filter(function (p) {
        if (!kw) return true;
        return p.positionName === kw;
    });

    const tbody = document.getElementById('detailTbody');
    const tip = document.getElementById('detailSearchTip');
    if (tip) {
        tip.textContent = kw ? ('共 ' + filtered.length + ' 个匹配职位') : '';
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + (4 + DETAIL_FIELDS.length) + '" style="text-align:center;padding:30px;color:#999;">没有匹配的职位</td></tr>';
        return;
    }

    let html = '';
    let seq = 0;
    for (let i = 0; i < filtered.length; i++) {
        const p = filtered[i];
        seq++;
        for (let j = 0; j < CHANNEL_ROWS.length; j++) {
            const cr = CHANNEL_ROWS[j];
            const key = p.positionName + '|' + cr.channel + '|' + cr.subChannel;
            const rec = detailData[key];

            html += '<tr class="detail-row"'
                + ' data-position="' + escapeHtml(p.positionName) + '"'
                + ' data-channel="' + escapeHtml(cr.channel) + '"'
                + ' data-subchannel="' + escapeHtml(cr.subChannel) + '">';

            // 序号列：首行合并 3 行
            if (j === 0) {
                html += '<td rowspan="3" class="merged-cell">' + seq + '</td>';
            }
            // 需求职位列：首行合并 3 行
            if (j === 0) {
                html += '<td rowspan="3" class="merged-cell position-cell">' + escapeHtml(p.positionName) + '</td>';
            }
            // 渠道列：秋招+春招合并为"校招"(跨2行)，社招单行
            if (j === 0) {
                html += '<td rowspan="2" class="merged-cell">' + escapeHtml(cr.channel) + '</td>';
            } else if (j === 2) {
                html += '<td class="merged-cell">' + escapeHtml(cr.channel) + '</td>';
            }
            // 子渠道列
            html += '<td>' + escapeHtml(cr.subChannel) + '</td>';

            for (let k = 0; k < DETAIL_FIELDS.length; k++) {
                const f = DETAIL_FIELDS[k];
                const v = rec ? rec[f.key] : null;
                const disabledAttr = detailReadonly ? ' disabled' : '';
                if (f.type === 'number') {
                    const numVal = (v === null || v === undefined || v === 0) ? '' : v;
                    html += '<td><input type="number" class="detail-input' + (detailReadonly ? ' detail-input-readonly' : '') + '" data-field="' + f.key + '" value="' + numVal + '" min="0"' + disabledAttr + '></td>';
                } else {
                    html += '<td><input type="text" class="detail-input text-input' + (detailReadonly ? ' detail-input-readonly' : '') + '" data-field="' + f.key + '" value="' + escapeHtml(v || '') + '"' + disabledAttr + '></td>';
                }
            }
            html += '</tr>';
        }
    }
    tbody.innerHTML = html;
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

// 保存明细：收集填写了数据的行，批量提交
function saveDetail() {
    const weekId = document.getElementById('detailWeekId').value;
    if (!weekId) {
        showToast('缺少周信息', 'error');
        return;
    }
    // 先收集当前输入，避免搜索过滤后未显示行的数据丢失
    collectDetailData();

    const list = [];
    for (const key in detailData) {
        if (!detailData.hasOwnProperty(key)) continue;
        const rec = detailData[key];
        let hasValue = false;
        for (let k = 0; k < DETAIL_FIELDS.length; k++) {
            const f = DETAIL_FIELDS[k];
            const v = rec[f.key];
            if (f.type === 'number') {
                if (v !== null && v !== undefined && v !== 0) hasValue = true;
            } else {
                if (v && String(v).trim()) hasValue = true;
            }
        }
        if (hasValue) list.push(rec);
    }

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
            const records = (res.code === 200) ? (res.data || []) : [];
            let week = null;
            for (let i = 0; i < weekList.length; i++) {
                if (weekList[i].id === id) {
                    week = weekList[i];
                    break;
                }
            }
            if (!week) {
                showToast('未找到该周信息', 'error');
                return;
            }
            openDetailModal(week, records, false);
        });
}

// 查看已提交周的明细（只读）
function viewWeekDetail(id) {
    fetch('/api/weekly/list?weekId=' + id)
        .then(res => res.json())
        .then(res => {
            const records = (res.code === 200) ? (res.data || []) : [];
            let week = null;
            for (let i = 0; i < weekList.length; i++) {
                if (weekList[i].id === id) {
                    week = weekList[i];
                    break;
                }
            }
            if (!week) {
                showToast('未找到该周信息', 'error');
                return;
            }
            openDetailModal(week, records, true);
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
