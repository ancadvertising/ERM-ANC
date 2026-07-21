(function () {
  'use strict';

  function summaryNode(summary, ui) {
    if (!summary) return null;
    var values = summary.kpis || summary;
    return ui.metrics(values, [
      'revenue', 'paid', 'outstanding', 'expenses', 'netProfit', 'profitMargin',
      'activeClients', 'activeProjects', 'totalTasks', 'completedTasks',
      'activeEmployees', 'approvedHours', 'projects', 'campaigns', 'invoiced',
      'tasks', 'activeTasks', 'studioJobs', 'hours'
    ]);
  }

  function renderModule(container, data, route, context) {
    var ui = context.ui;
    ui.clear(container);

    var summary = data && data.summary;
    var metrics = summaryNode(summary, ui);
    if (metrics) container.appendChild(metrics);

    var sections = (data && data.sections) ? data.sections.slice() : [];
    if (summary && summary.monthly && summary.monthly.length) {
      sections.unshift({ id: 'monthly', label: 'الأداء الشهري', rows: summary.monthly });
    }

    if (sections.length) container.appendChild(ui.sections(sections));
    else if (!metrics) container.appendChild(ui.empty('لا توجد بيانات', 'ستظهر بيانات ' + context.routeLabel(route) + ' هنا.'));
  }

  function welcome(title, subtitle, ui) {
    var section = ui.el('section', 'portal-welcome');
    var copy = ui.el('div');
    copy.appendChild(ui.el('h2', '', title));
    copy.appendChild(ui.el('p', '', subtitle));
    section.appendChild(copy);
    section.appendChild(ui.el('span', 'status-badge', 'جلسة آمنة'));
    return section;
  }

  function renderClient(container, data, context) {
    var ui = context.ui;
    ui.clear(container);

    var clientName = data.client && data.client.clientName
      ? data.client.clientName
      : context.profile.fullName;

    container.appendChild(welcome(
      'مرحبًا، ' + clientName,
      'هنا يمكنك متابعة مشروعاتك وفواتيرك ومدفوعاتك فقط.',
      ui
    ));
    container.appendChild(ui.metrics(data.summary || {}, [
      'projects', 'campaigns', 'invoiced', 'paid', 'outstanding'
    ]));
    container.appendChild(ui.sections(data.sections || []));
  }

  function renderEmployee(container, data, context) {
    var ui = context.ui;
    ui.clear(container);

    container.appendChild(welcome(
      'مرحبًا، ' + (data.profile.fullName || context.profile.fullName),
      'مساحة العمل الخاصة بمهامك وتحديثات التنفيذ.',
      ui
    ));
    container.appendChild(ui.metrics(data.summary || {}, [
      'tasks', 'activeTasks', 'studioJobs', 'hours'
    ]));

    var tasksSection = (data.sections || []).filter(function (section) {
      return section.id === 'tasks';
    })[0];
    var tasks = tasksSection ? tasksSection.rows : [];

    var card = ui.el('article', 'card wide');
    var head = ui.el('header', 'card-head');
    head.appendChild(ui.el('h3', '', 'إضافة تحديث عمل'));
    card.appendChild(head);

    var body = ui.el('div', 'card-body');
    body.innerHTML = '<form id="employee-update-form" class="form-grid">' +
      '<div class="field-group"><label for="update-task">المهمة</label><select class="field" id="update-task" name="taskId" required></select></div>' +
      '<div class="field-group"><label for="update-progress">نسبة الإنجاز</label><input class="field" id="update-progress" name="progressPercent" type="number" min="0" max="100" value="0" required></div>' +
      '<div class="field-group full"><label for="update-details">تفاصيل التحديث</label><textarea class="field" id="update-details" name="progressDetails" required></textarea></div>' +
      '<div class="field-group full"><label for="update-url">رابط التسليم</label><input class="field" id="update-url" name="deliveryUrl" type="url" inputmode="url"></div>' +
      '<div class="full"><button class="btn btn-primary" type="submit">حفظ التحديث</button></div></form>';

    var select = body.querySelector('select');
    var placeholder = ui.el('option', '', 'اختر المهمة');
    placeholder.value = '';
    select.appendChild(placeholder);

    tasks.forEach(function (task) {
      var option = ui.el('option', '', (task['Task Name'] || task.Title || task['Task ID']) + ' · ' + (task.Status || ''));
      option.value = task['Task ID'];
      select.appendChild(option);
    });

    card.appendChild(body);
    container.appendChild(card);
    container.appendChild(ui.sections(data.sections || []));

    document.getElementById('employee-update-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var button = form.querySelector('button[type="submit"]');
      context.setBusy(button, true);

      try {
        await context.api.request('employee.update', {
          taskId: form.taskId.value,
          progressPercent: form.progressPercent.value,
          progressDetails: form.progressDetails.value,
          deliveryUrl: form.deliveryUrl.value
        });
        ui.toast('تم حفظ تحديث العمل بنجاح.');
        context.loadRoute('employee');
      } catch (error) {
        ui.toast(error.message, true);
      } finally {
        context.setBusy(button, false);
      }
    });
  }

  function userTable(rows, context) {
    var ui = context.ui;
    var card = ui.el('article', 'card');
    var head = ui.el('header', 'card-head');
    head.appendChild(ui.el('h3', '', 'الحسابات'));
    head.appendChild(ui.el('span', 'count-badge', rows.length));
    card.appendChild(head);

    card.appendChild(ui.table(rows, {
      columns: ['fullName', 'email', 'userType', 'role', 'active'],
      actions: function (record, cell) {
        var toggle = ui.el('button', 'table-btn', record.active ? 'إيقاف' : 'تفعيل');
        toggle.type = 'button';
        toggle.addEventListener('click', function () {
          updateActive(record, !record.active, toggle, context);
        });

        var reset = ui.el('button', 'table-btn', 'إعادة كلمة المرور');
        reset.type = 'button';
        reset.addEventListener('click', function () {
          resetPassword(record, reset, context);
        });

        cell.appendChild(toggle);
        cell.appendChild(reset);
      }
    }));

    return card;
  }

  function renderUsers(container, data, context) {
    var ui = context.ui;
    ui.clear(container);

    var rows = data.sections && data.sections[0] ? data.sections[0].rows : [];
    var layout = ui.el('div', 'user-admin-layout');

    var formCard = ui.el('article', 'card');
    var head = ui.el('header', 'card-head');
    head.appendChild(ui.el('h3', '', 'إنشاء حساب جديد'));
    formCard.appendChild(head);

    var body = ui.el('div', 'card-body');
    body.innerHTML = '<form id="create-user-form" class="form-stack">' +
      '<div class="field-group"><label for="user-name">الاسم الكامل</label><input class="field" id="user-name" name="fullName" required></div>' +
      '<div class="field-group"><label for="user-email">البريد الإلكتروني</label><input class="field" id="user-email" name="email" type="email" inputmode="email" required></div>' +
      '<div class="form-grid"><div class="field-group"><label for="user-type">نوع الحساب</label><select class="field" id="user-type" name="userType">' +
      '<option value="EMPLOYEE">موظف</option><option value="CLIENT">عميل</option><option value="ADMIN">إدارة</option></select></div>' +
      '<div class="field-group"><label for="user-role">الدور</label><select class="field" id="user-role" name="role">' +
      '<option value="EMPLOYEE">EMPLOYEE</option><option value="CREATIVE">CREATIVE</option><option value="MEDIA_BUYER">MEDIA_BUYER</option>' +
      '<option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER</option><option value="FINANCE">FINANCE</option><option value="MANAGER">MANAGER</option>' +
      '<option value="ADMIN">ADMIN</option><option value="CLIENT">CLIENT</option></select></div></div>' +
      '<div class="field-group"><label for="employee-id">معرّف الموظف (إن وجد)</label><input class="field" id="employee-id" name="employeeId"></div>' +
      '<div class="field-group"><label for="client-id">معرّف العميل (مطلوب للعميل)</label><input class="field" id="client-id" name="clientId"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">إنشاء الحساب وإرسال كلمة المرور</button></form>';

    formCard.appendChild(body);
    layout.appendChild(formCard);
    layout.appendChild(userTable(rows, context));
    container.appendChild(layout);

    document.getElementById('create-user-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var button = form.querySelector('button[type="submit"]');
      context.setBusy(button, true);

      try {
        var result = await context.api.request('user.create', {
          fullName: form.fullName.value.trim(),
          email: form.email.value.trim(),
          userType: form.userType.value,
          role: form.role.value,
          employeeId: form.employeeId.value.trim(),
          clientId: form.clientId.value.trim()
        });

        ui.toast(
          result.mailSent
            ? 'تم إنشاء الحساب وإرسال كلمة المرور المؤقتة.'
            : 'تم إنشاء الحساب. كلمة المرور المؤقتة: ' + result.temporaryPassword,
          false,
          9000
        );
        context.loadRoute('users');
      } catch (error) {
        ui.toast(error.message, true);
      } finally {
        context.setBusy(button, false);
      }
    });
  }

  async function updateActive(record, active, button, context) {
    context.setBusy(button, true);
    try {
      await context.api.request('user.active', { userId: record.userId, active: active });
      context.ui.toast(active ? 'تم تفعيل الحساب.' : 'تم إيقاف الحساب.');
      context.loadRoute('users');
    } catch (error) {
      context.ui.toast(error.message, true);
    } finally {
      context.setBusy(button, false);
    }
  }

  async function resetPassword(record, button, context) {
    if (!window.confirm('هل تريد إصدار كلمة مرور مؤقتة جديدة لهذا الحساب؟')) return;
    context.setBusy(button, true);

    try {
      var result = await context.api.request('user.reset-password', { userId: record.userId });
      context.ui.toast(
        result.mailSent
          ? 'تم إرسال كلمة المرور المؤقتة إلى المستخدم.'
          : 'كلمة المرور المؤقتة: ' + result.temporaryPassword,
        false,
        9000
      );
    } catch (error) {
      context.ui.toast(error.message, true);
    } finally {
      context.setBusy(button, false);
    }
  }

  window.ANC_VIEWS = Object.freeze({
    renderModule: renderModule,
    renderClient: renderClient,
    renderEmployee: renderEmployee,
    renderUsers: renderUsers
  });
})();
