/**
 * 公共工具函数
 * 被所有页面脚本共用，需在页面脚本之前引入（顺序关键，否则页面脚本里的全局调用会报错）。
 */

/**
 * HTML 转义，防止拼接 HTML 时注入恶意内容。
 * 渲染表格单元格、标题、按钮参数（内联 onclick）等用户可控文本时统一使用。
 *
 * @param {string|number} str 待转义的原始文本
 * @return {string} 转义后的安全文本；空值返回空字符串
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[s];
    });
}

/**
 * 右上角轻提示（toast），3 秒后自动移除。
 *
 * @param {string} message 提示文案
 * @param {string} [type='success'] 提示类型（success / error），决定样式类 toast-success / toast-error
 */
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.remove();
    }, 3000);
}

/**
 * 时间格式化：将「yyyy-MM-ddTHH:mm:ss」截断为「yyyy-MM-dd HH:mm」。
 *
 * @param {string} t 原始时间字符串（可含 T 分隔符）
 * @return {string} 格式化后的时间；空值返回空字符串
 */
function formatTime(t) {
    if (!t) return '';
    return String(t).replace('T', ' ').substring(0, 16);
}
