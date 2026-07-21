(function () {
  'use strict';

  var TOKEN_KEY = 'anc_erp_session_token';
  var config = window.ANC_CONFIG || {};
  var localDemo = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) &&
    new URLSearchParams(window.location.search).get('demo') === '1';

  function ApiError(message, code) {
    this.name = 'ApiError';
    this.message = message || 'تعذر الاتصال بالخادم.';
    this.code = code || 'API_ERROR';
    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiError);
  }

  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  function configured() {
    return localDemo || (
      typeof config.API_URL === 'string' &&
      /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?|$)/.test(config.API_URL)
    );
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token, remember) {
    clearToken();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  function withTimeout(ms) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, ms);

    return {
      signal: controller.signal,
      clear: function () { window.clearTimeout(timer); }
    };
  }

  async function remoteRequest(action, data, options) {
    if (!configured()) {
      throw new ApiError('لم يتم ضبط رابط Google Apps Script بعد.', 'NOT_CONFIGURED');
    }

    var timeout = withTimeout(Number(config.REQUEST_TIMEOUT_MS || 30000));
    var payload = {
      action: action,
      token: getToken(),
      data: data || {}
    };

    try {
      var response = await fetch(config.API_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: timeout.signal
      });

      var raw = await response.text();
      var result;

      try {
        result = JSON.parse(raw);
      } catch (parseError) {
        throw new ApiError(
          'استجابة الخادم غير صحيحة. تأكد أن رابط النشر ينتهي بـ /exec وأن النسخة الجديدة منشورة.',
          'INVALID_RESPONSE'
        );
      }

      if (!result.ok) {
        throw new ApiError(
          result.error && result.error.message ? result.error.message : 'تعذر تنفيذ الطلب.',
          result.error && result.error.code ? result.error.code : 'API_ERROR'
        );
      }

      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.', 'TIMEOUT');
      }

      if (error instanceof ApiError) throw error;

      throw new ApiError(
        'تعذر الوصول إلى Google Apps Script. تحقق من رابط النشر وخيار الوصول Anyone.',
        'NETWORK_ERROR'
      );
    } finally {
      timeout.clear();
    }
  }

  var demoUsers = [
    {
      userId: 'USR-ADMIN',
      email: 'admin@anc.demo',
      userType: 'ADMIN',
      role: 'ADMIN',
      fullName: 'مدير النظام',
      employeeId: 'EMP-001',
      clientId: '',
      active: true,
      mustChangePassword: false
    },
    {
      userId: 'USR-EMP',
      email: 'employee@anc.demo',
      userType: 'EMPLOYEE',
      role: 'CREATIVE',
      fullName: 'أحمد حسن',
      employeeId: 'EMP-014',
      clientId: '',
      active: true,
      mustChangePassword: false
    },
    {
      userId: 'USR-CLIENT',
      email: 'client@anc.demo',
      userType: 'CLIENT',
      role: 'CLIENT',
      fullName: 'شركة أفق',
      employeeId: '',
      clientId: 'CLT-008',
      active: true,
      mustChangePassword: false
    }
  ];

  var demoNav = [
    ['dashboard', 'لوحة المؤشرات', '▦'],
    ['clients', 'العملاء', '◎'],
    ['projects', 'المشروعات', '◇'],
    ['ads', 'الإعلانات الممولة', '◉'],
    ['studio', 'الاستوديو والإنتاج', '▣'],
    ['operations', 'التشغيل والمهام', '✓'],
    ['finance', 'الفواتير والمدفوعات', '£'],
    ['profitability', 'المصروفات والربحية', '%'],
    ['documents', 'المستندات والكشوف', '▤'],
    ['reports', 'التقارير', '▥'],
    ['alerts', 'التنبيهات', '!'],
    ['status', 'تحديث الحالات', '↻'],
    ['audit', 'سجل النشاط', '◷'],
    ['users', 'إدارة الحسابات', '⚙']
  ].map(function (item) {
    return { id: item[0], label: item[1], icon: item[2] };
  });

  function demoProfile_() {
    var token = getToken();
    if (token.indexOf('client') !== -1) return demoUsers[2];
    if (token.indexOf('employee') !== -1) return demoUsers[1];
    return demoUsers[0];
  }

  function demoSummary_() {
    return {
      generatedAt: new Date().toISOString(),
      kpis: {
        revenue: 482000,
        paid: 391500,
        outstanding: 90500,
        expenses: 214000,
        netProfit: 268000,
        profitMargin: 55.6,
        activeClients: 18,
        activeProjects: 27,
        totalTasks: 96,
        completedTasks: 71,
        activeEmployees: 14,
        approvedHours: 618
      },
      monthly: [
        { label: 'فبراير', revenue: 315000, expenses: 177000, profit: 138000 },
        { label: 'مارس', revenue: 402000, expenses: 198000, profit: 204000 },
        { label: 'أبريل', revenue: 376000, expenses: 185000, profit: 191000 },
        { label: 'مايو', revenue: 449000, expenses: 206000, profit: 243000 },
        { label: 'يونيو', revenue: 461000, expenses: 211000, profit: 250000 },
        { label: 'يوليو', revenue: 482000, expenses: 214000, profit: 268000 }
      ]
    };
  }

  function demoRows_(moduleId) {
    var rows = {
      clients: [
        { 'Client ID': 'CLT-008', 'Client Name': 'شركة أفق', Status: 'ACTIVE', Email: 'client@anc.demo', Phone: '01000000000' },
        { 'Client ID': 'CLT-012', 'Client Name': 'مدار للتطوير', Status: 'ACTIVE', Email: 'hello@madar.demo', Phone: '01100000000' }
      ],
      projects: [
        { 'Project ID': 'PRJ-104', 'Client ID': 'CLT-008', 'Project Name': 'إطلاق الهوية الرقمية', Status: 'ACTIVE', Priority: 'HIGH', Budget: 180000 },
        { 'Project ID': 'PRJ-119', 'Client ID': 'CLT-012', 'Project Name': 'حملة الصيف', Status: 'IN_PROGRESS', Priority: 'MEDIUM', Budget: 95000 }
      ],
      campaigns: [
        { 'Campaign ID': 'CMP-44', 'Client ID': 'CLT-008', 'Project ID': 'PRJ-104', 'Campaign Name': 'حملة إطلاق الهوية', Platform: 'META', Status: 'ACTIVE', Budget: 50000, Currency: 'EGP' }
      ],
      paidAds: [
        { 'Ad Payment ID': 'ADP-44', 'Campaign ID': 'CMP-44', 'Client ID': 'CLT-008', Platform: 'META', Amount: 32000, Currency: 'EGP', 'Payment Date': '2026-07-12' }
      ],
      studio: [
        { 'Studio Job ID': 'STD-77', Title: 'فيديو إطلاق المنتج', Status: 'IN_REVIEW', 'Assigned To': 'employee@anc.demo', 'Due Date': '2026-07-28' }
      ],
      operations: [
        { 'Task ID': 'TSK-201', 'Task Name': 'مراجعة خطة المحتوى', Status: 'IN_PROGRESS', Priority: 'HIGH', Assignee: 'employee@anc.demo', 'Due Date': '2026-07-24' },
        { 'Task ID': 'TSK-202', 'Task Name': 'تسليم النسخة النهائية', Status: 'TODO', Priority: 'MEDIUM', Assignee: 'EMP-014', 'Due Date': '2026-07-30' }
      ],
      finance: [
        { 'Invoice ID': 'INV-84', 'Invoice Number': 'INV-2026-0084', 'Client ID': 'CLT-008', Amount: 72000, 'Tax Amount': 10080, Status: 'ISSUED' }
      ],
      profitability: [
        { 'Expense ID': 'EXP-91', Category: 'Production', Description: 'تصوير خارجي', Amount: 18000, Currency: 'EGP' }
      ],
      documents: [
        { 'Statement ID': 'STM-31', 'Client ID': 'CLT-008', 'Statement Date': '2026-07-01', Balance: 42000 }
      ],
      alerts: [
        { 'Notification ID': 'NOT-8', Type: 'DEADLINE', Title: 'موعد تسليم قريب', Message: 'باقي يومان على تسليم الفيديو', Read: false }
      ],
      status: [
        { 'Task ID': 'TSK-201', 'Task Name': 'مراجعة خطة المحتوى', Status: 'IN_PROGRESS', 'Updated At': '2026-07-21' }
      ],
      audit: [
        { Timestamp: '2026-07-21T09:30:00Z', Actor: 'admin@anc.demo', Action: 'PROJECT_UPDATED', 'Entity Type': 'PROJECT', 'Entity ID': 'PRJ-104' }
      ]
    };

    return rows[moduleId] || [];
  }

  async function demoRequest(action, data) {
    await new Promise(function (resolve) { window.setTimeout(resolve, 170); });
    data = data || {};

    if (action === 'login') {
      var type = String(data.email || '').toLowerCase().indexOf('client') !== -1
        ? 'client'
        : (String(data.email || '').toLowerCase().indexOf('employee') !== -1 ? 'employee' : 'admin');
      var profile = type === 'client' ? demoUsers[2] : (type === 'employee' ? demoUsers[1] : demoUsers[0]);
      return {
        session: { token: 'demo-' + type, expiresAt: new Date(Date.now() + 28800000).toISOString() },
        profile: profile
      };
    }

    var profile = demoProfile_();

    if (action === 'me') {
      return {
        profile: profile,
        navigation: profile.userType === 'ADMIN'
          ? demoNav
          : [{ id: profile.userType === 'CLIENT' ? 'client' : 'employee', label: profile.userType === 'CLIENT' ? 'بوابة العميل' : 'بوابة الموظف', icon: '◈' }]
      };
    }

    if (action === 'logout') return { loggedOut: true };
    if (action === 'change-password') return { changed: true, reloginRequired: true };
    if (action === 'user.create') return { user: data, mailSent: true, temporaryPassword: '' };
    if (action === 'user.active') return { userId: data.userId, active: data.active };
    if (action === 'user.reset-password') return { mailSent: true, temporaryPassword: '' };
    if (action === 'employee.update') return { saved: true };
    if (action === 'entity.save') return { saved: true, payload: data.payload || {} };

    if (action === 'portal') {
      if (profile.userType === 'CLIENT') {
        return {
          profile: profile,
          client: { clientName: 'شركة أفق', email: profile.email, phone: '01000000000' },
          summary: { projects: 3, campaigns: 4, invoiced: 182000, paid: 140000, outstanding: 42000 },
          sections: [
            { id: 'projects', label: 'المشروعات', rows: demoRows_('projects').slice(0, 1) },
            { id: 'invoices', label: 'الفواتير', rows: demoRows_('finance') }
          ]
        };
      }

      if (profile.userType === 'EMPLOYEE') {
        return {
          profile: profile,
          summary: { tasks: 6, activeTasks: 4, studioJobs: 2, hours: 38 },
          sections: [
            { id: 'tasks', label: 'مهامي', rows: demoRows_('operations') },
            { id: 'studio', label: 'أعمال الاستوديو', rows: demoRows_('studio') }
          ]
        };
      }

      return { summary: demoSummary_() };
    }

    if (action === 'module') {
      if (data.moduleId === 'dashboard' || data.moduleId === 'reports') {
        return { summary: demoSummary_() };
      }

      if (data.moduleId === 'users') {
        return { sections: [{ id: 'users', label: 'الحسابات', rows: demoUsers.slice() }] };
      }

      if (data.moduleId === 'profitability') {
        return {
          summary: { revenue: 482000, paid: 391500, expenses: 214000, netProfit: 268000, margin: 55.6, outstanding: 90500 },
          sections: [{ id: 'expenses', label: 'المصروفات', rows: demoRows_('profitability') }]
        };
      }

      if (data.moduleId === 'projects') {
        return {
          sections: [{ id: 'projects', label: 'المشروعات', rows: demoRows_('projects') }],
          lookups: { clients: demoRows_('clients') }
        };
      }

      if (data.moduleId === 'ads') {
        return {
          sections: [
            { id: 'paidAds', label: 'الإنفاق الإعلاني', rows: demoRows_('paidAds') },
            { id: 'campaigns', label: 'الحملات', rows: demoRows_('campaigns') }
          ],
          lookups: {
            clients: demoRows_('clients'),
            projects: demoRows_('projects')
          }
        };
      }

      return {
        sections: [{ id: data.moduleId, label: 'البيانات', rows: demoRows_(data.moduleId) }]
      };
    }

    return {};
  }

  async function request(action, data, options) {
    return localDemo
      ? demoRequest(action, data, options)
      : remoteRequest(action, data, options);
  }

  window.ANC_API = Object.freeze({
    ApiError: ApiError,
    configured: configured,
    isDemo: localDemo,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    request: request
  });
})();
