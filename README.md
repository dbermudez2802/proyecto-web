# 🧠 PsicoEscuela — Sistema de Gestión Psicológica Estudiantil

**Versión:** 2.0 · **Compatible:** VS Code (Live Server) + Genspark + Netlify + GitHub Pages  
**Desarrollado por:** Sofía Mejía · Daniel Bermúdez · Erika Mariana Muñoz

---

## 📋 Descripción

Sistema web completo para la gestión de casos psicológicos estudiantiles en instituciones educativas colombianas. Incluye módulos para psicólogos (con rol superadmin), un portal separado para padres/acudientes, y análisis con motor de IA local.

---

## 🚀 Inicio Rápido

### VS Code + Live Server (modo local)
1. Abrir la carpeta del proyecto en VS Code
2. Instalar extensión **Live Server** (Ritwick Dey)
3. Click derecho en `index.html` → **"Open with Live Server"**
4. Se abre en `http://localhost:5500`
5. ✅ **No requiere internet** — funciona con datos de demostración embebidos

### Online (Genspark / Netlify / GitHub Pages)
- La app detecta automáticamente si hay API disponible y usa los datos reales

---

## 🔐 Credenciales de Acceso

### Sistema Principal (Psicólogos)
| Campo | Valor |
|-------|-------|
| URL | `index.html` |
| Correo | `daniel@psico.edu` |
| Contraseña | `daniel123` |
| Rol | **Super Admin** |

### Portal de Padres/Acudientes
| Campo | Valor |
|-------|-------|
| URL | `portal-padres.html` |
| Correo | Email del acudiente (ej: `carmen@email.com`) |
| Contraseña | Nombre del estudiante en minúsculas sin tildes (ej: `valentina torres gomez`) |

**Acudientes de prueba disponibles:**
| Acudiente | Correo | Hijo/a | Contraseña |
|-----------|--------|--------|-----------|
| Carmen Torres | carmen@email.com | Valentina Torres Gómez | `valentina torres gomez` |
| Luis Ramírez | luis@email.com | Sebastián Ramírez López | `sebastian ramirez lopez` |
| Ana Ospina | ana@email.com | María Fernanda Ospina | `maria fernanda ospina` |
| Carlos Pérez | carlos@email.com | Juan Esteban Pérez | `juan esteban perez` |
| Rosa Vargas | rosa@email.com | Luisa Camila Vargas | `luisa camila vargas` |

---

## 📁 Estructura de Archivos

```
/
├── index.html              ← Sistema principal (psicólogos)
├── portal-padres.html      ← Portal para padres/acudientes
├── css/
│   └── style.css           ← Diseño completo (variables, layout, componentes)
├── js/
│   └── app.js              ← Lógica principal v2.0 (dual-mode + superadmin)
├── guia-del-codigo.html    ← Guía interactiva del código
└── README.md               ← Esta documentación
```

---

## 🏗️ Arquitectura Dual-Mode (online + offline)

La clave que resuelve el error en VS Code es la **detección automática de modo**:

```
Al iniciar → detectarModo()
    ├── ¿Responde tables/psicologos en < 3 seg?
    │   ├── SÍ → Modo Online (API REST real de Genspark)
    │   └── NO → Modo Offline (localStorage → datos FALLBACK)
    └── Indicador "⚡ Modo local" aparece en el topbar si está offline
```

**En VS Code:** Funciona completamente offline con datos de demostración embebidos directamente en `js/app.js` (objeto `FALLBACK`).  
**En Genspark:** Usa la API REST real (`tables/{tabla}`).

---

## 👨‍⚕️ Sistema de Roles

| Rol | Cuenta | Capacidades |
|-----|--------|-------------|
| `superadmin` | Dr. Daniel Bermúdez | Todo + gestionar psicólogos |
| `psicologo` | Cuentas adicionales | Gestión de estudiantes, casos, citas, etc. |

### Gestión de Psicólogos (solo superadmin)
- El menú **"Psicólogos"** solo aparece para `daniel@psico.edu`
- Desde ahí se pueden agregar nuevos psicólogos con email y contraseña
- No se puede eliminar ni editar la cuenta principal de Daniel

---

## 📊 Módulos del Sistema Principal

| Módulo | Funciones |
|--------|-----------|
| **Dashboard** | KPIs, alertas activas, citas próximas, casos recientes, 2 gráficas |
| **Estudiantes** | CRUD + perfil detallado con historial |
| **Casos** | CRUD + filtros por estado/prioridad |
| **Diagnósticos** | CRUD + CIE-10 + sugerencia de IA |
| **Observaciones** | CRUD + vista por caso |
| **Citas** | CRUD + campos bloqueados en citas completadas |
| **Alertas** | CRUD + marcar como leída + badge contador |
| **Acudientes** | CRUD + vinculación con estudiante |
| **Psicólogos** | Solo superadmin: agregar/editar/eliminar |
| **IA · Reportes** | 6 tipos de análisis: general, alertas, casos, riesgo, citas, personalizado |
| **Estadísticas** | 3 gráficas: citas/mes (línea), casos/estado (barra), alertas/tipo (barra) |

---

## 👨‍👩‍👧 Portal de Padres (`portal-padres.html`)

Página completamente independiente para acudientes:

- **Login:** Email del acudiente + nombre del hijo como contraseña
- **Soporte multi-hijo:** Si el acudiente tiene varios hijos, puede cambiar entre ellos
- **Dashboard del hijo:** Perfil, 4 KPIs, alertas, timeline de citas, casos con barra de progreso
- **Gráfica:** Historial de sesiones por mes (Chart.js)
- **Recomendaciones:** Consejos personalizados según la categoría de los casos
- **Dual-mode:** También funciona en VS Code (mismos datos FALLBACK)

---

## 💾 Modelo de Datos

### Tablas (9 tablas)

| Tabla | Campos principales |
|-------|-------------------|
| `psicologos` | id, nombre, email, password_hash, especialidad, **rol** |
| `estudiantes` | id, nombre, grado, edad, genero, id_acudiente, estado |
| `acudientes` | id, nombre, telefono, email, parentesco, id_estudiante |
| `casos` | id, id_estudiante, id_psicologo, titulo, categoria, prioridad, estado, fecha_inicio |
| `diagnosticos` | id, id_estudiante, id_caso, categoria_cie10, fecha, descripcion, ia_sugerencia |
| `citas` | id, id_estudiante, id_psicologo, id_caso, fecha_hora, duracion_min, tipo, estado, notas |
| `alertas` | id, id_estudiante, id_caso, tipo, nivel, descripcion, leida, ia_generada, fecha |
| `observaciones` | id, id_caso, id_psicologo, tipo, fecha, contenido |
| `reportes` | id, tipo, titulo, contenido, ia_resumen, fecha, id_psicologo |

### Persistencia de datos
- **Online:** API REST `tables/{tabla}` (Genspark platform)
- **Offline (VS Code):** localStorage con prefijo `psico_` → FALLBACK embebido

---

## 🎨 Tecnologías Usadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| HTML5 | — | Estructura semántica |
| CSS3 | — | Variables + Grid + Flexbox + animaciones |
| JavaScript ES6+ | — | Módulos, async/await, AbortSignal |
| Chart.js | 4.4.0 | Gráficas (doughnut, bar, line) |
| Font Awesome | 6.4.0 | Iconografía |
| Google Fonts (Inter) | — | Tipografía |

---

## 🔧 Configuración VS Code

### Extensiones recomendadas
- **Live Server** (Ritwick Dey) — servidor local
- **Prettier** — formateo de código
- **Auto Rename Tag** — HTML tags
- **Color Highlight** — colores CSS

### Pasos de instalación
1. `File > Open Folder` → seleccionar la carpeta del proyecto
2. Instalar Live Server desde Extensions (`Ctrl+Shift+X`)
3. Click derecho en `index.html` → **Open with Live Server**
4. También abrir `portal-padres.html` con Live Server para probar el portal de padres

---

## 🌐 Despliegue

### Netlify (gratis, recomendado para demo)
1. Ir a [netlify.com](https://netlify.com) → crear cuenta gratuita
2. Drag & drop la carpeta del proyecto
3. URL automática: `tu-proyecto.netlify.app`
> ⚠️ En Netlify solo funcionan los datos FALLBACK (modo offline). Para datos reales se necesita el hosting de Genspark.

### GitHub Pages
1. Subir a un repositorio GitHub
2. Settings → Pages → Source: main branch / root
3. URL: `tu-usuario.github.io/nombre-repo`

### Genspark (datos persistentes completos)
- Usar el botón **Publish** en el editor de Genspark
- Todos los módulos funcionan con la API REST real
- Los datos se guardan en la base de datos de la plataforma

---

## 📱 Progressive Web App (PWA)

Para publicar en Play Store como app Android, agregar al `index.html`:

```html
<link rel="manifest" href="manifest.json" />
<meta name="theme-color" content="#4f46e5" />
```

Crear `manifest.json`:
```json
{
  "name": "PsicoEscuela",
  "short_name": "PsicoEscuela",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f1f5f9",
  "theme_color": "#4f46e5",
  "icons": [{ "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

Luego usar **PWABuilder** (pwabuilder.com) para generar el APK.

---

## 🤖 Integración con IA Real (opcional)

Para reemplazar el motor IA local con Gemini o GPT:

```javascript
// En js/app.js, función generarRespuestaIA():
async function generarRespuestaIA(contexto, custom) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=TU_API_KEY', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Analiza estos datos de psicología escolar: ${JSON.stringify(STATE)}` }] }]
    })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

---

## ✅ Funcionalidades Completadas

- [x] Login con rol superadmin (Dr. Daniel Bermúdez)
- [x] Sistema dual-mode: online (API) + offline (VS Code)
- [x] 10 módulos completos con CRUD
- [x] Motor IA local con 6 tipos de análisis
- [x] Gestión de psicólogos (solo superadmin)
- [x] Portal de padres independiente (`portal-padres.html`)
- [x] Diseño responsive (mobile + desktop)
- [x] Citas completadas con campos bloqueados
- [x] Alertas con badge contador
- [x] 6 gráficas con Chart.js
- [x] localStorage como caché offline
- [x] Datos FALLBACK embebidos para VS Code

## 🔮 Próximos Pasos Sugeridos

- [ ] Agregar campo de foto de perfil en estudiantes
- [ ] Notificaciones push para alertas críticas
- [ ] Exportar reportes a PDF (usando jsPDF)
- [ ] Integración con calendario Google
- [ ] Sistema de mensajería entre psicólogo y acudiente
- [ ] Historial de cambios en casos
