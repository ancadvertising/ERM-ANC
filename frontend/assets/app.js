(function () {
  'use strict';

  var api = window.ANC_API;
  var ui = window.ANC_UI;
  var views = window.ANC_VIEWS;
  var app = document.getElementById('app');
  var state = { profile: null, navigation: [], current: '', sequence: 0 };

  var DESCRIPTIONS = {
    dashboard: 'نظرة شاملة على أداء الوكالة',
    clients: 'إدارة ملفات العملاء وبيانات التواصل',
    projects: 'متابعة المشروعات والميزانيات والمواعيد',
    ads: 'مراجعة الحملات والإنفاق الإعلاني',
    studio: 'إدارة أعمال الاستوديو وملفات الإنتاج',
    operations: 'المهام وساعات العمل وحالة التنفيذ',
    finance: 'الفواتير والمدفوعات والتحصيل',
    profitability: 'الإيرادات والمصروفات وصافي الربح',
    documents: 'كشوف الحساب ومستندات الفواتير',
    reports: 'تقارير الإدارة ومؤشرات الأداء',
    alerts: 'التنبيهات والإشعارات المهمة',
    status: 'متابعة حالة المشروعات والمهام والفواتير',
    audit: 'سجل العمليات والتغييرات داخل النظام',
    users: 'إنشاء الحسابات وضبط وصول المستخدمين',
    employee: 'المهام والتحديثات الخاصة بالموظف',
    client: 'المشروعات والفواتير الخاصة بالعميل'
  };

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText || 'جارٍ التنفيذ…';
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function bindPasswordToggles(root) {
    root.querySelectorAll('[data-password-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        button.textContent = input.type === 'password' ? 'عرض' : 'إخفاء';
      });
    });
  }

  function showSetup() {
    app.innerHTML = '<main class="setup-card"><div class="brand-mark">ANC</div>' +
      '<h1>أكمل ربط الواجهة بالخادم</h1>' +
      '<p class="config-note">الواجهة جاهزة، لكن رابط Google Apps Script لم يُضبط بعد.</p>' +
      '<ol><li>انشر مجلد <code>backend</code> كتطبيق ويب في Google Apps Script.</li>' +
      '<li>اختر <code>Execute as: Me</code> و<code>Who has access: Anyone</code>.</li>' +
      '<li>انسخ رابط <code>/exec</code> إلى <code>frontend/config.js</code> وأضف <code>?api=v1</code>.</li>' +
      '<li>أعد نشر GitHub Pages ثم افتح الصفحة من جديد.</li></ol></main>';
  }

  function loginMarkup() {
    return '<main class="login-layout">' +
      '<section class="login-hero"><div class="login-brand"><span class="brand-mark">ANC</span><span>ANC ERP</span></div>' +
      '<div class="login-copy"><p class="eyebrow">Marketing Operations</p><h1>كل أعمال الوكالة في مساحة واحدة.</h1>' +
      '<p>بوابات مستقلة وآمنة للإدارة والموظفين والعملاء، مع تجربة مصممة للعمل بسلاسة على الهاتف والكمبيوتر.</p></div>' +
      '<div class="portal-pills"><span class="portal-pill">بوابة الإدارة</span><span class="portal-pill">بوابة الموظفين</span><span class="portal-pill">بوابة العملاء</span></div></section>' +
      '<section class="login-panel"><div class="login-card"><p class="eyebrow">دخول آمن</p><h2>مرحبًا بعودتك</h2>' +
      '<p>استخدم البريد المسجل في قاعدة بيانات النظام.</p><form id="login-form" class="form-stack" novalidate>' +
      '<div id="login-error" class="form-error" hidden></div>' +
      '<div class="field-group"><label for="login-email">البريد الإلكتروني</label><input class="field" id="login-email" name="email" type="email" autocomplete="username" inputmode="email" required placeholder="name@company.com"></div>' +
      '<div class="field-group"><label for="login-password">كلمة المرور</label><div class="password-wrap">' +
      '<input class="field" id="login-password" name="password" type="password" autocomplete="current-password" required minlength="10">' +
      '<button class="password-toggle" type="button" data-password-toggle="login-password">عرض</button></div></div>' +
      '<label class="check-row"><input id="remember-session" type="checkbox">الاحتفاظ بالدخول على هذا الجهاز</label>' +
      '<button class="btn btn-primary btn-block" type="submit">تسجيل الدخول</button></form></div></section></main>';
  }

  function showLogin(message) {
    state.profile = null;
    state.navigation = [];
    document.body.classList.remove('sidebar-open');
    app.innerHTML = loginMarkup();
    bindPasswordToggles(app);

    var errorBox = document.getElementById('login-error');
    if (message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    document.getElementById('login-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var button = form.querySelector('button[type="submit"]');
      errorBox.hidden = true;
      setBusy(button, true, 'جارٍ التحقق…');

      try {
        var result = await api.request('login', {
          email: form.email.value.trim(),
          password: form.password.value
        });

        api.setToken(result.session.token, document.getElementById('remember-session').checked);
        if (result.profile.mustChangePassword) {
          showPasswordChange(result.profile);
          return;
        }

        enterApplication(await api.request('me'));
      } catch (error) {
        api.clearToken();
        errorBox.textContent = error.message;
        errorBox.hidden = false;
      } finally {
        setBusy(button, false);
      }
    });
  }

  function showPasswordChange(profile) {
    app.innerHTML = '<main class="login-layout"><section class="login-hero">' +
      '<div class="login-brand"><span class="brand-mark">ANC</span><span>ANC ERP</span></div>' +
      '<div class="login-copy"><p class="eyebrow">حماية الحساب</p><h1>أنشئ كلمة مرورك الخاصة.</h1>' +
      '<p>هذه الخطوة مطلوبة مرة واحدة عند استخدام كلمة المرور المؤقتة.</p></div></section>' +
      '<section class="login-panel"><div class="login-card"><p class="eyebrow">مرحبًا</p><h2 id="change-name"></h2>' +
      '<p>اختر كلمة مرور لا تقل عن 10 أحرف وتحتوي على حرف ورقم.</p>' +
      '<form id="password-form" class="form-stack"><div id="password-error" class="form-error" hidden></div>' +
      '<div class="field-group"><label for="current-password">كلمة المرور الحالية</label><div class="password-wrap">' +
      '<input class="field" id="current-password" name="currentPassword" type="password" autocomplete="current-password" required>' +
      '<button class="password-toggle" type="button" data-password-toggle="current-password">عرض</button></div></div>' +
      '<div class="field-group"><label for="new-password">كلمة المرور الجديدة</label><div class="password-wrap">' +
      '<input class="field" id="new-password" name="newPassword" type="password" minlength="10" autocomplete="new-password" required>' +
      '<button class="password-toggle" type="button" data-password-toggle="new-password">عرض</button></div></div>' +
      '<div class="field-group"><label for="confirm-password">تأكيد كلمة المرور</label>' +
      '<input class="field" id="confirm-password" name="confirmPassword" type="password" minlength="10" autocomplete="new-password" required></div>' +
      '<button class="btn btn-primary btn-block" type="submit">حفظ كلمة المرور</button>' +
      '<button id="cancel-password" class="btn btn-ghost btn-block" type="button">تسجيل الخروج</button></form></div></section></main>';

    document.getElementById('change-name').textContent = profile.fullName || profile.email;
    bindPasswordToggles(app);
    document.getElementById('cancel-password').addEventListener('click', signOut);

    document.getElementById('password-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var errorBox = document.getElementById('password-error');
      var button = form.querySelector('button[type="submit"]');

      if (form.newPassword.value !== form.confirmPassword.value) {
        errorBox.textContent = 'تأكيد كلمة المرور غير مطابق.';
        errorBox.hidden = false;
        return;
      }

      setBusy(button, true, 'جارٍ الحفظ…');
      errorBox.hidden = true;

      try {
        await api.request('change-password', {
          currentPassword: form.currentPassword.value,
          newPassword: form.newPassword.value
        });
        api.clearToken();
        showLogin('تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة.');
      } catch (error) {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
      } finally {
        setBusy(button, false);
      }
    });
  }

  function roleLabel(profile) {
    var types = { ADMIN: 'الإدارة', EMPLOYEE: 'الموظفون', CLIENT: 'العملاء' };
    return (types[profile.userType] || profile.userType) + ' · ' + (profile.role || '');
  }

  function renderShell() {
    app.innerHTML = '<div class="app-shell"><aside class="sidebar" aria-label="القائمة الرئيسية">' +
      '<div class="sidebar-head"><div class="sidebar-brand"><span class="brand-mark">ANC</span><span>ANC ERP</span></div>' +
      '<button class="btn btn-ghost sidebar-close" id="sidebar-close" type="button" aria-label="إغلاق القائمة">×</button></div>' +
      '<div class="profile-chip"><strong id="profile-name"></strong><span id="profile-email"></span></div>' +
      '<nav class="side-nav" id="side-nav"></nav><div class="sidebar-footer">' +
      '<button class="btn btn-ghost" id="logout-button" type="button">تسجيل الخروج</button><span class="version">ANC ERP · v1.1.1</span></div></aside>' +
      '<button class="mobile-overlay" id="mobile-overlay" type="button" aria-label="إغلاق القائمة"></button>' +
      '<main class="shell-main" id="main-content"><header class="topbar"><div class="topbar-title">' +
      '<h1 id="page-title">ANC ERP</h1><p id="page-description"></p></div><div class="topbar-actions">' +
      '<button class="btn btn-ghost menu-toggle" id="menu-toggle" type="button" aria-label="فتح القائمة">☰</button>' +
      '<button class="btn btn-ghost" id="refresh-button" type="button">↻ <span>تحديث</span></button></div></header>' +
      '<section class="page-content" id="page-content"></section></main></div>';

    document.getElementById('profile-name').textContent = state.profile.fullName;
    document.getElementById('profile-email').textContent = state.profile.email + ' · ' + roleLabel(state.profile);

    var nav = document.getElementById('side-nav');
    state.navigation.forEach(function (item) {
      var button = ui.el('button', 'nav-link');
      button.type = 'button';
      button.dataset.route = item.id;
      button.appendChild(ui.el('span', 'nav-icon', item.icon || '•'));
      button.appendChild(ui.el('span', '', item.label));
      button.addEventListener('click', function () {
        navigate(item.id);
        closeSidebar();
      });
      nav.appendChild(button);
    });

    document.getElementById('logout-button').addEventListener('click', signOut);
    document.getElementById('refresh-button').addEventListener('click', function () { loadRoute(state.current); });
    document.getElementById('menu-toggle').addEventListener('click', function () { document.body.classList.add('sidebar-open'); });
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('mobile-overlay').addEventListener('click', closeSidebar);
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }

  function defaultRoute() {
    if (state.profile.userType === 'CLIENT') return 'client';
    if (state.profile.userType === 'EMPLOYEE') return 'employee';
    return state.navigation.length ? state.navigation[0].id : 'dashboard';
  }

  function enterApplication(me) {
    state.profile = me.profile;
    state.navigation = me.navigation || [];
    renderShell();

    var requested = String(window.location.hash || '').replace(/^#\/?/, '').split('/').pop();
    var allowed = state.navigation.some(function (item) { return item.id === requested; });
    navigate(allowed ? requested : defaultRoute(), true);
  }

  function navigate(route, replace) {
    var prefix = state.profile.userType === 'ADMIN' ? 'admin/' : '';
    var hash = '#/' + prefix + route;

    if (replace) {
      history.replaceState(null, '', hash);
      loadRoute(route);
    } else if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      loadRoute(route);
    }
  }

  function routeLabel(route) {
    var item = state.navigation.filter(function (entry) { return entry.id === route; })[0];
    return item ? item.label : (route === 'client' ? 'بوابة العميل' : 'بوابة الموظف');
  }

  function viewContext() {
    return {
      api: api,
      ui: ui,
      profile: state.profile,
      setBusy: setBusy,
      loadRoute: loadRoute,
      routeLabel: routeLabel
    };
  }

  async function loadRoute(route) {
    if (!state.profile) return;

    if (!state.navigation.some(function (item) { return item.id === route; })) {
      route = defaultRoute();
    }

    state.current = route;
    document.querySelectorAll('.nav-link').forEach(function (button) {
      button.classList.toggle('active', button.dataset.route === route);
    });

    document.getElementById('page-title').textContent = routeLabel(route);
    document.getElementById('page-description').textContent = DESCRIPTIONS[route] || '';
    var content = document.getElementById('page-content');
    ui.loading(content);
    var sequence = ++state.sequence;

    try {
      var data = (route === 'client' || route === 'employee')
        ? await api.request('portal')
        : await api.request('module', { moduleId: route });

      if (sequence !== state.sequence) return;

      var context = viewContext();
      if (route === 'client') views.renderClient(content, data, context);
      else if (route === 'employee') views.renderEmployee(content, data, context);
      else if (route === 'users') views.renderUsers(content, data, context);
      else views.renderModule(content, data, route, context);
    } catch (error) {
      if (error.code === 'AUTH_REQUIRED') {
        api.clearToken();
        showLogin('انتهت جلسة الدخول. سجّل الدخول مرة أخرى.');
        return;
      }

      ui.clear(content);
      content.appendChild(ui.empty('تعذر تحميل الصفحة', error.message));
      ui.toast(error.message, true);
    }
  }

  async function signOut() {
    try {
      if (api.getToken()) await api.request('logout');
    } catch (ignore) {}

    api.clearToken();
    history.replaceState(null, '', window.location.pathname + window.location.search);
    showLogin();
  }

  async function bootstrap() {
    if (!api.configured()) {
      showSetup();
      return;
    }

    if (!api.getToken()) {
      showLogin();
      return;
    }

    try {
      var me = await api.request('me');
      if (me.profile.mustChangePassword) showPasswordChange(me.profile);
      else enterApplication(me);
    } catch (error) {
      api.clearToken();
      showLogin(error.code === 'AUTH_REQUIRED' ? 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.' : error.message);
    }
  }

  window.addEventListener('hashchange', function () {
    if (!state.profile) return;
    var route = String(window.location.hash || '').replace(/^#\/?/, '').split('/').pop();
    loadRoute(route || defaultRoute());
  });

  bootstrap();
})();
