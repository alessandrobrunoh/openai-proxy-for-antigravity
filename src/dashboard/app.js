// Dashboard JavaScript

let refreshInterval;
let allLogs = [];

async function loadDashboard() {
  try {
    await Promise.all([
      loadHealth(),
      loadAccounts(),
      loadMetrics(),
      loadLogs(),
    ]);
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

async function loadHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();

    document.getElementById('uptime').textContent = formatUptime(data.uptime);
    document.getElementById('totalRequests').textContent = data.stats?.totalRequests || 0;
    document.getElementById('successRate').textContent = 
      (data.stats?.successRate || 0).toFixed(1) + '%';
  } catch (error) {
    console.error('Failed to load health:', error);
  }
}

async function loadAccounts() {
  try {
    const response = await fetch('/admin/api/accounts');
    const data = await response.json();

    const container = document.getElementById('accountsContainer');
    
    if (!data.accounts || data.accounts.length === 0) {
      container.innerHTML = '<p class="error">No accounts configured</p>';
      return;
    }

    const now = Date.now();
    let html = '<table class="accounts-table"><thead><tr>';
    html += '<th>Email</th>';
    html += '<th>Status</th>';
    html += '<th>Last Used</th>';
    html += '<th>Rate Limited Until</th>';
    html += '</tr></thead><tbody>';

    for (const account of data.accounts) {
      const isRateLimited = account.isRateLimited;
      const rateLimitResetTime = Object.values(account.rateLimitResetTimes)
        .filter(t => t > now)
        .sort()[0];

      html += '<tr>';
      html += `<td>${escapeHtml(account.email)}</td>`;
      html += `<td><span class="status-badge ${isRateLimited ? 'rate-limited' : 'active'}">${isRateLimited ? 'Rate Limited' : 'Active'}</span></td>`;
      html += `<td>${formatTimestamp(account.lastUsed)}</td>`;
      html += `<td>${rateLimitResetTime ? formatTimestamp(rateLimitResetTime) : '-'}</td>`;
      html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load accounts:', error);
    document.getElementById('accountsContainer').innerHTML = 
      '<p class="error">Failed to load accounts</p>';
  }
}

async function loadMetrics() {
  try {
    const response = await fetch('/admin/api/metrics');
    const data = await response.json();

    const stats = data.stats;
    document.getElementById('avgDuration').textContent = 
      stats.avgDuration ? stats.avgDuration + 'ms' : '-';

    const container = document.getElementById('metricsContainer');
    
    let html = '<div class="metrics-grid">';
    html += `<div class="metric-card"><div class="metric-label">Success</div><div class="metric-value success">${stats.successCount}</div></div>`;
    html += `<div class="metric-card"><div class="metric-label">Errors</div><div class="metric-value error">${stats.errorCount}</div></div>`;
    html += `<div class="metric-card"><div class="metric-label">Rate Limited</div><div class="metric-value warning">${stats.rateLimitedCount}</div></div>`;
    html += '</div>';

    if (stats.requestsByModel && Object.keys(stats.requestsByModel).length > 0) {
      html += '<h3>Requests by Model</h3>';
      html += '<table class="metrics-table"><thead><tr><th>Model</th><th>Requests</th></tr></thead><tbody>';
      
      for (const [model, count] of Object.entries(stats.requestsByModel)) {
        html += `<tr><td>${escapeHtml(model)}</td><td>${count}</td></tr>`;
      }
      
      html += '</tbody></table>';
    }

    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load metrics:', error);
    document.getElementById('metricsContainer').innerHTML = 
      '<p class="error">Failed to load metrics</p>';
  }
}

async function loadLogs() {
  try {
    const response = await fetch('/admin/api/logs?limit=100');
    const data = await response.json();
    allLogs = data.logs || [];
    renderLogs(allLogs);
  } catch (error) {
    console.error('Failed to load logs:', error);
    document.getElementById('logsContainer').innerHTML = 
      '<p class="error">Failed to load logs</p>';
  }
}

function renderLogs(logs) {
  const container = document.getElementById('logsContainer');
  const filter = document.getElementById('logsFilter').value.toLowerCase();

  const filteredLogs = logs.filter(log => {
    if (!filter) return true;
    return (
      log.model.toLowerCase().includes(filter) ||
      log.status.toLowerCase().includes(filter) ||
      log.type.toLowerCase().includes(filter)
    );
  });
  
  if (filteredLogs.length === 0) {
    container.innerHTML = '<p class="info">No matching requests found</p>';
    return;
  }

  let html = '<table class="logs-table"><thead><tr>';
  html += '<th>Time</th>';
  html += '<th>Model</th>';
  html += '<th>Type</th>';
  html += '<th>Duration</th>';
  html += '<th>Status</th>';
  html += '<th>Tokens</th>';
  html += '<th>Details</th>';
  html += '</tr></thead><tbody>';

  for (const log of filteredLogs) {
    html += `<tr onclick="openDetails('${log.id}')">`;
    html += `<td>${formatTimestamp(log.timestamp)}</td>`;
    html += `<td>${escapeHtml(log.model)}</td>`;
    html += `<td>${log.type}</td>`;
    html += `<td>${log.duration}ms</td>`;
    html += `<td><span class="status-badge ${log.status}">${log.status}</span></td>`;
    html += `<td>${log.tokens || '-'}</td>`;
    html += `<td><button class="btn btn-sm">View</button></td>`;
    html += '</tr>';
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

function openDetails(logId) {
  const log = allLogs.find(l => l.id === logId);
  if (!log) return;

  const modal = document.getElementById('detailsModal');
  const requestEl = document.getElementById('modalRequest');
  const responseEl = document.getElementById('modalResponse');

  requestEl.textContent = log.request ? JSON.stringify(log.request, null, 2) : '(no data)';
  
  if (typeof log.response === 'string') {
    responseEl.textContent = log.response; // For accumulated stream strings
  } else {
    responseEl.textContent = log.response ? JSON.stringify(log.response, null, 2) : '(no data)';
  }

  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('detailsModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('detailsModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

document.getElementById('logsFilter').addEventListener('input', () => {
  renderLogs(allLogs);
});

async function refreshLogs() {
  await loadLogs();
}

async function clearLogs() {
  if (!confirm('Are you sure you want to clear all logs?')) {
    return;
  }

  try {
    await fetch('/admin/api/logs/clear', { method: 'POST' });
    await loadLogs();
  } catch (error) {
    console.error('Failed to clear logs:', error);
    alert('Failed to clear logs');
  }
}

function formatUptime(seconds) {
  if (!seconds) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Handle future dates (e.g. rate limit resets)
  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const diffSecs = Math.floor(absDiffMs / 1000);
    const diffMins = Math.floor(absDiffMs / 60000);

    if (diffSecs < 60) {
      return `in ${diffSecs}s`;
    } else if (diffMins < 60) {
      return `in ${diffMins}m ${Math.floor((absDiffMs % 60000) / 1000)}s`;
    } else {
      return `in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    }
  }

  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return date.toLocaleString();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-refresh every 5 seconds
refreshInterval = setInterval(loadDashboard, 5000);

// Initial load
loadDashboard();