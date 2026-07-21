(function () {
  'use strict';

  var LABELS = {
    revenue: 'الإيرادات',
    tax: 'الضرائب',
    invoiceTotal: 'إجمالي الفواتير',
    paid: 'المحصل',
    outstanding: 'المستحق',
    expenses: 'المصروفات',
    netProfit: 'صافي الربح',
    profitMargin: 'هامش الربح',
    margin: 'هامش الربح',
    collectionRate: 'نسبة التحصيل',
    activeClients: 'العملاء النشطون',
    activeProjects: 'المشروعات النشطة',
    totalProjects: 'إجمالي المشروعات',
    projects: 'المشروعات',
    campaigns: 'الحملات',
    totalTasks: 'إجمالي المهام',
    completedTasks: 'المهام المكتملة',
    taskCompletionRate: 'إنجاز المهام',
    activeEmployees: 'الموظفون النشطون',
    approvedHours: 'الساعات المعتمدة',
    pendingHours: 'الساعات المعلقة',
    tasks: 'المهام',
    activeTasks: 'المهام النشطة',
    studioJobs: 'أعمال الاستوديو',
    hours: 'ساعات العمل',
    invoiced: 'إجمالي الفواتير',
    'User ID': 'معرّف المستخدم',
    userId: 'معرّف المستخدم',
    'User Type': 'نوع الحساب',
    userType: 'نوع الحساب',
    Role: 'الدور',
    role: 'الدور',
    'Full Name': 'الاسم',
    fullName: 'الاسم',
    Email: 'البريد الإلكتروني',
    email: 'البريد الإلكتروني',
    Active: 'نشط',
    active: 'نشط',
    mustChangePassword: 'تغيير كلمة المرور',
    employeeId: 'معرّف الموظف',
    clientId: 'معرّف العميل',
    'Client ID': 'معرّف العميل',
    'Client Name': 'اسم العميل',
    Status: 'الحالة',
    'Primary Contact': 'مسؤول التواصل',
    Phone: 'الهاتف',
    Industry: 'النشاط',
    'Account Manager': 'مدير الحساب',
    'Project ID': 'معرّف المشروع',
    'Project Name': 'اسم المشروع',
    Priority: 'الأولوية',
    'Start Date': 'تاريخ البداية',
    'Due Date': 'تاريخ التسليم',
    Budget: 'الميزانية',
    Currency: 'العملة',
    'Task ID': 'معرّف المهمة',
    'Task Name': 'اسم المهمة',
    Assignee: 'المسؤول',
    'Estimated Hours': 'الساعات المقدرة',
    'Invoice ID': 'معرّف الفاتورة',
    'Invoice Number': 'رقم الفاتورة',
    'Issue Date': 'تاريخ الإصدار',
    Amount: 'القيمة',
    'Tax Amount': 'الضريبة',
    'Payment ID': 'معرّف الدفعة',
    'Payment Date': 'تاريخ الدفع',
    Method: 'الطريقة',
    Reference: 'المرجع',
    'Expense ID': 'معرّف المصروف',
    'Expense Date': 'تاريخ المصروف',
    Category: 'التصنيف',
    Description: 'الوصف',
    Vendor: 'المورد',
    Platform: 'المنصة',
    Title: 'العنوان',
    Message: 'الرسالة',
    Read: 'مقروء',
    Timestamp: 'التوقيت',
    Actor: 'المستخدم',
    Action: 'الإجراء',
    'Entity Type': 'نوع السجل',
    'Entity ID': 'معرّف السجل',
    label: 'الفترة',
    profit: 'الربح',
    payments: 'المدفوعات'
  };

  var MONEY_KEYS = [
    'revenue', 'tax', 'invoiceTotal', 'paid', 'outstanding', 'expenses',
    'netProfit', 'invoiced', 'Amount', 'Tax Amount', 'Budget', 'Balance',
    'Total Invoiced', 'Total Paid'
  ];

  var PERCENT_KEYS = ['profitMargin', 'margin', 'collectionRate', 'taskCompletionRate'];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function label(key) {
    return LABELS[key] || String(key || '').replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function number(value) {
    var result = Number(value);
    return Number.isFinite(result) ? result : 0;
  }

  function money(value, currency) {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency || 'EGP',
      maximumFractionDigits: 0
    }).format(number(value));
  }

  function format(key, value, record) {
    if (value === null || value === undefined || value === '') return '—';
    if (value === true) return 'نعم';
    if (value === false) return 'لا';
    if (MONEY_KEYS.indexOf(key) !== -1) return money(value, record && record.Currency);
    if (PERCENT_KEYS.indexOf(key) !== -1) {
      return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 1 }).format(number(value)) + '%';
    }
    if (value instanceof Date) return value.toLocaleDateString('ar-EG');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function toast(message, isError, duration) {
    var region = document.getElementById('toast-region');
    if (!region) return;

    var item = el('div', 'toast' + (isError ? ' error' : ''), message);
    region.appendChild(item);

    window.setTimeout(function () {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, duration || 4800);
  }

  function empty(title, message) {
    var box = el('div', 'empty-state');
    box.appendChild(el('strong', '', title || 'لا توجد بيانات'));
    box.appendChild(el('p', '', message || 'ستظهر السجلات هنا بعد إضافتها إلى قاعدة البيانات.'));
    return box;
  }

  function columns(rows) {
    var result = [];
    var blocked = /password|token|salt|hash/i;

    (rows || []).slice(0, 20).forEach(function (row) {
      Object.keys(row || {}).forEach(function (key) {
        if (!blocked.test(key) && key.charAt(0) !== '_' && result.indexOf(key) === -1) {
          result.push(key);
        }
      });
    });

    return result.slice(0, 10);
  }

  function statusClass(value) {
    var normalized = String(value || '').toUpperCase();
    return ['ACTIVE', 'PAID', 'DONE', 'COMPLETED', 'APPROVED', 'TRUE'].indexOf(normalized) !== -1
      ? 'status-active'
      : (['INACTIVE', 'CANCELLED', 'BLOCKED', 'FALSE'].indexOf(normalized) !== -1 ? 'status-inactive' : '');
  }

  function table(rows, options) {
    options = options || {};
    var list = Array.isArray(rows) ? rows : [];

    if (!list.length) return empty(options.emptyTitle, options.emptyMessage);

    var wrap = el('div', 'table-scroll');
    var tableNode = el('table', 'data-table');
    var thead = el('thead');
    var headerRow = el('tr');
    var cols = options.columns || columns(list);

    cols.forEach(function (key) {
      headerRow.appendChild(el('th', '', label(key)));
    });

    if (options.actions) headerRow.appendChild(el('th', '', 'الإجراءات'));
    thead.appendChild(headerRow);
    tableNode.appendChild(thead);

    var tbody = el('tbody');
    list.forEach(function (record) {
      var row = el('tr');

      cols.forEach(function (key) {
        var cell = el('td', statusClass(record[key]), format(key, record[key], record));
        cell.title = format(key, record[key], record);
        row.appendChild(cell);
      });

      if (options.actions) {
        var actionsCell = el('td', 'actions-cell');
        options.actions(record, actionsCell);
        row.appendChild(actionsCell);
      }

      tbody.appendChild(row);
    });

    tableNode.appendChild(tbody);
    wrap.appendChild(tableNode);
    return wrap;
  }

  function metrics(values, preferredKeys) {
    var source = values || {};
    var keys = preferredKeys || Object.keys(source);
    var grid = el('div', 'metrics');

    keys.filter(function (key) {
      return source[key] !== undefined;
    }).slice(0, 12).forEach(function (key) {
      var card = el('article', 'metric');
      card.appendChild(el('span', 'metric-label', label(key)));
      card.appendChild(el('strong', 'metric-value', format(key, source[key], source)));
      grid.appendChild(card);
    });

    return grid;
  }

  function card(title, rows, options) {
    var article = el('article', 'card' + ((options && options.wide) ? ' wide' : ''));
    var head = el('header', 'card-head');
    head.appendChild(el('h3', '', title));
    head.appendChild(el('span', 'count-badge', Array.isArray(rows) ? rows.length : 0));
    article.appendChild(head);
    article.appendChild(table(rows, options));
    return article;
  }

  function sections(items) {
    var grid = el('div', 'card-grid');
    (items || []).forEach(function (section) {
      grid.appendChild(card(section.label || label(section.id), section.rows || [], {
        wide: true
      }));
    });

    if (!(items || []).length) grid.appendChild(empty());
    return grid;
  }

  function loading(container) {
    clear(container);
    var grid = el('div', 'loading-grid');
    for (var index = 0; index < 4; index += 1) grid.appendChild(el('div', 'skeleton'));
    container.appendChild(grid);
  }

  window.ANC_UI = Object.freeze({
    el: el,
    clear: clear,
    label: label,
    format: format,
    money: money,
    toast: toast,
    empty: empty,
    table: table,
    metrics: metrics,
    card: card,
    sections: sections,
    loading: loading
  });
})();
