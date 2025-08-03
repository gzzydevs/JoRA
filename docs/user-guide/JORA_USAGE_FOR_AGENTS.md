# 🎯 JoRA - Guía para AI Agents (Uso en Proyectos)

## 📋 **¿Qué es JoRA?**

**JoRA** (Just Outstanding Requirements Administration) es un **task manager offline** diseñado para que equipos y AI agents gestionen proyectos de desarrollo de software usando metodología Kanban.

### 🎯 **Propósito Principal**
- **Gestión de tareas** con metodología Kanban (6 estados)
- **Sistema de épicas** para features grandes
- **Releases automatizadas** con versionado semántico
- **100% offline** - no requiere conexión a internet
- **Autotracking** - perfecto para AI agents que necesitan documentar su trabajo

---

## 🏗️ **Estructura del Proyecto con JoRA**

Cuando JoRA se instala en un proyecto, crea esta estructura:

```
mi-proyecto/
├── src/                          # Tu código del proyecto
├── package.json                  # Tu package.json
├── README.md                     # Tu README
└── jora-changelog/              # 📁 JoRA Database (auto-generado)
    ├── current.json             # Lista de tareas activas
    ├── config.json              # Configuración del proyecto
    ├── authors.json             # Autores del equipo
    ├── tags.json                # Tags disponibles
    ├── tasks/                   # 📋 Todas las tareas
    │   ├── task-001-setup-project.json
    │   ├── task-002-add-authentication.json
    │   └── task-xxx-descripcion.json
    ├── epics/                   # 📊 Épicas (features grandes)
    │   ├── authentication.json
    │   ├── user-dashboard.json
    │   └── epic-xxx.json
    └── releases/                # 📦 Releases generadas
        ├── v1.0.0.json
        ├── v1.1.0.json
        └── vX.X.X.json
```

---

## 🎮 **Comandos Básicos para Agentes**

### **Inicializar JoRA en un proyecto**
```bash
# En la carpeta de tu proyecto
jora init
```

### **Acceder a la interfaz web**
```bash
# Iniciar servidor (puerto 3333)
jora start

# Luego abrir: http://localhost:3333
```

### **Estados de tareas disponibles**
```
📋 in_backlog        # Ideas y tareas futuras
📝 todo              # Listo para próximo sprint  
🔄 in_progress       # En desarrollo activo
👀 in_review         # En revisión/testing
✅ ready_to_release  # Listo para release
❌ cancelled         # Cancelado (solo visible en Backlog)
```

---

## 📝 **Cómo crear y gestionar tareas**

### **1. Crear una nueva tarea**

**Via Web UI:**
1. Abrir `http://localhost:3333`
2. Click en el botón "+" (FloatingActionButton)
3. Llenar el formulario de tarea

**Via JSON directo:**
```json
{
  "id": "task-001-setup-authentication",
  "title": "Implementar sistema de autenticación",
  "description": "Crear login/logout con JWT tokens...",
  "state": "todo",
  "priority": "high",
  "type": "feature",
  "epic": null,
  "author": "ai-agent",
  "assignee": "developer-1",
  "estimatedPoints": 8,
  "estimatedDate": "2025-08-15",
  "tags": ["authentication", "security"],
  "subtasks": [
    {
      "id": "subtask-1",
      "text": "Instalar library JWT",
      "completed": false
    },
    {
      "id": "subtask-2", 
      "text": "Crear middleware de auth",
      "completed": false
    }
  ],
  "createdAt": "2025-08-02T10:30:00Z",
  "updatedAt": "2025-08-02T10:30:00Z"
}
```

### **2. Tipos de tareas disponibles**
- `feature` - Nueva funcionalidad
- `bug` - Corrección de errores
- `hotfix` - Corrección urgente
- `improvement` - Mejora de funcionalidad existente
- `refactor` - Refactorización de código
- `test` - Tests y QA
- `documentation` - Documentación
- `chore` - Tareas de mantenimiento
- `poc` - Proof of concept

### **3. Prioridades**
- `critical` - Crítico (bloquea desarrollo)
- `high` - Alto (próximo sprint)
- `medium` - Medio (backlog prioritario)
- `low` - Bajo (backlog futuro)

---

## 🎯 **Workflow recomendado para AI Agents**

### **Pattern típico de trabajo:**

```javascript
// 1. AI Agent recibe request del usuario
"Implementa autenticación con JWT"

// 2. Agent crea tarea en JoRA
const task = {
  id: "task-001-jwt-authentication",
  title: "Implementar autenticación JWT",
  description: "Sistema completo de login/logout...",
  state: "todo",
  type: "feature",
  priority: "high"
};

// 3. Agent mueve tarea a in_progress
task.state = "in_progress";

// 4. Agent implementa código y actualiza subtasks
task.subtasks[0].completed = true;
task.subtasks[1].completed = true;

// 5. Agent mueve a in_review
task.state = "in_review";

// 6. Después de validación, mueve a ready_to_release
task.state = "ready_to_release";
```

### **API Endpoints disponibles:**

```bash
# Gestión de tareas
GET    /api/tasks              # Listar todas las tareas
POST   /api/tasks              # Crear nueva tarea
PUT    /api/tasks/:id          # Actualizar tarea
DELETE /api/tasks/:id          # Eliminar tarea

# Gestión de épicas
GET    /api/epics              # Listar épicas
POST   /api/epics              # Crear épica
PUT    /api/epics/:id          # Actualizar épica

# Sistema de releases
GET    /api/releases           # Listar releases
POST   /api/releases           # Crear nueva release
DELETE /api/releases/:version  # Deshacer release

# Configuración
GET    /api/authors            # Listar autores
GET    /api/tags               # Listar tags disponibles
```

---

## 🔄 **Épicas: Para features grandes**

### **Cuándo crear una épica:**
- Feature que requiere múltiples tareas (>5 tareas)
- Proyecto que toma más de 1 sprint
- Funcionalidad con múltiples componentes

### **Estructura de épica:**
```json
{
  "id": "authentication-system",
  "name": "Sistema de Autenticación",
  "description": "Sistema completo de auth con JWT, roles, etc.",
  "color": "#3b82f6",
  "status": "in_progress",
  "priority": "high",
  "startDate": "2025-08-01",
  "endDate": "2025-08-30"
}
```

### **Asociar tareas a épicas:**
```json
{
  "id": "task-001-jwt-login",
  "title": "Implementar JWT login",
  "epic": "authentication-system",  // ← ID de la épica
  // ... resto de propiedades
}
```

---

## 📦 **Sistema de Releases**

### **Crear una release:**

1. **Via Web UI:**
   - Ir a vista Kanban
   - Click en "Create Release"
   - Seleccionar tareas `ready_to_release`
   - Asignar versión (v1.0.0, v1.1.0, etc.)

2. **Via API:**
```bash
POST /api/releases
{
  "version": "v1.0.0",
  "name": "Initial Release",
  "description": "Primera versión estable",
  "taskIds": ["task-001", "task-002", "task-003"]
}
```

### **Formato de versiones:**
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.1.1` - Patch release (bug fixes)

---

## 🤖 **Guidelines para AI Agents**

### **✅ DO (Recomendado):**

1. **Crear tareas descriptivas**
   - Títulos claros y concisos
   - Descripciones detalladas en markdown
   - Subtareas específicas y accionables

2. **Usar tags apropiados**
   - `frontend`, `backend`, `api`, `ui`, `database`
   - `security`, `performance`, `testing`
   - `breaking-change`, `documentation`

3. **Actualizar estados progresivamente**
   - `todo` → `in_progress` → `in_review` → `ready_to_release`
   - Actualizar `updatedAt` solo con cambios reales

4. **Asociar a épicas cuando corresponda**
   - Features grandes = épica
   - Tareas individuales = sin épica

5. **Estimar puntos realísticamente**
   - 1-3 puntos: Tarea simple (< 4 horas)
   - 5-8 puntos: Tarea compleja (1-2 días)
   - 13+ puntos: Considerar dividir o convertir a épica

### **❌ DON'T (Evitar):**

1. **No crear tareas vagas**
   - ❌ "Mejorar la app"
   - ✅ "Optimizar carga inicial reduciendo bundle size"

2. **No saltar estados**
   - ❌ `todo` → `ready_to_release`
   - ✅ `todo` → `in_progress` → `in_review` → `ready_to_release`

3. **No mezclar features**
   - ❌ Una tarea para "Auth + Dashboard + API"
   - ✅ Tres tareas separadas o una épica

---

## 📊 **Reportes y Métricas**

### **Información disponible:**

- **Progress por épica**: % completado
- **Velocity**: Tareas completadas por periodo
- **Burn-down**: Tareas restantes vs tiempo
- **Breakdown por tipo**: features vs bugs vs improvements

### **Vistas útiles:**

- **Kanban**: Vista principal de flujo de trabajo
- **Backlog**: Todas las tareas sin filtros
- **Épicas**: Vista de features grandes
- **Releases**: Versiones publicadas

---

## 🔧 **Solución de Problemas**

### **"Frontend build not found"**
```bash
# Si usas binarios, asegúrate de tener frontend/ junto al ejecutable
ls -la
# Debe mostrar: jora-linux + frontend/
```

### **"Port 3333 already in use"**
```bash
# Matar proceso existente
lsof -ti:3333 | xargs kill -9
```

### **Tareas no aparecen en Kanban**
- Verificar que el estado sea `todo`, `in_progress`, `in_review`, o `ready_to_release`
- Estados `in_backlog` y `cancelled` solo aparecen en vista Backlog

---

## 💡 **Ejemplos de Uso por AI Agents**

### **Scenario 1: Agent recibe "Add user registration"**

```javascript
// 1. Agent crea tarea
const task = {
  id: "task-002-user-registration",
  title: "Implementar registro de usuarios",
  description: `
  ## Objetivo
  Crear sistema de registro con validación de email
  
  ## Acceptance Criteria
  - [ ] Form de registro con email/password
  - [ ] Validación client-side
  - [ ] Validación server-side
  - [ ] Confirmación por email
  - [ ] Tests unitarios
  `,
  state: "todo",
  type: "feature",
  priority: "high",
  epic: "authentication-system",
  estimatedPoints: 8,
  subtasks: [
    { text: "Crear componente RegistrationForm", completed: false },
    { text: "Implementar validaciones", completed: false },
    { text: "Integrar con API backend", completed: false },
    { text: "Agregar tests", completed: false }
  ]
};

// 2. Agent implementa y actualiza progreso
// ... código implementation ...

// 3. Agent marca subtareas como completadas
task.subtasks[0].completed = true;
task.state = "in_progress";

// 4. Agent finaliza y mueve a review
task.state = "in_review";
```

### **Scenario 2: Agent gestiona una épica completa**

```javascript
// 1. Crear épica
const epic = {
  id: "user-dashboard",
  name: "User Dashboard",
  description: "Dashboard completo para usuarios autenticados",
  status: "planning"
};

// 2. Crear tareas asociadas
const tasks = [
  { id: "task-010-dashboard-layout", epic: "user-dashboard" },
  { id: "task-011-user-profile", epic: "user-dashboard" },
  { id: "task-012-activity-feed", epic: "user-dashboard" },
  { id: "task-013-settings-panel", epic: "user-dashboard" }
];

// 3. Trabajar tareas progresivamente
// 4. Crear release cuando todas estén ready_to_release
```

---

**💡 Tip**: JoRA está diseñado para ser intuitivo. Los AI agents pueden aprender el workflow rápidamente y usarlo para documentar y trackear todo su trabajo de desarrollo.
