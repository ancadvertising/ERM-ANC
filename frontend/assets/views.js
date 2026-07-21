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

  function rowOptions(rows, idKey, labelKey) {
    return (rows || []).map(function (row) {
      var id = String(row[idKey] || '');
      var label = String(row[labelKey] || id);
      return { value: id, label: label + (id ? ' · ' + id : '') };
    }).filter(function (item) { return item.value; });
  }

  function sectionRows(data, sectionId) {
    var section = ((data && data.sections) || []).filter(function (item) {
      return item.id === sectionId;
    })[0];
    return section ? section.rows || [] : [];
  }

  function editorConfigs(route, data) {
    var clients = (data.lookups && data.lookups.clients) || sectionRows(data, 'clients');
    var projects = (data.lookups && data.lookups.projects) || sectionRows(data, 'projects');
    var campaigns = sectionRows(data, 'campaigns');
    var clientOptions = rowOptions(clients, 'Client ID', 'Client Name');
    var projectOptions = rowOptions(projects, 'Project ID', 'Project Name');
    var campaignOptions = rowOptions(campaigns, 'Campaign ID', 'Campaign Name');
    var clientStatuses = [
      { value: 'LEAD', label: 'عميل محتمل' },
      { value: 'ACTIVE', label: 'نشط' },
      { value: 'INACTIVE', label: 'غير نشط' },
      { value: 'ARCHIVED', label: 'مؤرشف' }
    ];
    var projectStatuses = [
      { value: 'DRAFT', label: 'مسودة' },
      { value: 'ACTIVE', label: 'نشط' },
      { value: 'ON_HOLD', label: 'معلق' },
      { value: 'COMPLETED', label: 'مكتمل' },
      { value: 'CANCELLED', label: 'ملغي' }
    ];
    var campaignStatuses = [
      { value: 'DRAFT', label: 'مسودة' },
      { value: 'ACTIVE', label: 'نشطة' },
      { value: 'PAUSED', label: 'متوقفة مؤقتًا' },
      { value: 'COMPLETED', label: 'مكتملة' },
      { value: 'ARCHIVED', label: 'مؤرشفة' }
    ];
    var priorities = [
      { value: 'LOW', label: 'منخفضة' },
      { value: 'MEDIUM', label: 'متوسطة' },
      { value: 'HIGH', label: 'مرتفعة' },
      { value: 'URGENT', label: 'عاجلة' }
    ];

    var configs = {
      clients: [{
        route: route,
        sectionId: 'clients',
        entity: 'clients',
        addLabel: 'إضافة عميل جديد',
        createTitle: 'إضافة عميل جديد',
        editTitle: 'تعديل بيانات العميل',
        successCreate: 'تمت إضافة العميل بنجاح.',
        successEdit: 'تم تحديث بيانات العميل.',
        identity: { record: 'Client ID', payload: 'id' },
        fields: [
          { name: 'clientName', key: 'Client Name', label: 'اسم العميل', required: true },
          { name: 'status', key: 'Status', label: 'الحالة', type: 'select', options: clientStatuses, defaultValue: 'LEAD' },
          { name: 'primaryContact', key: 'Primary Contact', label: 'مسؤول التواصل' },
          { name: 'email', key: 'Email', label: 'البريد الإلكتروني', type: 'email' },
          { name: 'phone', key: 'Phone', label: 'الهاتف', type: 'tel' },
          { name: 'industry', key: 'Industry', label: 'النشاط' },
          { name: 'accountManager', key: 'Account Manager', label: 'مدير الحساب', full: true }
        ]
      }],
      projects: [{
        route: route,
        sectionId: 'projects',
        entity: 'projects',
        addLabel: 'إضافة مشروع جديد',
        createTitle: 'إضافة مشروع جديد',
        editTitle: 'تعديل المشروع',
        successCreate: 'تمت إضافة المشروع بنجاح.',
        successEdit: 'تم تحديث المشروع.',
        identity: { record: 'Project ID', payload: 'id' },
        fields: [
          { name: 'clientId', key: 'Client ID', label: 'العميل', type: 'select', options: clientOptions, required: true, createOnly: true },
          { name: 'projectName', key: 'Project Name', label: 'اسم المشروع', required: true },
          { name: 'status', key: 'Status', label: 'الحالة', type: 'select', options: projectStatuses, defaultValue: 'DRAFT' },
          { name: 'priority', key: 'Priority', label: 'الأولوية', type: 'select', options: priorities, defaultValue: 'MEDIUM' },
          { name: 'accountManager', key: 'Account Manager', label: 'مدير الحساب' },
          { name: 'budget', key: 'Budget', label: 'الميزانية', type: 'number', min: '0', step: '0.01' },
          { name: 'currency', key: 'Currency', label: 'العملة', defaultValue: 'EGP' },
          { name: 'startDate', key: 'Start Date', label: 'تاريخ البداية', type: 'date' },
          { name: 'dueDate', key: 'Due Date', label: 'تاريخ التسليم', type: 'date' }
        ]
      }],
      ads: [
        {
          route: route,
          sectionId: 'campaigns',
          entity: 'campaigns',
          addLabel: 'إضافة حملة ممولة',
          createTitle: 'إضافة حملة ممولة',
          editTitle: 'تعديل الحملة الممولة',
          successCreate: 'تمت إضافة الحملة الممولة.',
          successEdit: 'تم تحديث الحملة الممولة.',
          identity: { record: 'Campaign ID', payload: 'campaignId' },
          fields: [
            { name: 'clientId', key: 'Client ID', label: 'العميل', type: 'select', options: clientOptions, required: true },
            { name: 'projectId', key: 'Project ID', label: 'المشروع', type: 'select', options: projectOptions },
            { name: 'campaignName', key: 'Campaign Name', label: 'اسم الحملة', required: true },
            { name: 'platform', key: 'Platform', label: 'المنصة', type: 'select', required: true, options: [
              { value: 'META', label: 'Meta' }, { value: 'GOOGLE', label: 'Google' },
              { value: 'TIKTOK', label: 'TikTok' }, { value: 'SNAPCHAT', label: 'Snapchat' },
              { value: 'LINKEDIN', label: 'LinkedIn' }, { value: 'OTHER', label: 'أخرى' }
            ] },
            { name: 'objective', key: 'Objective', label: 'هدف الحملة' },
            { name: 'status', key: 'Status', label: 'الحالة', type: 'select', options: campaignStatuses, defaultValue: 'DRAFT' },
            { name: 'budget', key: 'Budget', label: 'الميزانية', type: 'number', min: '0', step: '0.01' },
            { name: 'currency', key: 'Currency', label: 'العملة', defaultValue: 'EGP' },
            { name: 'startDate', key: 'Start Date', label: 'تاريخ البداية', type: 'date' },
            { name: 'endDate', key: 'End Date', label: 'تاريخ النهاية', type: 'date' },
            { name: 'accountManager', key: 'Account Manager', label: 'مدير الحساب', full: true }
          ]
        },
        {
          route: route,
          sectionId: 'paidAds',
          entity: 'adPayments',
          addLabel: 'تسجيل إنفاق إعلاني',
          createTitle: 'تسجيل إنفاق إعلاني',
          editTitle: 'تعديل سجل الإنفاق',
          successCreate: 'تم تسجيل الإنفاق الإعلاني.',
          successEdit: 'تم تحديث سجل الإنفاق.',
          identity: { record: 'Ad Payment ID', payload: 'adPaymentId' },
          fields: [
            { name: 'campaignId', key: 'Campaign ID', label: 'الحملة', type: 'select', options: campaignOptions, required: true },
            { name: 'amount', key: 'Amount', label: 'المبلغ', type: 'number', min: '0.01', step: '0.01', required: true },
            { name: 'paymentDate', key: 'Payment Date', label: 'تاريخ الدفع', type: 'date', required: true },
            { name: 'paymentMethod', key: 'Payment Method', label: 'طريقة الدفع', type: 'select', defaultValue: 'BANK_TRANSFER', options: [
              { value: 'BANK_TRANSFER', label: 'تحويل بنكي' }, { value: 'CARD', label: 'بطاقة' },
              { value: 'CASH', label: 'نقدي' }, { value: 'OTHER', label: 'أخرى' }
            ] },
            { name: 'platform', key: 'Platform', label: 'المنصة (اختياري)' },
            { name: 'currency', key: 'Currency', label: 'العملة', defaultValue: 'EGP' },
            { name: 'receiptUrl', key: 'Receipt URL', label: 'رابط الإيصال', type: 'url', full: true },
            { name: 'notes', key: 'Notes', label: 'ملاحظات', type: 'textarea', full: true }
          ]
        }
      ]
    };

    return configs[route] || [];
  }

  function normalizedInputValue(value, type) {
    if (value === null || value === undefined) return '';
    if (type === 'date' && value) return String(value).slice(0, 10);
    return String(value);
  }

  function closeEditor(overlay, escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function openEditor(config, record, context) {
    var ui = context.ui;
    var editing = Boolean(record);
    var overlay = ui.el('div', 'modal-backdrop');
    var dialog = ui.el('section', 'modal-panel');
    var header = ui.el('header', 'modal-head');
    var title = ui.el('h3', '', editing ? config.editTitle : config.createTitle);
    var closeButton = ui.el('button', 'modal-close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'إغلاق');
    header.appendChild(title);
    header.appendChild(closeButton);
    dialog.appendChild(header);

    var form = ui.el('form', 'form-grid modal-form');
    config.fields.forEach(function (field) {
      if (editing && field.createOnly) return;

      var group = ui.el('div', 'field-group' + (field.full ? ' full' : ''));
      var id = 'entity-' + config.entity + '-' + field.name;
      var label = ui.el('label', '', field.label);
      label.htmlFor = id;
      var input;

      if (field.type === 'select') {
        input = ui.el('select', 'field');
        var placeholder = ui.el('option', '', 'اختر');
        placeholder.value = '';
        input.appendChild(placeholder);
        (field.options || []).forEach(function (option) {
          var optionNode = ui.el('option', '', option.label);
          optionNode.value = option.value;
          input.appendChild(optionNode);
        });
      } else if (field.type === 'textarea') {
        input = ui.el('textarea', 'field');
      } else {
        input = ui.el('input', 'field');
        input.type = field.type || 'text';
        if (field.min !== undefined) input.min = field.min;
        if (field.step !== undefined) input.step = field.step;
      }

      input.id = id;
      input.name = field.name;
      input.required = Boolean(field.required);
      input.value = normalizedInputValue(
        editing ? record[field.key] : field.defaultValue,
        field.type
      );
      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    var actions = ui.el('div', 'modal-actions full');
    var cancel = ui.el('button', 'btn btn-ghost', 'إلغاء');
    cancel.type = 'button';
    var save = ui.el('button', 'btn btn-primary', editing ? 'حفظ التعديلات' : 'إضافة');
    save.type = 'submit';
    actions.appendChild(cancel);
    actions.appendChild(save);
    form.appendChild(actions);
    dialog.appendChild(form);
    overlay.appendChild(dialog);
    overlay.setAttribute('role', 'presentation');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    document.body.appendChild(overlay);

    function escapeHandler(event) {
      if (event.key === 'Escape') closeEditor(overlay, escapeHandler);
    }

    closeButton.addEventListener('click', function () {
      closeEditor(overlay, escapeHandler);
    });
    cancel.addEventListener('click', function () {
      closeEditor(overlay, escapeHandler);
    });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeEditor(overlay, escapeHandler);
    });
    document.addEventListener('keydown', escapeHandler);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var payload = {};

      config.fields.forEach(function (field) {
        var input = form.elements[field.name];
        if (!input) return;
        payload[field.name] = field.type === 'number' && input.value !== ''
          ? Number(input.value)
          : String(input.value).trim();
      });

      if (editing && config.identity) {
        payload[config.identity.payload] = record[config.identity.record];
      }

      context.setBusy(save, true);
      try {
        await context.api.request('entity.save', {
          entity: config.entity,
          mode: editing ? 'update' : 'create',
          payload: payload
        });
        closeEditor(overlay, escapeHandler);
        ui.toast(editing ? config.successEdit : config.successCreate);
        context.loadRoute(config.route);
      } catch (error) {
        ui.toast(error.message, true);
      } finally {
        context.setBusy(save, false);
      }
    });

    var firstInput = form.querySelector('.field');
    if (firstInput) window.setTimeout(function () { firstInput.focus(); }, 30);
  }

  function managedCard(section, config, data, context) {
    var options = { wide: true };
    if (config) {
      options.actions = function (record, cell) {
        var edit = context.ui.el('button', 'table-btn', 'تعديل');
        edit.type = 'button';
        edit.addEventListener('click', function () {
          openEditor(config, record, context);
        });
        cell.appendChild(edit);
      };
    }

    return context.ui.card(
      section.label || context.ui.label(section.id),
      section.rows || [],
      options
    );
  }

  function renderManagedModule(container, data, route, context, configs) {
    var ui = context.ui;
    var canCreate = !data.capabilities || data.capabilities.create !== false;
    var canEdit = !data.capabilities || data.capabilities.edit !== false;
    var toolbar = ui.el('div', 'module-toolbar');
    var toolbarCopy = ui.el('div');
    toolbarCopy.appendChild(ui.el('strong', '', 'إدارة ' + context.routeLabel(route)));
    toolbarCopy.appendChild(ui.el(
      'span',
      '',
      canCreate || canEdit
        ? 'أضف السجلات أو عدّلها مباشرة، وسيتم الحفظ في Google Sheets.'
        : 'لديك صلاحية عرض البيانات فقط في هذه الصفحة.'
    ));
    var toolbarActions = ui.el('div', 'module-actions');

    if (canCreate) configs.forEach(function (config) {
      var button = ui.el('button', 'btn btn-primary', '+ ' + config.addLabel);
      button.type = 'button';
      button.addEventListener('click', function () {
        if (
          config.entity === 'projects' &&
          !((data.lookups && data.lookups.clients) || []).length
        ) {
          ui.toast('أضف عميلًا أولًا قبل إنشاء مشروع.', true);
          return;
        }
        if (config.entity === 'campaigns' && !(data.lookups && data.lookups.clients || []).length) {
          ui.toast('أضف عميلًا أولًا قبل إنشاء حملة.', true);
          return;
        }
        if (config.entity === 'adPayments' && !sectionRows(data, 'campaigns').length) {
          ui.toast('أضف حملة ممولة أولًا قبل تسجيل الإنفاق.', true);
          return;
        }
        openEditor(config, null, context);
      });
      toolbarActions.appendChild(button);
    });

    toolbar.appendChild(toolbarCopy);
    toolbar.appendChild(toolbarActions);
    container.appendChild(toolbar);

    var grid = ui.el('div', 'card-grid');
    (data.sections || []).forEach(function (section) {
      var config = configs.filter(function (item) {
        return item.sectionId === section.id;
      })[0];
      grid.appendChild(managedCard(
        section,
        canEdit ? config : null,
        data,
        context
      ));
    });
    container.appendChild(grid);
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

    var configs = editorConfigs(route, data || {});
    if (configs.length) {
      renderManagedModule(container, data || { sections: [] }, route, context, configs);
    } else if (sections.length) {
      container.appendChild(ui.sections(sections));
    } else if (!metrics) {
      container.appendChild(ui.empty('لا توجد بيانات', 'ستظهر بيانات ' + context.routeLabel(route) + ' هنا.'));
    }
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
