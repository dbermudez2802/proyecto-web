/* ============================================================
   PSICO-ESCUELA — app.js  v2.0
   Sistema de Gestión Psicológica Estudiantil
   ============================================================
   COMPATIBILIDAD:
   - Funciona en Genspark / Netlify / GitHub Pages (API REST real)
   - Funciona en VS Code + Live Server (datos locales de respaldo)
   - No requiere backend ni Python para ejecutarse
   ============================================================ */

'use strict';

// ─── Constantes ───────────────────────────────────────────────
const API = 'tables';
const LS_PREFIX = 'psico_';          // prefijo localStorage
const SUPERADMIN_ID = 'psi001';      // ID del super admin (Dr. Daniel)

// ─── Datos de respaldo para VS Code local ────────────────────
// Cuando la API no está disponible (VS Code), se usan estos datos.
const FALLBACK = {
  psicologos: [
    { id:'psi001', nombre:'Dr. Daniel Bermúdez', email:'daniel@psico.edu',
      password_hash:'daniel123', especialidad:'Psicología Educativa', rol:'superadmin' }
  ],
  estudiantes: [
    { id:'est001', nombre:'Valentina Torres Gómez',  grado:'8°A',  edad:14, genero:'Femenino',  id_acudiente:'acu001', estado:'activo' },
    { id:'est002', nombre:'Sebastián Ramírez López',  grado:'10°B', edad:16, genero:'Masculino', id_acudiente:'acu002', estado:'activo' },
    { id:'est003', nombre:'María Fernanda Ospina',    grado:'7°C',  edad:13, genero:'Femenino',  id_acudiente:'acu003', estado:'activo' },
    { id:'est004', nombre:'Juan Esteban Pérez',       grado:'11°A', edad:17, genero:'Masculino', id_acudiente:'acu004', estado:'activo' },
    { id:'est005', nombre:'Luisa Camila Vargas',      grado:'9°B',  edad:15, genero:'Femenino',  id_acudiente:'acu005', estado:'activo' }
  ],
  acudientes: [
    { id:'acu001', nombre:'Carmen Torres',  telefono:'315-234-5678', email:'carmen@email.com', parentesco:'Madre', id_estudiante:'est001' },
    { id:'acu002', nombre:'Luis Ramírez',   telefono:'311-456-7890', email:'luis@email.com',   parentesco:'Padre', id_estudiante:'est002' },
    { id:'acu003', nombre:'Ana Ospina',     telefono:'312-789-0123', email:'ana@email.com',    parentesco:'Madre', id_estudiante:'est003' },
    { id:'acu004', nombre:'Carlos Pérez',   telefono:'313-012-3456', email:'carlos@email.com', parentesco:'Padre', id_estudiante:'est004' },
    { id:'acu005', nombre:'Rosa Vargas',    telefono:'314-345-6789', email:'rosa@email.com',   parentesco:'Madre', id_estudiante:'est005' }
  ],
  casos: [
    { id:'cas001', id_estudiante:'est001', id_psicologo:'psi001', titulo:'Ansiedad ante evaluaciones académicas',
      descripcion:'Episodios de ansiedad antes y durante evaluaciones. Insomnio y pensamientos negativos.',
      fecha_inicio:'2026-02-10', estado:'en_proceso', prioridad:'alta', categoria:'Ansiedad' },
    { id:'cas002', id_estudiante:'est002', id_psicologo:'psi001', titulo:'Conflictos con pares y conducta agresiva',
      descripcion:'Comportamientos agresivos hacia compañeros. 3 reportes el último mes.',
      fecha_inicio:'2026-01-20', estado:'abierto', prioridad:'critica', categoria:'Conducta' },
    { id:'cas003', id_estudiante:'est003', id_psicologo:'psi001', titulo:'Bajo rendimiento y aislamiento',
      descripcion:'Calificaciones en descenso y aislamiento social. Posible depresión leve.',
      fecha_inicio:'2026-03-01', estado:'abierto', prioridad:'media', categoria:'Estado de ánimo' },
    { id:'cas004', id_estudiante:'est004', id_psicologo:'psi001', titulo:'Orientación vocacional - estrés grado 11',
      descripcion:'Presión familiar por elección de carrera. Estrés y confusión vocacional.',
      fecha_inicio:'2026-02-25', estado:'en_proceso', prioridad:'baja', categoria:'Orientación Vocacional' }
  ],
  diagnosticos: [],
  citas: [
    { id:'cit001', id_estudiante:'est001', id_psicologo:'psi001', id_caso:'cas001',
      fecha_hora:'2026-06-05T10:00', duracion_min:45, estado:'programada', notas:'', tipo:'presencial' },
    { id:'cit002', id_estudiante:'est002', id_psicologo:'psi001', id_caso:'cas002',
      fecha_hora:'2026-06-03T14:00', duracion_min:60, estado:'programada', notas:'', tipo:'presencial' },
    { id:'cit003', id_estudiante:'est003', id_psicologo:'psi001', id_caso:'cas003',
      fecha_hora:'2026-06-04T09:00', duracion_min:45, estado:'programada', notas:'', tipo:'virtual' },
    { id:'cit004', id_estudiante:'est001', id_psicologo:'psi001', id_caso:'cas001',
      fecha_hora:'2026-05-22T10:00', duracion_min:45, estado:'completada',
      notas:'Sesión productiva. Técnicas de respiración y manejo del estrés.', tipo:'presencial' }
  ],
  alertas: [
    { id:'alt001', id_estudiante:'est002', id_caso:'cas002', tipo:'riesgo_alto',
      descripcion:'Sebastián tuvo un incidente grave. Requiere atención inmediata.',
      nivel:'critico', leida:false, fecha:'2026-06-01', ia_generada:true },
    { id:'alt002', id_estudiante:'est003', id_caso:'cas003', tipo:'cambio_conducta',
      descripcion:'María lleva 2 semanas sin participar en clase. Patrón de aislamiento.',
      nivel:'advertencia', leida:false, fecha:'2026-06-01', ia_generada:true },
    { id:'alt003', id_estudiante:'est001', id_caso:'cas001', tipo:'ausentismo',
      descripcion:'Valentina ha faltado 3 veces esta semana. Posible evitación por ansiedad.',
      nivel:'advertencia', leida:true, fecha:'2026-05-28', ia_generada:false }
  ],
  observaciones: [],
  reportes: []
};

// ─── Estado global ────────────────────────────────────────────
let STATE = {
  user: null,
  modoOffline: false,   // true cuando la API no responde
  estudiantes: [],
  psicologos: [],
  casos: [],
  diagnosticos: [],
  citas: [],
  alertas: [],
  acudientes: [],
  observaciones: [],
  reportes: [],
  charts: {}
};

// ════════════════════════════════════════════════════════════════
//  CAPA DE DATOS — funciona online y offline
// ════════════════════════════════════════════════════════════════

/** Detecta si hay API disponible haciendo un ping rápido */
async function detectarModo() {
  try {
    const r = await fetch(`${API}/psicologos?limit=1`, { signal: AbortSignal.timeout(3000) });
    STATE.modoOffline = !r.ok;
  } catch {
    STATE.modoOffline = true;
  }
}

/** Lee datos: primero intenta API, si falla usa localStorage + FALLBACK */
async function dbGet(table) {
  if (!STATE.modoOffline) {
    try {
      const r = await fetch(`${API}/${table}?limit=500`);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const data = j.data || j;
      lsSet(table, data);   // cachea localmente
      return data;
    } catch { STATE.modoOffline = true; }
  }
  // Modo offline: localStorage → FALLBACK
  return lsGet(table) || FALLBACK[table] || [];
}

/** Crea un registro */
async function dbPost(table, data) {
  if (!STATE.modoOffline) {
    try {
      const r = await fetch(`${API}/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(r.status);
      const nuevo = await r.json();
      // Sincroniza caché local
      const lista = lsGet(table) || [];
      lista.push(nuevo);
      lsSet(table, lista);
      return nuevo;
    } catch { STATE.modoOffline = true; }
  }
  // Offline: guarda en localStorage
  data.id = data.id || uid();
  data.created_at = Date.now();
  data.updated_at = Date.now();
  const lista = lsGet(table) || [];
  lista.push(data);
  lsSet(table, lista);
  return data;
}

/** Actualiza un registro */
async function dbPut(table, record, data) {
  // record es el objeto completo que incluye el id real de la API
  const apiId = record.id;
  if (!STATE.modoOffline) {
    try {
      const r = await fetch(`${API}/${table}/${apiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(r.status);
      const updated = await r.json();
      const lista = lsGet(table) || [];
      const idx = lista.findIndex(x => x.id === apiId);
      if (idx >= 0) lista[idx] = { ...lista[idx], ...updated };
      lsSet(table, lista);
      return updated;
    } catch { STATE.modoOffline = true; }
  }
  // Offline
  const lista = lsGet(table) || [];
  const idx = lista.findIndex(x => x.id === apiId);
  if (idx >= 0) lista[idx] = { ...lista[idx], ...data, updated_at: Date.now() };
  lsSet(table, lista);
  return lista[idx] || data;
}

/** Elimina un registro */
async function dbDelete(table, record) {
  const apiId = record.id;
  if (!STATE.modoOffline) {
    try {
      const r = await fetch(`${API}/${table}/${apiId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(r.status);
      const lista = (lsGet(table) || []).filter(x => x.id !== apiId);
      lsSet(table, lista);
      return;
    } catch { STATE.modoOffline = true; }
  }
  // Offline
  const lista = (lsGet(table) || []).filter(x => x.id !== apiId);
  lsSet(table, lista);
}

// ─── localStorage helpers ─────────────────────────────────────
function lsSet(key, val) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch {}
}
function lsGet(key) {
  try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : null; } catch { return null; }
}

// ════════════════════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════════════════════

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function fmtDate(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }); }
  catch { return str; }
}
function fmtDateTime(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('es-CO',{ day:'2-digit', month:'short' }) + ' ' +
           d.toLocaleTimeString('es-CO',{ hour:'2-digit', minute:'2-digit' });
  } catch { return str; }
}
function initials(name='') { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }

function toast(msg, type='info') {
  const icons = { success:'fa-check-circle', error:'fa-times-circle',
                  warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||icons.info}" style="color:var(--${type==='info'?'primary':type})"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(()=>{ el.style.animation='toastOut .3s ease forwards'; setTimeout(()=>el.remove(),300); },3500);
}

function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function getEst(id) { return STATE.estudiantes.find(e=>e.id===id)||{}; }
function getPsi(id) { return STATE.psicologos.find(p=>p.id===id)||{}; }
function getCas(id) { return STATE.casos.find(c=>c.id===id)||{}; }

function destroyChart(key) {
  if (STATE.charts[key]) { STATE.charts[key].destroy(); delete STATE.charts[key]; }
}

function esSuperAdmin() { return STATE.user?.rol === 'superadmin'; }

// ════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
  errEl.style.display = 'none';

  try {
    await detectarModo();               // ¿hay API?
    const psis = await dbGet('psicologos');
    STATE.psicologos = psis;

    const user = psis.find(p => p.email === email && p.password_hash === pass);
    if (!user) {
      errEl.innerHTML = '❌ Correo o contraseña incorrectos.<br><small>Cuenta admin: <b>daniel@psico.edu</b> / <b>daniel123</b></small>';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Ingresar al sistema';
      return;
    }
    STATE.user = user;
    localStorage.setItem('psico_session', JSON.stringify({ id: user.id, email: user.email, rol: user.rol }));
    iniciarApp();
  } catch (err) {
    errEl.textContent = 'Error inesperado: ' + err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Ingresar al sistema';
  }
});

// ─── Mostrar modo offline en login ───────────────────────────
async function mostrarModoOffline() {
  await detectarModo();
  if (STATE.modoOffline) {
    const hint = document.getElementById('demo-hint-text');
    if (hint) hint.innerHTML = '⚡ Modo local (VS Code): <b>daniel@psico.edu</b> / <b>daniel123</b>';
  }
}
mostrarModoOffline();

// ════════════════════════════════════════════════════════════════
//  INICIAR APP
// ════════════════════════════════════════════════════════════════

function iniciarApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').classList.add('active');

  const u = STATE.user;
  document.getElementById('nav-user-name').textContent  = u.nombre;
  document.getElementById('nav-user-role').textContent  = u.especialidad || u.rol;
  document.getElementById('nav-user-avatar').textContent= initials(u.nombre);
  document.getElementById('topbar-avatar').textContent  = initials(u.nombre);

  // Mostrar/ocultar menú de Psicólogos según rol
  const menuPsi = document.getElementById('nav-psicologos');
  if (menuPsi) menuPsi.style.display = esSuperAdmin() ? 'flex' : 'none';

  // Indicador de modo offline en topbar
  if (STATE.modoOffline) {
    const badge = document.createElement('span');
    badge.style.cssText = 'background:#fef3c7;color:#92400e;font-size:.68rem;font-weight:700;padding:.2rem .5rem;border-radius:99px;';
    badge.textContent = '⚡ Modo local';
    document.querySelector('.topbar-actions').prepend(badge);
  }

  cargarTodosLosDatos();
}

// ════════════════════════════════════════════════════════════════
//  CARGA INICIAL
// ════════════════════════════════════════════════════════════════

async function cargarTodosLosDatos() {
  try {
    const [est, psi, cas, diag, citas, alertas, acu, obs, rep] = await Promise.all([
      dbGet('estudiantes'), dbGet('psicologos'), dbGet('casos'),
      dbGet('diagnosticos'), dbGet('citas'), dbGet('alertas'),
      dbGet('acudientes'), dbGet('observaciones'), dbGet('reportes')
    ]);
    STATE.estudiantes   = est;
    STATE.psicologos    = psi;
    STATE.casos         = cas;
    STATE.diagnosticos  = diag;
    STATE.citas         = citas;
    STATE.alertas       = alertas;
    STATE.acudientes    = acu;
    STATE.observaciones = obs;
    STATE.reportes      = rep;

    renderDashboard();
    renderEstudiantes();
    renderCasos();
    renderDiagnosticos();
    renderCitas();
    renderAlertas();
    renderAcudientes();
    renderObservaciones();
    renderReportes();
    renderPsicologos();
    actualizarBadgeAlertas();
  } catch (err) {
    toast('Error cargando datos: ' + err.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════════════════════════

const pageNames = {
  dashboard:'Dashboard', estudiantes:'Estudiantes', casos:'Casos Psicológicos',
  diagnosticos:'Diagnósticos', observaciones:'Observaciones', citas:'Citas',
  alertas:'Alertas', acudientes:'Acudientes', reportes:'IA · Reportes',
  estadisticas:'Estadísticas', psicologos:'Gestión de Psicólogos'
};

function goToPage(page) {
  document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById('page-'+page);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item[data-page]').forEach(n=>n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('topbar-title').textContent = pageNames[page]||page;
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  if (page==='estadisticas') renderEstadisticas();
  if (page==='dashboard')    renderDashboard();
}

document.querySelectorAll('.nav-item[data-page]').forEach(item=>{
  item.addEventListener('click',()=>goToPage(item.dataset.page));
});
document.getElementById('menu-btn').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
});
document.getElementById('sidebar-overlay').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('active');
});
document.getElementById('notif-btn').addEventListener('click',()=>goToPage('alertas'));
document.getElementById('logout-btn').addEventListener('click',()=>{
  STATE.user = null;
  localStorage.removeItem('psico_session');
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-page').style.display='flex';
  toast('Sesión cerrada','info');
});

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════

function renderDashboard() {
  const alertasNoLeidas = STATE.alertas.filter(a=>!a.leida).length;
  const casosAbiertos   = STATE.casos.filter(c=>c.estado!=='cerrado').length;
  const citasProg       = STATE.citas.filter(c=>c.estado==='programada').length;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card primary">
      <div class="stat-icon primary"><i class="fas fa-user-graduate"></i></div>
      <div class="stat-value">${STATE.estudiantes.length}</div>
      <div class="stat-label">Estudiantes</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-icon warning"><i class="fas fa-folder-open"></i></div>
      <div class="stat-value">${casosAbiertos}</div>
      <div class="stat-label">Casos activos</div>
    </div>
    <div class="stat-card danger">
      <div class="stat-icon danger"><i class="fas fa-bell"></i></div>
      <div class="stat-value">${alertasNoLeidas}</div>
      <div class="stat-label">Alertas sin leer</div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon success"><i class="fas fa-calendar-check"></i></div>
      <div class="stat-value">${citasProg}</div>
      <div class="stat-label">Citas programadas</div>
    </div>
    <div class="stat-card info">
      <div class="stat-icon info"><i class="fas fa-stethoscope"></i></div>
      <div class="stat-value">${STATE.diagnosticos.length}</div>
      <div class="stat-label">Diagnósticos</div>
    </div>`;

  // Alertas en dash
  const altEl = document.getElementById('dash-alertas');
  const alts  = STATE.alertas.filter(a=>!a.leida).slice(0,4);
  altEl.innerHTML = alts.length===0
    ? `<div class="empty-state" style="padding:1.5rem"><i class="fas fa-check-circle" style="font-size:2rem;color:var(--success);display:block;margin-bottom:.5rem"></i><p>Sin alertas pendientes 🎉</p></div>`
    : alts.map(alertCardHTML).join('');

  // Citas en dash
  const citEl = document.getElementById('dash-citas');
  const cits  = STATE.citas.filter(c=>c.estado==='programada').slice(0,4);
  citEl.innerHTML = cits.length===0
    ? `<div class="empty-state" style="padding:1.5rem"><p>No hay citas próximas.</p></div>`
    : `<div class="timeline">${cits.map(c=>{
        const est=getEst(c.id_estudiante);
        return `<div class="timeline-item">
          <div class="timeline-dot primary"><i class="fas fa-calendar"></i></div>
          <div class="timeline-body">
            <div class="timeline-title">${est.nombre||'Estudiante'}</div>
            <div class="timeline-meta">${fmtDateTime(c.fecha_hora)} · ${c.duracion_min} min · ${c.tipo}</div>
          </div></div>`;
      }).join('')}</div>`;

  // Tabla casos recientes
  const tbody = document.getElementById('dash-casos-tbody');
  tbody.innerHTML = [...STATE.casos].reverse().slice(0,6).map(c=>{
    const est=getEst(c.id_estudiante);
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(est.nombre||'?')}</div>
        <div><div class="td-name">${est.nombre||'N/D'}</div><div class="td-sub">${est.grado||''}</div></div>
      </div></td>
      <td>${c.titulo}</td>
      <td>${c.categoria||'—'}</td>
      <td><span class="badge priority-${c.prioridad}">${c.prioridad}</span></td>
      <td><span class="badge status-${c.estado}">${c.estado?.replace('_',' ')}</span></td>
      <td>${fmtDate(c.fecha_inicio)}</td>
      <td><button class="btn btn-sm btn-ghost" onclick="editarCaso('${c.id}')"><i class="fas fa-eye"></i></button></td>
    </tr>`;
  }).join('')||'<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">Sin casos.</td></tr>';

  renderChartCategorias();
  renderChartPrioridades();
}

function renderChartCategorias() {
  destroyChart('cat');
  const cats={};
  STATE.casos.forEach(c=>{ cats[c.categoria||'Sin cat.']=(cats[c.categoria||'Sin cat.']||0)+1; });
  const ctx=document.getElementById('chart-cat');
  if(!ctx||!Object.keys(cats).length) return;
  STATE.charts['cat']=new Chart(ctx,{
    type:'doughnut',
    data:{ labels:Object.keys(cats), datasets:[{data:Object.values(cats),
      backgroundColor:['#4f46e5','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899'],
      borderWidth:2,borderColor:'#fff'}]},
    options:{ responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{font:{size:11}}}} }
  });
}
function renderChartPrioridades() {
  destroyChart('prio');
  const p={baja:0,media:0,alta:0,critica:0};
  STATE.casos.forEach(c=>{ if(p[c.prioridad]!==undefined) p[c.prioridad]++; });
  const ctx=document.getElementById('chart-prio');
  if(!ctx) return;
  STATE.charts['prio']=new Chart(ctx,{
    type:'bar',
    data:{ labels:['Baja','Media','Alta','Crítica'],
      datasets:[{label:'Casos',data:Object.values(p),
        backgroundColor:['#d1fae5','#dbeafe','#fef3c7','#fee2e2'],
        borderColor:['#10b981','#3b82f6','#f59e0b','#ef4444'],
        borderWidth:2,borderRadius:6}]},
    options:{ responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}}} }
  });
}

// ════════════════════════════════════════════════════════════════
//  PSICÓLOGOS (solo superadmin)
// ════════════════════════════════════════════════════════════════

function renderPsicologos(filter='') {
  if (!esSuperAdmin()) return;
  const tbody = document.getElementById('psi-tbody');
  const empty = document.getElementById('psi-empty');
  if (!tbody) return;

  let lista = STATE.psicologos.filter(p=>
    !filter || (p.nombre+p.email).toLowerCase().includes(filter.toLowerCase())
  );
  if (lista.length===0) { tbody.innerHTML=''; if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';

  tbody.innerHTML = lista.map(p=>{
    const esSA = p.id===SUPERADMIN_ID;
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">${initials(p.nombre)}</div>
        <div><div class="td-name">${p.nombre}</div><div class="td-sub">${p.especialidad||''}</div></div>
      </div></td>
      <td>${p.email}</td>
      <td><span class="badge ${esSA?'badge-primary':'badge-success'}">${esSA?'Super Admin':'Psicólogo'}</span></td>
      <td style="display:flex;gap:.3rem;flex-wrap:wrap">
        ${!esSA ? `
        <button class="btn btn-sm btn-ghost" onclick="editarPsicologo('${p.id}')" title="Editar">
          <i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPsicologo('${p.id}')" title="Eliminar">
          <i class="fas fa-trash"></i></button>` : `<span style="font-size:.78rem;color:var(--text-muted)">Cuenta principal</span>`}
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('psi-search')?.addEventListener('input', e=>renderPsicologos(e.target.value));

async function guardarPsicologo() {
  if (!esSuperAdmin()) { toast('Sin permisos','error'); return; }
  const id         = document.getElementById('psi-id').value;
  const nombre     = document.getElementById('psi-nombre').value.trim();
  const email      = document.getElementById('psi-email').value.trim();
  const pass       = document.getElementById('psi-pass').value;
  const especialidad = document.getElementById('psi-especialidad').value.trim();

  if (!nombre || !email) { toast('Nombre y email son obligatorios','error'); return; }
  if (!id && !pass)       { toast('La contraseña es obligatoria para nuevos psicólogos','error'); return; }

  // Verificar email duplicado
  const dupEmail = STATE.psicologos.find(p=>p.email===email && p.id!==id);
  if (dupEmail) { toast('Ya existe un psicólogo con ese correo','error'); return; }

  const data = { nombre, email, especialidad, rol:'psicologo' };
  if (pass) data.password_hash = pass;
  if (!id) data.id = uid();

  try {
    if (id) {
      const rec = STATE.psicologos.find(p=>p.id===id);
      const updated = await dbPut('psicologos', rec, {...rec,...data});
      const idx = STATE.psicologos.findIndex(p=>p.id===id);
      STATE.psicologos[idx] = {...STATE.psicologos[idx],...data};
      toast('Psicólogo actualizado ✓','success');
    } else {
      const nuevo = await dbPost('psicologos', data);
      STATE.psicologos.push(nuevo);
      toast('Psicólogo registrado ✓','success');
    }
    closeModal('modal-psicologo');
    renderPsicologos();
    limpiarFormPsicologo();
  } catch(err){ toast('Error: '+err.message,'error'); }
}

function editarPsicologo(id) {
  const p = STATE.psicologos.find(p=>p.id===id);
  if (!p || p.id===SUPERADMIN_ID) return;
  document.getElementById('psi-id').value          = p.id;
  document.getElementById('psi-nombre').value       = p.nombre;
  document.getElementById('psi-email').value        = p.email;
  document.getElementById('psi-pass').value         = '';
  document.getElementById('psi-especialidad').value = p.especialidad||'';
  document.getElementById('psi-pass-label').textContent = 'Nueva contraseña (dejar vacío para no cambiar)';
  document.getElementById('modal-psicologo-title').textContent = 'Editar Psicólogo';
  openModal('modal-psicologo');
}

async function eliminarPsicologo(id) {
  if (!esSuperAdmin()) { toast('Sin permisos','error'); return; }
  if (id===SUPERADMIN_ID) { toast('No puedes eliminar la cuenta principal','error'); return; }
  if (!confirm('¿Eliminar este psicólogo? No se podrá recuperar.')) return;
  try {
    const rec = STATE.psicologos.find(p=>p.id===id);
    await dbDelete('psicologos', rec);
    STATE.psicologos = STATE.psicologos.filter(p=>p.id!==id);
    toast('Psicólogo eliminado','warning');
    renderPsicologos();
  } catch(err){ toast('Error: '+err.message,'error'); }
}

function limpiarFormPsicologo() {
  ['psi-id','psi-nombre','psi-email','psi-pass','psi-especialidad'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const lbl=document.getElementById('psi-pass-label');
  if(lbl) lbl.textContent='Contraseña *';
  const title=document.getElementById('modal-psicologo-title');
  if(title) title.textContent='Nuevo Psicólogo';
}

// ════════════════════════════════════════════════════════════════
//  ESTUDIANTES
// ════════════════════════════════════════════════════════════════

function renderEstudiantes(filter='') {
  const tbody=document.getElementById('est-tbody');
  const empty=document.getElementById('est-empty');
  let lista=STATE.estudiantes.filter(e=>
    !filter||(e.nombre+e.grado).toLowerCase().includes(filter.toLowerCase())
  );
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(e=>{
    const nCasos=STATE.casos.filter(c=>c.id_estudiante===e.id).length;
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(e.nombre)}</div>
        <div><div class="td-name">${e.nombre}</div><div class="td-sub">ID: ${e.id}</div></div>
      </div></td>
      <td>${e.grado}</td>
      <td>${e.edad} años</td>
      <td>${e.genero||'—'}</td>
      <td><span class="badge ${e.estado==='activo'?'badge-success':'badge-muted'}">${e.estado}</span></td>
      <td>${nCasos>0?`<span class="badge badge-warning">${nCasos} caso${nCasos>1?'s':''}</span>`:'<span class="badge badge-muted">0</span>'}</td>
      <td style="display:flex;gap:.35rem;flex-wrap:wrap">
        <button class="btn btn-sm btn-info" onclick="verPerfilEstudiante('${e.id}')" title="Ver perfil"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-ghost" onclick="editarEstudiante('${e.id}')" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarEstudiante('${e.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('est-search').addEventListener('input',e=>renderEstudiantes(e.target.value));

async function guardarEstudiante() {
  const id     = document.getElementById('est-id').value;
  const nombre = document.getElementById('est-nombre').value.trim();
  const grado  = document.getElementById('est-grado').value.trim();
  const edad   = parseInt(document.getElementById('est-edad').value)||0;
  const genero = document.getElementById('est-genero').value;
  const estado = document.getElementById('est-estado').value;
  if(!nombre||!grado){toast('Nombre y grado son obligatorios','error');return;}
  const data={id:id||uid(),nombre,grado,edad,genero,estado};
  try {
    if(id){
      const rec=STATE.estudiantes.find(e=>e.id===id);
      await dbPut('estudiantes',rec,{...rec,...data});
      const idx=STATE.estudiantes.findIndex(e=>e.id===id);
      STATE.estudiantes[idx]={...STATE.estudiantes[idx],...data};
      toast('Estudiante actualizado ✓','success');
    } else {
      const nuevo=await dbPost('estudiantes',data);
      STATE.estudiantes.push(nuevo);
      toast('Estudiante registrado ✓','success');
    }
    closeModal('modal-est'); renderEstudiantes(); renderDashboard();
    limpiarFormEstudiante();
  } catch(err){toast('Error: '+err.message,'error');}
}

function limpiarFormEstudiante(){
  ['est-id','est-nombre','est-grado','est-edad'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('modal-est-title').textContent='Nuevo Estudiante';
}

function editarEstudiante(id){
  const e=STATE.estudiantes.find(e=>e.id===id); if(!e) return;
  document.getElementById('est-id').value    =e.id;
  document.getElementById('est-nombre').value=e.nombre;
  document.getElementById('est-grado').value =e.grado;
  document.getElementById('est-edad').value  =e.edad;
  document.getElementById('est-genero').value=e.genero||'Masculino';
  document.getElementById('est-estado').value=e.estado||'activo';
  document.getElementById('modal-est-title').textContent='Editar Estudiante';
  openModal('modal-est');
}

async function eliminarEstudiante(id){
  if(!confirm('¿Eliminar este estudiante?')) return;
  try{
    const rec=STATE.estudiantes.find(e=>e.id===id);
    await dbDelete('estudiantes',rec);
    STATE.estudiantes=STATE.estudiantes.filter(e=>e.id!==id);
    toast('Estudiante eliminado','warning'); renderEstudiantes(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

function verPerfilEstudiante(id){
  const e=STATE.estudiantes.find(e=>e.id===id)||{};
  const acu=STATE.acudientes.find(a=>a.id_estudiante===id)||{};
  const casos=STATE.casos.filter(c=>c.id_estudiante===id);
  const diags=STATE.diagnosticos.filter(d=>d.id_estudiante===id);
  const citas=STATE.citas.filter(c=>c.id_estudiante===id);
  document.getElementById('detalle-est-title').textContent=`Perfil: ${e.nombre}`;
  document.getElementById('modal-est-detalle-body').innerHTML=`
    <div class="student-profile-header">
      <div class="student-big-avatar">${initials(e.nombre)}</div>
      <div class="student-profile-info">
        <h2>${e.nombre}</h2>
        <div class="profile-meta">
          <span class="profile-chip"><i class="fas fa-graduation-cap"></i> ${e.grado}</span>
          <span class="profile-chip"><i class="fas fa-birthday-cake"></i> ${e.edad} años</span>
          <span class="profile-chip"><i class="fas fa-venus-mars"></i> ${e.genero||'—'}</span>
          <span class="profile-chip ${e.estado==='activo'?'badge-success':'badge-muted'}"><i class="fas fa-circle"></i> ${e.estado}</span>
        </div>
        ${acu.nombre?`<div style="margin-top:.75rem;font-size:.85rem;color:var(--text-muted)">
          <i class="fas fa-user-friends"></i> Acudiente: <strong>${acu.nombre}</strong> (${acu.parentesco}) · ${acu.telefono}
        </div>`:''}
      </div>
    </div>
    <div class="stats-grid" style="margin:0 0 1.5rem">
      <div class="stat-card warning"><div class="stat-icon warning"><i class="fas fa-folder"></i></div>
        <div class="stat-value">${casos.length}</div><div class="stat-label">Casos</div></div>
      <div class="stat-card info"><div class="stat-icon info"><i class="fas fa-stethoscope"></i></div>
        <div class="stat-value">${diags.length}</div><div class="stat-label">Diagnósticos</div></div>
      <div class="stat-card primary"><div class="stat-icon primary"><i class="fas fa-calendar"></i></div>
        <div class="stat-value">${citas.length}</div><div class="stat-label">Citas</div></div>
    </div>
    <h4 style="margin-bottom:.75rem;font-size:.9rem">Casos del estudiante</h4>
    ${casos.length===0?'<p style="color:var(--text-muted);font-size:.875rem">Sin casos.</p>':
      casos.map(c=>`
        <div style="display:flex;gap:.75rem;align-items:flex-start;padding:.85rem;
             background:var(--bg);border-radius:var(--radius-sm);margin-bottom:.6rem;border:1px solid var(--border)">
          <span class="badge priority-${c.prioridad}" style="flex-shrink:0">${c.prioridad}</span>
          <div><div style="font-weight:600;font-size:.875rem">${c.titulo}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">${c.categoria} · ${fmtDate(c.fecha_inicio)}</div></div>
          <span class="badge status-${c.estado}" style="margin-left:auto">${c.estado?.replace('_',' ')}</span>
        </div>`).join('')}`;
  openModal('modal-est-detalle');
}

// ════════════════════════════════════════════════════════════════
//  CASOS
// ════════════════════════════════════════════════════════════════

function renderCasos(filter='',fEstado='',fPrio=''){
  const tbody=document.getElementById('cas-tbody');
  const empty=document.getElementById('cas-empty');
  let lista=STATE.casos.filter(c=>{
    const txt=(c.titulo+(c.categoria||'')+(c.descripcion||'')).toLowerCase();
    return (!filter||txt.includes(filter.toLowerCase()))&&
           (!fEstado||c.estado===fEstado)&&(!fPrio||c.prioridad===fPrio);
  });
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(c=>{
    const est=getEst(c.id_estudiante); const psi=getPsi(c.id_psicologo);
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(est.nombre||'?')}</div>
        <div><div class="td-name">${est.nombre||'N/D'}</div><div class="td-sub">${est.grado||''}</div></div>
      </div></td>
      <td style="max-width:200px"><div style="font-weight:600;font-size:.875rem">${c.titulo}</div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px">${c.descripcion?.slice(0,60)||''}…</div>
      </td>
      <td>${c.categoria||'—'}</td>
      <td><span class="badge priority-${c.prioridad}">${c.prioridad}</span></td>
      <td><span class="badge status-${c.estado}">${c.estado?.replace('_',' ')}</span></td>
      <td>${psi.nombre||'—'}</td>
      <td>${fmtDate(c.fecha_inicio)}</td>
      <td style="display:flex;gap:.3rem;flex-wrap:wrap">
        <button class="btn btn-sm btn-ghost" onclick="editarCaso('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarCaso('${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('cas-search').addEventListener('input',e=>{
  renderCasos(e.target.value,document.getElementById('cas-filter-estado').value,document.getElementById('cas-filter-prio').value);
});
document.getElementById('cas-filter-estado').addEventListener('change',e=>{
  renderCasos(document.getElementById('cas-search').value,e.target.value,document.getElementById('cas-filter-prio').value);
});
document.getElementById('cas-filter-prio').addEventListener('change',e=>{
  renderCasos(document.getElementById('cas-search').value,document.getElementById('cas-filter-estado').value,e.target.value);
});

function llenarSelectEstudiantes(selectId){
  const sel=document.getElementById(selectId);
  if(!sel) return;
  sel.innerHTML='<option value="">— Selecciona estudiante —</option>'+
    STATE.estudiantes.map(e=>`<option value="${e.id}">${e.nombre} (${e.grado})</option>`).join('');
}
function llenarSelectPsicologos(selectId){
  const sel=document.getElementById(selectId);
  if(!sel) return;
  sel.innerHTML=STATE.psicologos.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('');
}
function llenarSelectCasos(selectId,id_estudiante=''){
  const sel=document.getElementById(selectId); if(!sel) return;
  const lista=id_estudiante?STATE.casos.filter(c=>c.id_estudiante===id_estudiante):STATE.casos;
  sel.innerHTML='<option value="">Sin caso</option>'+
    lista.map(c=>`<option value="${c.id}">${c.titulo}</option>`).join('');
}

async function guardarCaso(){
  const id=document.getElementById('caso-id').value;
  const id_est=document.getElementById('caso-estudiante').value;
  const id_psi=document.getElementById('caso-psicologo').value;
  const titulo=document.getElementById('caso-titulo').value.trim();
  const categoria=document.getElementById('caso-categoria').value;
  const prioridad=document.getElementById('caso-prioridad').value;
  const estado=document.getElementById('caso-estado').value;
  const fecha=document.getElementById('caso-fecha').value;
  const descripcion=document.getElementById('caso-desc').value.trim();
  if(!id_est||!titulo){toast('Estudiante y título son obligatorios','error');return;}
  const data={id:id||uid(),id_estudiante:id_est,id_psicologo:id_psi,
              titulo,categoria,prioridad,estado,fecha_inicio:fecha,descripcion};
  try{
    if(id){
      const rec=STATE.casos.find(c=>c.id===id);
      await dbPut('casos',rec,{...rec,...data});
      const idx=STATE.casos.findIndex(c=>c.id===id);
      STATE.casos[idx]={...STATE.casos[idx],...data};
      toast('Caso actualizado ✓','success');
    }else{
      const nuevo=await dbPost('casos',data);
      STATE.casos.push(nuevo);
      toast('Caso registrado ✓','success');
    }
    closeModal('modal-caso'); renderCasos(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

function editarCaso(id){
  const c=STATE.casos.find(c=>c.id===id); if(!c) return;
  llenarSelectEstudiantes('caso-estudiante'); llenarSelectPsicologos('caso-psicologo');
  document.getElementById('caso-id').value        =c.id;
  document.getElementById('caso-estudiante').value=c.id_estudiante;
  document.getElementById('caso-psicologo').value =c.id_psicologo;
  document.getElementById('caso-titulo').value    =c.titulo;
  document.getElementById('caso-categoria').value =c.categoria;
  document.getElementById('caso-prioridad').value =c.prioridad;
  document.getElementById('caso-estado').value    =c.estado;
  document.getElementById('caso-fecha').value     =c.fecha_inicio;
  document.getElementById('caso-desc').value      =c.descripcion;
  document.getElementById('modal-caso-title').textContent='Editar Caso';
  openModal('modal-caso');
}

async function eliminarCaso(id){
  if(!confirm('¿Eliminar este caso?')) return;
  try{
    const rec=STATE.casos.find(c=>c.id===id);
    await dbDelete('casos',rec);
    STATE.casos=STATE.casos.filter(c=>c.id!==id);
    toast('Caso eliminado','warning'); renderCasos(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  DIAGNÓSTICOS
// ════════════════════════════════════════════════════════════════

function renderDiagnosticos(filter=''){
  const tbody=document.getElementById('diag-tbody'); const empty=document.getElementById('diag-empty');
  let lista=STATE.diagnosticos.filter(d=>!filter||(d.descripcion||'').toLowerCase().includes(filter.toLowerCase()));
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(d=>{
    const est=getEst(d.id_estudiante); const psi=getPsi(d.id_psicologo);
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(est.nombre||'?')}</div>
        <div><div class="td-name">${est.nombre||'N/D'}</div><div class="td-sub">${est.grado||''}</div></div>
      </div></td>
      <td style="max-width:220px"><div style="font-size:.875rem;font-weight:500">${d.descripcion?.slice(0,70)||'—'}…</div></td>
      <td>${d.categoria_cie10||'—'}</td>
      <td>${psi.nombre||'—'}</td>
      <td>${fmtDate(d.fecha)}</td>
      <td>${d.ia_sugerencia?'<span class="ia-badge">IA</span>':'—'}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-sm btn-ghost" onclick="editarDiagnostico('${d.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarDiagnostico('${d.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('diag-search').addEventListener('input',e=>renderDiagnosticos(e.target.value));

async function guardarDiagnostico(){
  const id=document.getElementById('diag-id').value;
  const id_est=document.getElementById('diag-estudiante').value;
  const id_cas=document.getElementById('diag-caso').value;
  const cie10=document.getElementById('diag-cie10').value.trim();
  const fecha=document.getElementById('diag-fecha').value;
  const desc=document.getElementById('diag-desc').value.trim();
  const reco=document.getElementById('diag-reco').value.trim();
  const iaText=document.getElementById('diag-ia-result').textContent;
  if(!id_est||!desc){toast('Estudiante y descripción son obligatorios','error');return;}
  const data={id:id||uid(),id_estudiante:id_est,id_caso:id_cas,
              id_psicologo:STATE.user?.id||'psi001',
              categoria_cie10:cie10,fecha,descripcion:desc,recomendaciones:reco,ia_sugerencia:iaText||''};
  try{
    if(id){
      const rec=STATE.diagnosticos.find(d=>d.id===id);
      await dbPut('diagnosticos',rec,{...rec,...data});
      const idx=STATE.diagnosticos.findIndex(d=>d.id===id);
      STATE.diagnosticos[idx]={...STATE.diagnosticos[idx],...data};
      toast('Diagnóstico actualizado ✓','success');
    }else{
      const nuevo=await dbPost('diagnosticos',data);
      STATE.diagnosticos.push(nuevo);
      toast('Diagnóstico guardado ✓','success');
    }
    closeModal('modal-diag'); renderDiagnosticos();
    document.getElementById('diag-ia-result').textContent='';
    document.getElementById('diag-ia-result').style.display='none';
  }catch(err){toast('Error: '+err.message,'error');}
}

function editarDiagnostico(id){
  const d=STATE.diagnosticos.find(d=>d.id===id); if(!d) return;
  llenarSelectEstudiantes('diag-estudiante'); llenarSelectCasos('diag-caso',d.id_estudiante);
  document.getElementById('diag-id').value        =d.id;
  document.getElementById('diag-estudiante').value=d.id_estudiante;
  document.getElementById('diag-caso').value      =d.id_caso||'';
  document.getElementById('diag-cie10').value     =d.categoria_cie10||'';
  document.getElementById('diag-fecha').value     =d.fecha||'';
  document.getElementById('diag-desc').value      =d.descripcion||'';
  document.getElementById('diag-reco').value      =d.recomendaciones||'';
  document.getElementById('modal-diag-title').textContent='Editar Diagnóstico';
  openModal('modal-diag');
}

async function eliminarDiagnostico(id){
  if(!confirm('¿Eliminar este diagnóstico?')) return;
  try{
    const rec=STATE.diagnosticos.find(d=>d.id===id);
    await dbDelete('diagnosticos',rec);
    STATE.diagnosticos=STATE.diagnosticos.filter(d=>d.id!==id);
    toast('Diagnóstico eliminado','warning'); renderDiagnosticos();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  CITAS
// ════════════════════════════════════════════════════════════════

function renderCitas(filter='',fEstado=''){
  const tbody=document.getElementById('cit-tbody'); const empty=document.getElementById('cit-empty');
  let lista=STATE.citas.filter(c=>{
    const est=getEst(c.id_estudiante);
    return (!filter||(est.nombre||'').toLowerCase().includes(filter.toLowerCase()))&&
           (!fEstado||c.estado===fEstado);
  }).sort((a,b)=>new Date(b.fecha_hora)-new Date(a.fecha_hora));
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(c=>{
    const est=getEst(c.id_estudiante); const psi=getPsi(c.id_psicologo);
    const completada=c.estado==='completada';
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(est.nombre||'?')}</div>
        <div><div class="td-name">${est.nombre||'N/D'}</div><div class="td-sub">${est.grado||''}</div></div>
      </div></td>
      <td>${fmtDateTime(c.fecha_hora)}</td>
      <td><span class="badge ${c.tipo==='virtual'?'badge-info':'badge-primary'}">${c.tipo}</span></td>
      <td>${c.duracion_min} min</td>
      <td><span class="badge status-${c.estado}">${c.estado}</span></td>
      <td>${psi.nombre||'—'}</td>
      <td style="display:flex;gap:.3rem;flex-wrap:wrap">
        <button class="btn btn-sm btn-ghost" onclick="editarCita('${c.id}')" title="${completada?'Ver/editar notas':'Editar'}">
          <i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarCita('${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('cit-search').addEventListener('input',e=>{
  renderCitas(e.target.value,document.getElementById('cit-filter-estado').value);
});
document.getElementById('cit-filter-estado').addEventListener('change',e=>{
  renderCitas(document.getElementById('cit-search').value,e.target.value);
});

async function guardarCita(){
  const id=document.getElementById('cita-id').value;
  const estado=document.getElementById('cita-estado').value;
  const notas=document.getElementById('cita-notas').value.trim();
  const citaOriginal=id?STATE.citas.find(c=>c.id===id):null;
  const completada=citaOriginal?.estado==='completada';
  const id_est=completada?citaOriginal.id_estudiante:document.getElementById('cita-estudiante').value;
  const id_psi=document.getElementById('cita-psicologo').value;
  const fecha=completada?citaOriginal.fecha_hora:document.getElementById('cita-fecha').value;
  const dur=completada?citaOriginal.duracion_min:parseInt(document.getElementById('cita-duracion').value)||45;
  const tipo=completada?citaOriginal.tipo:document.getElementById('cita-tipo').value;
  if(!id_est||!fecha){toast('Estudiante y fecha son obligatorios','error');return;}
  const data={id:id||uid(),id_estudiante:id_est,id_psicologo:id_psi,
              fecha_hora:fecha,duracion_min:dur,tipo,estado,notas};
  try{
    if(id){
      const rec=STATE.citas.find(c=>c.id===id);
      await dbPut('citas',rec,{...rec,...data});
      const idx=STATE.citas.findIndex(c=>c.id===id);
      STATE.citas[idx]={...STATE.citas[idx],...data};
      toast('Cita actualizada ✓','success');
    }else{
      const nuevo=await dbPost('citas',data);
      STATE.citas.push(nuevo);
      toast('Cita agendada ✓','success');
    }
    closeModal('modal-cita'); renderCitas(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

function editarCita(id){
  const c=STATE.citas.find(c=>c.id===id); if(!c) return;
  const completada=c.estado==='completada';
  llenarSelectEstudiantes('cita-estudiante'); llenarSelectPsicologos('cita-psicologo');
  document.getElementById('cita-id').value        =c.id;
  document.getElementById('cita-estudiante').value=c.id_estudiante;
  document.getElementById('cita-psicologo').value =c.id_psicologo;
  document.getElementById('cita-fecha').value     =c.fecha_hora;
  document.getElementById('cita-duracion').value  =c.duracion_min;
  document.getElementById('cita-tipo').value      =c.tipo;
  document.getElementById('cita-estado').value    =c.estado;
  document.getElementById('cita-notas').value     =c.notas||'';
  ['cita-estudiante','cita-fecha','cita-duracion','cita-tipo'].forEach(fid=>{
    const el=document.getElementById(fid);
    el.disabled=completada; el.style.opacity=completada?'.55':'1'; el.style.cursor=completada?'not-allowed':'';
  });
  const infoEl=document.getElementById('cita-completada-info');
  if(infoEl) infoEl.style.display=completada?'flex':'none';
  openModal('modal-cita');
}

async function eliminarCita(id){
  if(!confirm('¿Eliminar esta cita?')) return;
  try{
    const rec=STATE.citas.find(c=>c.id===id);
    await dbDelete('citas',rec);
    STATE.citas=STATE.citas.filter(c=>c.id!==id);
    toast('Cita eliminada','warning'); renderCitas(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  ALERTAS
// ════════════════════════════════════════════════════════════════

function alertCardHTML(a){
  const est=getEst(a.id_estudiante);
  const icons={critico:'🚨',advertencia:'⚠️',info:'ℹ️'};
  return `<div class="alert-card ${a.nivel==='info'?'info-level':a.nivel}" onclick="marcarLeida('${a.id}')">
    <div class="alert-icon">${icons[a.nivel]||'🔔'}</div>
    <div class="alert-body">
      <div class="alert-title">${est.nombre||'Estudiante'}</div>
      <div class="alert-desc">${a.descripcion}</div>
      <div class="alert-meta">${fmtDate(a.fecha)} · ${a.tipo?.replace('_',' ')}
        ${a.ia_generada?'· <span class="ia-badge" style="font-size:.6rem">IA</span>':''}</div>
    </div>
    ${!a.leida?'<div class="alert-unread-dot"></div>':''}
  </div>`;
}

function renderAlertas(filter='',fNivel=''){
  const cont=document.getElementById('alertas-list');
  let lista=STATE.alertas.filter(a=>{
    const est=getEst(a.id_estudiante);
    return (!filter||(est.nombre+a.descripcion).toLowerCase().includes(filter.toLowerCase()))&&
           (!fNivel||a.nivel===fNivel);
  }).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
  if(lista.length===0){
    cont.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="fas fa-bell-slash"></i></div>
      <h4>No hay alertas</h4><p>El sistema no tiene alertas activas.</p></div>`;
    return;
  }
  cont.innerHTML=lista.map(alertCardHTML).join('');
}

document.getElementById('alt-search').addEventListener('input',e=>{
  renderAlertas(e.target.value,document.getElementById('alt-filter-nivel').value);
});
document.getElementById('alt-filter-nivel').addEventListener('change',e=>{
  renderAlertas(document.getElementById('alt-search').value,e.target.value);
});

async function marcarLeida(id){
  const a=STATE.alertas.find(a=>a.id===id); if(!a||a.leida) return;
  try{
    await dbPut('alertas',a,{...a,leida:true}); a.leida=true;
    renderAlertas(); actualizarBadgeAlertas(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

async function marcarTodasLeidas(){
  for(const a of STATE.alertas.filter(a=>!a.leida)){
    try{ await dbPut('alertas',a,{...a,leida:true}); a.leida=true; }catch{}
  }
  renderAlertas(); actualizarBadgeAlertas(); renderDashboard();
  toast('Todas marcadas como leídas ✓','success');
}

function actualizarBadgeAlertas(){
  const n=STATE.alertas.filter(a=>!a.leida).length;
  const badge=document.getElementById('alertas-badge');
  const dot=document.getElementById('notif-dot');
  badge.textContent=n; badge.style.display=n>0?'inline-flex':'none';
  dot.style.display=n>0?'block':'none';
}

async function guardarAlerta(){
  const id=document.getElementById('alerta-id').value;
  const id_est=document.getElementById('alerta-estudiante').value;
  const nivel=document.getElementById('alerta-nivel').value;
  const tipo=document.getElementById('alerta-tipo').value;
  const fecha=document.getElementById('alerta-fecha').value;
  const desc=document.getElementById('alerta-desc').value.trim();
  if(!id_est||!desc){toast('Estudiante y descripción son obligatorios','error');return;}
  const data={id:id||uid(),id_estudiante:id_est,nivel,tipo,fecha,descripcion:desc,leida:false,ia_generada:false};
  try{
    const nuevo=await dbPost('alertas',data);
    STATE.alertas.push(nuevo);
    toast('Alerta creada ✓','success'); closeModal('modal-alerta');
    renderAlertas(); actualizarBadgeAlertas(); renderDashboard();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  ACUDIENTES
// ════════════════════════════════════════════════════════════════

function renderAcudientes(filter=''){
  const tbody=document.getElementById('acu-tbody'); const empty=document.getElementById('acu-empty');
  let lista=STATE.acudientes.filter(a=>!filter||(a.nombre+a.telefono+a.email).toLowerCase().includes(filter.toLowerCase()));
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(a=>{
    const est=getEst(a.id_estudiante);
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(a.nombre)}</div>
        <span class="td-name">${a.nombre}</span>
      </div></td>
      <td>${a.telefono||'—'}</td>
      <td>${a.email||'—'}</td>
      <td>${a.parentesco||'—'}</td>
      <td>${est.nombre||'—'}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-sm btn-ghost" onclick="editarAcudiente('${a.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarAcudiente('${a.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('acu-search').addEventListener('input',e=>renderAcudientes(e.target.value));

async function guardarAcudiente(){
  const id=document.getElementById('acu-id').value;
  const nombre=document.getElementById('acu-nombre').value.trim();
  const telefono=document.getElementById('acu-tel').value.trim();
  const email=document.getElementById('acu-email').value.trim();
  const parentesco=document.getElementById('acu-parentesco').value;
  const id_est=document.getElementById('acu-estudiante').value;
  if(!nombre||!id_est){toast('Nombre y estudiante son obligatorios','error');return;}
  const data={id:id||uid(),nombre,telefono,email,parentesco,id_estudiante:id_est};
  try{
    if(id){
      const rec=STATE.acudientes.find(a=>a.id===id);
      await dbPut('acudientes',rec,{...rec,...data});
      const idx=STATE.acudientes.findIndex(a=>a.id===id);
      STATE.acudientes[idx]={...STATE.acudientes[idx],...data};
      toast('Acudiente actualizado ✓','success');
    }else{
      const nuevo=await dbPost('acudientes',data);
      STATE.acudientes.push(nuevo);
      toast('Acudiente registrado ✓','success');
    }
    closeModal('modal-acu'); renderAcudientes();
  }catch(err){toast('Error: '+err.message,'error');}
}

function editarAcudiente(id){
  const a=STATE.acudientes.find(a=>a.id===id); if(!a) return;
  llenarSelectEstudiantes('acu-estudiante');
  document.getElementById('acu-id').value        =a.id;
  document.getElementById('acu-nombre').value    =a.nombre;
  document.getElementById('acu-tel').value       =a.telefono;
  document.getElementById('acu-email').value     =a.email;
  document.getElementById('acu-parentesco').value=a.parentesco;
  document.getElementById('acu-estudiante').value=a.id_estudiante;
  openModal('modal-acu');
}

async function eliminarAcudiente(id){
  if(!confirm('¿Eliminar este acudiente?')) return;
  try{
    const rec=STATE.acudientes.find(a=>a.id===id);
    await dbDelete('acudientes',rec);
    STATE.acudientes=STATE.acudientes.filter(a=>a.id!==id);
    toast('Acudiente eliminado','warning'); renderAcudientes();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  OBSERVACIONES
// ════════════════════════════════════════════════════════════════

function renderObservaciones(filter=''){
  const tbody=document.getElementById('obs-tbody'); const empty=document.getElementById('obs-empty');
  let lista=STATE.observaciones.filter(o=>!filter||(o.contenido||'').toLowerCase().includes(filter.toLowerCase()));
  if(lista.length===0){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=lista.map(o=>{
    const cas=getCas(o.id_caso); const est=getEst(cas.id_estudiante); const psi=getPsi(o.id_psicologo);
    return `<tr>
      <td><div class="td-avatar">
        <div class="mini-avatar">${initials(est.nombre||'?')}</div>
        <div><div class="td-name">${est.nombre||'Sin estudiante'}</div><div class="td-sub">${est.grado||''}</div></div>
      </div></td>
      <td style="max-width:150px;font-weight:600;font-size:.875rem">${cas.titulo||'Sin caso'}</td>
      <td style="max-width:230px"><div style="font-size:.875rem">${o.contenido?.slice(0,80)||'—'}…</div></td>
      <td><span class="badge badge-primary">${o.tipo}</span></td>
      <td>${psi.nombre||'—'}</td>
      <td>${fmtDate(o.fecha)}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-sm btn-danger" onclick="eliminarObservacion('${o.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('obs-search').addEventListener('input',e=>renderObservaciones(e.target.value));

async function guardarObservacion(){
  const id_caso=document.getElementById('obs-caso').value;
  const tipo=document.getElementById('obs-tipo').value;
  const fecha=document.getElementById('obs-fecha').value;
  const contenido=document.getElementById('obs-contenido').value.trim();
  if(!id_caso||!contenido){toast('Caso y contenido son obligatorios','error');return;}
  const data={id:uid(),id_caso,tipo,fecha,id_psicologo:STATE.user?.id||'psi001',contenido};
  try{
    const nuevo=await dbPost('observaciones',data);
    STATE.observaciones.push(nuevo);
    toast('Observación guardada ✓','success'); closeModal('modal-obs');
    renderObservaciones(); document.getElementById('obs-contenido').value='';
  }catch(err){toast('Error: '+err.message,'error');}
}

async function eliminarObservacion(id){
  if(!confirm('¿Eliminar esta observación?')) return;
  try{
    const rec=STATE.observaciones.find(o=>o.id===id);
    await dbDelete('observaciones',rec);
    STATE.observaciones=STATE.observaciones.filter(o=>o.id!==id);
    toast('Observación eliminada','warning'); renderObservaciones();
  }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  REPORTES / IA
// ════════════════════════════════════════════════════════════════

function renderReportes(){
  const cont=document.getElementById('reportes-list');
  if(STATE.reportes.length===0){
    cont.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="fas fa-file-alt"></i></div>
      <h4>No hay reportes</h4><p>Usa el Asistente IA para generar el primero.</p></div>`;
    return;
  }
  cont.innerHTML=STATE.reportes.map(r=>`
    <div style="padding:.85rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.75rem;background:var(--surface2)">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
        <i class="fas fa-file-alt" style="color:var(--success)"></i>
        <strong style="font-size:.875rem">${r.titulo}</strong>
        <span class="badge badge-muted" style="margin-left:auto">${r.tipo}</span>
      </div>
      <div style="font-size:.78rem;color:var(--text-muted)">${fmtDate(r.fecha)}</div>
      <div style="font-size:.82rem;margin-top:.5rem;color:var(--text)">${(r.ia_resumen||'').slice(0,120)}…</div>
    </div>`).join('');
}

document.getElementById('ia-contexto').addEventListener('change',function(){
  document.getElementById('ia-custom-group').style.display=this.value==='personalizado'?'block':'none';
});

async function generarIAAnalysis(){
  const contexto=document.getElementById('ia-contexto').value;
  const custom=document.getElementById('ia-custom-input').value.trim();
  const btn=document.getElementById('ia-btn');
  const panel=document.getElementById('ia-result');
  const typing=document.getElementById('ia-typing-anim');
  const respEl=document.getElementById('ia-response-text');
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Analizando...';
  panel.style.display='block'; typing.style.display='flex'; respEl.textContent='';
  await new Promise(r=>setTimeout(r,2000));
  const respuesta=generarRespuestaIA(contexto,custom);
  typing.style.display='none'; respEl.textContent=respuesta;
  const rep={id:uid(),tipo:contexto,titulo:`Análisis IA: ${contexto}`,
    contenido:respuesta,ia_resumen:respuesta.slice(0,200),
    fecha:new Date().toISOString().split('T')[0],id_psicologo:STATE.user?.id||'psi001'};
  try{ const nuevo=await dbPost('reportes',rep); STATE.reportes.unshift(nuevo); renderReportes();
    toast('Reporte generado ✓','success'); }catch{}
  btn.disabled=false; btn.innerHTML='<i class="fas fa-magic"></i> Generar análisis con IA';
}

function generarRespuestaIA(contexto,custom){
  const totalEst=STATE.estudiantes.length;
  const casosAb=STATE.casos.filter(c=>c.estado==='abierto').length;
  const casosPro=STATE.casos.filter(c=>c.estado==='en_proceso').length;
  const altCrit=STATE.alertas.filter(a=>a.nivel==='critico'&&!a.leida).length;
  const altAdv=STATE.alertas.filter(a=>a.nivel==='advertencia'&&!a.leida).length;
  const citasProg=STATE.citas.filter(c=>c.estado==='programada').length;
  const riesgo=STATE.estudiantes.map(e=>({e,n:STATE.alertas.filter(a=>a.id_estudiante===e.id&&a.nivel==='critico').length})).sort((a,b)=>b.n-a.n)[0];
  const resps={
    general:`📊 ANÁLISIS GENERAL — ${new Date().toLocaleDateString('es-CO')}\n\n👥 ${totalEst} estudiantes · ${STATE.psicologos.length} psicólogo(s)\n\n📁 CASOS: ${casosAb} abiertos · ${casosPro} en proceso · ${STATE.casos.filter(c=>c.estado==='cerrado').length} cerrados\n\n🔔 ALERTAS: ${altCrit} críticas · ${altAdv} advertencias\n\n📅 Citas próximas: ${citasProg}\n\n💡 RECOMENDACIONES:\n1. ${altCrit>0?`⚠️ ${altCrit} alerta(s) CRÍTICA(S) sin atender. Intervención inmediata.`:'✅ Sin alertas críticas pendientes.'}\n2. ${casosPro>2?`${casosPro} casos en proceso simultáneo. Evaluar carga.`:'Carga de casos normal.'}\n3. Revisión semanal de todos los casos activos.`,
    alertas:`🚨 ANÁLISIS DE ALERTAS\n\nNo leídas: ${STATE.alertas.filter(a=>!a.leida).length}\n🔴 Críticas: ${altCrit}\n🟡 Advertencia: ${altAdv}\n🔵 Informativas: ${STATE.alertas.filter(a=>a.nivel==='info'&&!a.leida).length}\n\nPRIORIDAD:\n${STATE.alertas.filter(a=>a.nivel==='critico'&&!a.leida).map(a=>`→ ${getEst(a.id_estudiante).nombre||'N/D'}: ${a.descripcion?.slice(0,60)}`).join('\n')||'→ Sin alertas críticas.'}\n\n💡 Contactar acudientes en <24h para alertas críticas.`,
    casos:`📁 CASOS ACTIVOS\nAbiertos: ${casosAb} · En proceso: ${casosPro}\n\nPRIORITARIOS:\n${STATE.casos.filter(c=>['alta','critica'].includes(c.prioridad)&&c.estado!=='cerrado').map(c=>`→ [${c.prioridad.toUpperCase()}] ${getEst(c.id_estudiante).nombre||'N/D'}: ${c.titulo}`).join('\n')||'→ Sin casos de alta prioridad.'}\n\n💡 Seguimiento semanal mínimo para prioridad alta/crítica.`,
    riesgo:`⚠️ ESTUDIANTES EN RIESGO\n\n🔴 MAYOR RIESGO:\n${riesgo&&riesgo.n>0?`→ ${riesgo.e.nombre} (${riesgo.e.grado}): ${riesgo.n} alerta(s) crítica(s).`:'→ Sin estudiantes con múltiples alertas críticas.'}\n\nEstudiantes con casos críticos activos: ${STATE.casos.filter(c=>c.prioridad==='critica').length}\n\n💡 Plan: 1) Contactar acudientes. 2) Cita urgente. 3) Coordinar con docentes. 4) Evaluar remisión.`,
    citas:`📅 SEGUIMIENTO DE CITAS\nProgramadas: ${citasProg} · Completadas: ${STATE.citas.filter(c=>c.estado==='completada').length} · Canceladas: ${STATE.citas.filter(c=>c.estado==='cancelada').length}\n\nPRÓXIMAS:\n${STATE.citas.filter(c=>c.estado==='programada').slice(0,5).map(c=>`→ ${getEst(c.id_estudiante).nombre||'N/D'}: ${fmtDateTime(c.fecha_hora)} (${c.tipo}, ${c.duracion_min}min)`).join('\n')||'→ Sin citas programadas.'}\n\n💡 Preparar expedientes con anticipación.`,
    personalizado:`🤖 ANÁLISIS PERSONALIZADO\nConsulta: "${custom||'No especificada'}"\n\nDatos actuales: ${totalEst} estudiantes · ${STATE.casos.length} casos · ${STATE.alertas.length} alertas\n\nCategoría más frecuente: ${(()=>{const cats={};STATE.casos.forEach(c=>{cats[c.categoria||'Sin cat.']=(cats[c.categoria||'Sin cat.']||0)+1;});return Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0]||'N/A';})()}\n\nNivel de alerta: ${altCrit>0?'CRÍTICO - atención inmediata':altAdv>0?'ADVERTENCIA - monitorear':'Normal'}\n\n💡 Mantener actualizado el registro de observaciones post-sesión.`
  };
  return resps[contexto]||resps.general;
}

async function generarSugerenciaIA(){
  const desc=document.getElementById('diag-desc').value.trim();
  const resEl=document.getElementById('diag-ia-result');
  if(!desc){toast('Escribe primero la descripción del diagnóstico','warning');return;}
  resEl.style.display='block'; resEl.textContent='⏳ Analizando diagnóstico...';
  await new Promise(r=>setTimeout(r,1800));
  resEl.textContent=`🧠 SUGERENCIA DE INTERVENCIÓN (IA)\n\n1. TÉCNICAS RECOMENDADAS:\n   • Terapia Cognitivo-Conductual (TCC)\n   • Mindfulness y regulación emocional\n   • Entrenamiento en habilidades sociales\n\n2. SEGUIMIENTO:\n   • Sesiones semanales de 45-60 min\n   • Evaluación cada 4 sesiones\n   • Contacto quincenal con acudiente\n\n3. CONSIDERACIONES:\n   • Valorar remisión a psiquiatría si hay componente biológico\n   • Informar a docentes sobre adaptaciones pedagógicas\n\n⚠️ Esta sugerencia es orientativa. El criterio clínico siempre prevalece.`;
}

async function generarReporteGeneral(){
  toast('Generando reporte general...','info');
  await new Promise(r=>setTimeout(r,1500));
  const contenido=generarRespuestaIA('general','');
  const rep={id:uid(),tipo:'mensual',titulo:`Reporte General - ${new Date().toLocaleDateString('es-CO')}`,
    contenido,ia_resumen:contenido.slice(0,200),fecha:new Date().toISOString().split('T')[0],
    id_psicologo:STATE.user?.id||'psi001'};
  try{ const nuevo=await dbPost('reportes',rep); STATE.reportes.unshift(nuevo); renderReportes();
    toast('Reporte generado ✓','success'); }catch(err){toast('Error: '+err.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  ESTADÍSTICAS
// ════════════════════════════════════════════════════════════════

function renderEstadisticas(){
  destroyChart('citas-mes');
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const citasPorMes=new Array(12).fill(0);
  STATE.citas.forEach(c=>{ if(c.fecha_hora){ const m=new Date(c.fecha_hora).getMonth(); citasPorMes[m]++; }});
  const ctx1=document.getElementById('chart-citas-mes');
  if(ctx1) STATE.charts['citas-mes']=new Chart(ctx1,{
    type:'line',
    data:{ labels:meses, datasets:[{label:'Citas',data:citasPorMes,
      borderColor:'#4f46e5',backgroundColor:'rgba(79,70,229,.1)',
      borderWidth:2,fill:true,tension:.4,pointRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
  destroyChart('casos-estado');
  const estados={abierto:0,en_proceso:0,cerrado:0};
  STATE.casos.forEach(c=>{ if(estados[c.estado]!==undefined) estados[c.estado]++; });
  const ctx2=document.getElementById('chart-casos-estado');
  if(ctx2) STATE.charts['casos-estado']=new Chart(ctx2,{
    type:'bar',
    data:{ labels:['Abiertos','En Proceso','Cerrados'],
      datasets:[{label:'Casos',data:Object.values(estados),
        backgroundColor:['#dbeafe','#fef3c7','#d1fae5'],
        borderColor:['#3b82f6','#f59e0b','#10b981'],borderWidth:2,borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
  destroyChart('alertas-tipo');
  const tipos={riesgo_alto:0,ausentismo:0,cambio_conducta:0,otro:0};
  STATE.alertas.forEach(a=>{ if(tipos[a.tipo]!==undefined) tipos[a.tipo]++; else tipos.otro++; });
  const ctx3=document.getElementById('chart-alertas-tipo');
  if(ctx3) STATE.charts['alertas-tipo']=new Chart(ctx3,{
    type:'bar',
    data:{ labels:['Riesgo Alto','Ausentismo','Cambio Conducta','Otro'],
      datasets:[{label:'Alertas',data:Object.values(tipos),
        backgroundColor:['#fee2e2','#fef3c7','#e0e7ff','#f1f5f9'],
        borderColor:['#ef4444','#f59e0b','#4f46e5','#94a3b8'],borderWidth:2,borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

// ════════════════════════════════════════════════════════════════
//  MODAL OBSERVERS — rellena selects al abrir modales
// ════════════════════════════════════════════════════════════════

const modalObserver=new MutationObserver(()=>{
  if(document.getElementById('modal-obs').classList.contains('active')){
    const sel=document.getElementById('obs-caso');
    sel.innerHTML=STATE.casos.map(c=>{
      const est=getEst(c.id_estudiante);
      return `<option value="${c.id}">${c.titulo} – ${est.nombre||'N/D'}</option>`;
    }).join('');
    document.getElementById('obs-fecha').value=new Date().toISOString().split('T')[0];
  }
  if(document.getElementById('modal-cita').classList.contains('active')){
    llenarSelectEstudiantes('cita-estudiante'); llenarSelectPsicologos('cita-psicologo');
    if(!document.getElementById('cita-id').value){
      ['cita-estudiante','cita-fecha','cita-duracion','cita-tipo'].forEach(fid=>{
        const el=document.getElementById(fid); el.disabled=false; el.style.opacity='1'; el.style.cursor='';
      });
      const infoEl=document.getElementById('cita-completada-info');
      if(infoEl) infoEl.style.display='none';
    }
  }
  if(document.getElementById('modal-alerta').classList.contains('active')){
    llenarSelectEstudiantes('alerta-estudiante');
    document.getElementById('alerta-fecha').value=new Date().toISOString().split('T')[0];
  }
  if(document.getElementById('modal-acu').classList.contains('active')) llenarSelectEstudiantes('acu-estudiante');
  if(document.getElementById('modal-caso').classList.contains('active')&&!document.getElementById('caso-id').value){
    llenarSelectEstudiantes('caso-estudiante'); llenarSelectPsicologos('caso-psicologo');
    document.getElementById('caso-fecha').value=new Date().toISOString().split('T')[0];
  }
  if(document.getElementById('modal-diag').classList.contains('active')&&!document.getElementById('diag-id').value){
    llenarSelectEstudiantes('diag-estudiante'); llenarSelectCasos('diag-caso');
    document.getElementById('diag-fecha').value=new Date().toISOString().split('T')[0];
  }
  if(document.getElementById('modal-psicologo')?.classList.contains('active')&&!document.getElementById('psi-id').value){
    limpiarFormPsicologo();
  }
});

document.querySelectorAll('.modal-backdrop').forEach(m=>{
  modalObserver.observe(m,{attributes:true});
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('active'); });
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') document.querySelectorAll('.modal-backdrop.active').forEach(m=>m.classList.remove('active'));
});

// ════════════════════════════════════════════════════════════════
//  VERIFICAR SESIÓN AL CARGAR
// ════════════════════════════════════════════════════════════════

(async function checkSession(){
  const saved=localStorage.getItem('psico_session');
  if(saved){
    try{
      const session=JSON.parse(saved);
      await detectarModo();
      const psis=await dbGet('psicologos');
      STATE.psicologos=psis;
      const user=psis.find(p=>p.id===session.id);
      if(user){ STATE.user=user; iniciarApp(); return; }
    }catch{}
    localStorage.removeItem('psico_session');
  }
})();

console.log('🧠 PsicoEscuela v2.0 — Online + Offline ready');
console.log('👨‍⚕️ Admin: Dr. Daniel Bermúdez · daniel@psico.edu / daniel123');
