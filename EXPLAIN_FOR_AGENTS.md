# 🎯 JoRA - Co### **🔥 ESTADO ACTUAL (Julio 2025)**
- ✅ **React Migration** completada (Task-002)
- ✅ **Convert to Epic Button** implementado y funcional (Task-009)
- ✅ **Cancelled State** implementado con reactivación (Task-020)
- ✅ **Unique ID System** implementado (semantic slugs) (Task-016)
- 🚧 **PKG Distribution + GitHub Actions** - CRITICO para v0.1.0 (Task-006)
- 🔄 **Actualmente**: 22 tareas activas, varias ready_to_release, falta v0.1.0 AI Agent Briefing

## 📋 **Project Overview & Context**

**JoRA** (Just Outstanding Requirements Administration) es un **task manager offline moderno** completamente migrado a **React con arquitectura modular**. Es una aplicación desktop que combina Kanban, épicas, releases y auto-tracking usando su propio sistema.

### 🎯 **Misión Principal: JoRA se trackea a sí mismo**
- **Autotracking completo**: JoRA gestiona su propio desarrollo usando su propio sistema
- **Metodología Kanban** con 6 estados de tareas + estado especial `cancelled`
- **Sistema de épicas** para features grandes con conversión automática
- **Releases automatizadas** con GitHub Actions (en desarrollo)
- **Funciona 100% offline** sin dependencias externas
- **Estado actual**: Versión v0.0.x, trabajando hacia **v0.1.0** (primera release estable)

### 🔥 **ESTADO ACTUAL (Julio 2025)**
- ✅ **React Migration** completada
- ✅ **Convert to Epic Button** implementado y funcional
- ✅ **Cancelled State** implementado con reactivación
- ✅ **Unique ID System** implementado (semantic slugs)
- 🔄 **Actualmente**: 22 tareas activas, varias ready_to_release

---

## 🏗️ **Stack & Arquitectura**

### **Stack Tecnológico**
```
Frontend: React 18 + React Router v6 + SCSS + Vite
Backend: Node.js + Express (REST API)
Database: JSON files (filesystem-based)
Build: Vite + PKG (cross-platform binaries)
Version Control: Git + GitHub Actions
```

### **Arquitectura de Archivos (CRÍTICA PARA AGENTES)**
```
📁 JoRA/
├── 📁 src/
│   ├── 📁 frontend/              # React app modular
│   │   ├── 📁 components/        # Componentes reutilizables
│   │   │   ├── 📁 NavBar/         │ index.jsx, useNavBar.js, styles.scss
│   │   │   ├── 📁 Task/           │ index.jsx, useTask.js, styles.scss
│   │   │   ├── 📁 TaskColumn/     │ (Kanban columns)
│   │   │   ├── 📁 BacklogColumn/  │ (Backlog view)
│   │   │   ├── 📁 FilterBar/      │ (Filtros y búsqueda)
│   │   │   ├── 📁 FloatingActionButton/ │ (FAB para crear)
│   │   │   ├── 📁 VersionSelector/ │ (Selector de versiones)
│   │   │   └── 📁 modals/
│   │   │       ├── 📁 TaskModal/   │ HÍBRIDO: Modal + Página completa
│   │   │       ├── 📁 EpicModal/   │ HÍBRIDO: Modal + Página completa
│   │   │       └── 📁 AuthorModal/ │ Gestión de autores
│   │   ├── 📁 pages/             # Páginas principales (React Router)
│   │   │   ├── 📁 KanbanPage/     │ Vista principal (/)
│   │   │   ├── 📁 BacklogPage/    │ Vista backlog (/backlog)
│   │   │   ├── 📁 EpicsPage/      │ Lista épicas (/epics)
│   │   │   ├── 📁 TaskDetailPage/ │ Detalle tarea (/task/:id)
│   │   │   ├── 📁 EpicDetailPage/ │ Detalle épica (/epic/:id)
│   │   │   ├── 📁 ReleasePage/    │ Vista release (/release/:version)
│   │   │   └── 📁 AuthorsPage/    │ Gestión autores (/authors)
│   │   ├── 📁 contexts/          # Estado global (Context API)
│   │   │   ├── TaskContext.jsx    │ ⭐ CORE: Estado de tareas, épicas, etc.
│   │   │   ├── ThemeContext.jsx   │ Temas dark/light
│   │   │   └── ModalContext.jsx   │ Gestión de modales
│   │   ├── 📁 hooks/             # Custom hooks
│   │   │   ├── useTaskContext.js  │ Hook para TaskContext
│   │   │   ├── useOptimisticTasks.js │ Performance optimizada
│   │   │   ├── useApi.js          │ HTTP client wrapper
│   │   │   └── useTheme.js        │ Theme switching
│   │   ├── 📁 services/
│   │   │   └── api.js            │ ⭐ REST API cliente
│   │   ├── 📁 styles/            # SCSS global
│   │   │   ├── globals.scss       │ Estilos base
│   │   │   ├── variables.scss     │ ⭐ Variables CSS/SCSS
│   │   │   └── themes.scss        │ Dark/Light themes
│   │   └── 📁 hocs/
│   │       └── withTaskContext.jsx │ HOC for context injection
│   ├── 📁 server/                # Backend Express
│   │   └── server.js             │ ⭐ API endpoints REST
│   ├── 📁 core/                  # Business logic
│   │   ├── project-manager.js     │ Project-level operations
│   │   └── task-manager.js       │ ⭐ CORE: CRUD tareas/épicas/releases
│   └── cli.js                    # Entry point del servidor
├── 📁 jora-changelog/            # ⭐ DATABASE JSON FILES
│   ├── current.json              │ ⭐ Lista de tareas activas
│   ├── config.json               │ Configuración del proyecto
│   ├── authors.json              │ Lista de autores
│   ├── tags.json                 │ Lista de tags disponibles
│   ├── 📁 tasks/                 │ ⭐ TASKS DATABASE
│   │   ├── task-001-initial-vanilla-scaffolding.json
│   │   ├── task-009-convert-to-epic-button.json
│   │   ├── task-016-unique-id-system.json
│   │   ├── task-020-cancelled-state-implementation.json
│   │   └── task-XXX-nombre.json  │ Formato: task-###-slug.json
│   ├── 📁 epics/                 │ ⭐ EPICS DATABASE
│   │   ├── core-functionality.json
│   │   ├── ui-improvements.json
│   │   ├── advanced-workflow.json
│   │   └── epic-XXX.json         │ Épicas con tareas asociadas
│   └── 📁 releases/              │ ⭐ RELEASES GENERATED
│       ├── v0.1.0.json           │ Releases con tareas incluidas
│       ├── v0.2.0.json
│       └── v0.3.0.json
├── package.json                  │ Dependencies y scripts
├── vite.config.js               │ Configuración Vite
└── README.md                    │ Documentación principal
```

### **⚡ IMPORTANTE: Convenciones de Naming**
- **Componentes**: `ComponentName/index.jsx` (NO `ComponentName/ComponentName.jsx`)
- **Hooks**: `useComponentName.js` (en carpeta del componente)
- **Estilos**: `styles.scss` (en carpeta del componente)
- **Tasks**: `task-###-slug.json` (IDs semánticos incrementales)
- **Épicas**: `epic-name.json` o `epic-###.json`
- **NO redundancia** en nombres de archivos

---

## � **Estados y Workflow de Tareas**

### **Estados de Tareas (6 + 1 especial)**
```javascript
// Estados principales del Kanban
'in_backlog'        // 📋 Ideas y tareas futuras (NO en Kanban)
'todo'              // 📝 Listo para próximo sprint 
'in_progress'       // 🔄 En desarrollo activo
'in_review'         // 👀 En revisión/testing
'ready_to_release'  // ✅ Listo para release

// Estados especiales
'converted_to_epic' // 🔄 Convertido a épica (histórico)
'cancelled'         // ❌ Cancelado (solo visible en Backlog)
```

### **Flujo de Trabajo Típico**
```
📋 in_backlog → 📝 todo → 🔄 in_progress → 👀 in_review → ✅ ready_to_release
                ↑                                             ↓
              (reactivar)                              (release automático)
                ↑                                             ↓
            ❌ cancelled                               📦 moved to release
```

### **Características del Sistema**
- **Drag & Drop optimizado** con actualizaciones optimistas
- **Modales híbridos**: TaskModal/EpicModal funcionan como modal Y como página
- **URLs directas**: `/task/task-009`, `/epic/core-functionality`
- **Filtrado inteligente**: Por épica, autor, estado, búsqueda
- **Convert to Epic**: Convierte tareas grandes en épicas automáticamente
- **Estado cancelled**: Oculto del Kanban, visible solo en Backlog con toggle

---

## 📊 **Modelo de Datos ACTUAL**

### **Task Structure (FORMATO ACTUALIZADO)**
```javascript
{
  "id": "task-016-unique-id-system",        // ⭐ Semantic IDs nuevos
  "title": "Implementar sistema de IDs único y escalable",
  "description": "Desarrollar un sistema de generación...", // Markdown supported
  "state": "ready_to_release",              // 6 estados + converted_to_epic + cancelled
  "priority": "high",                       // low, medium, high, critical
  "type": "improvement",                    // feature, hotfix, documentation, poc, improvement, bug, refactor, test, chore
  "epic": "core-functionality",            // ID de épica asociada
  "author": "gzzy",                        // ID del autor
  "assignee": "gzzy",                       // ID del assignee (puede ser null)
  "estimatedPoints": 10,                    // Puntos de historia (0-21)
  "estimatedDate": "2025-07-20",           // Fecha estimada ISO o null
  "tags": ["technical-debt", "ux"],        // Array de tags
  "subtasks": [                            // Array de subtareas
    {
      "id": "subtask-1",
      "text": "Analizar diferencias entre IDs manuales vs web UI",
      "completed": true
    },
    {
      "id": "subtask-2", 
      "text": "Diseñar formato unificado: task-###-description-slug",
      "completed": true
    }
  ],
  "images": [],                            // Array de imágenes (futuro)
  "createdAt": "2025-01-12T15:00:00Z",
  "updatedAt": "2025-01-12T17:00:00Z"
}
```

### **Epic Structure**
```javascript
{
  "id": "core-functionality",
  "name": "Core Functionality", 
  "description": "Essential features for basic operation...",
  "color": "#3b82f6",                      // Color para UI
  "status": "in_progress",                 // planning, in_progress, completed, on_hold
  "priority": "high",
  "created_from": "task-009",              // ⭐ Si fue convertida desde tarea
  "startDate": "2025-07-01",
  "endDate": "2025-07-31",
  "createdAt": "2025-07-13T10:30:00Z",
  "updatedAt": "2025-07-13T14:45:00Z"
}
```

### **Release Structure**
```javascript
{
  "version": "v0.3.0",
  "name": "Epic Conversion & Cancelled State",
  "description": "Major release with epic conversion...",
  "releaseDate": "2025-07-13",
  "tasks": [ /* embedded tasks ready_to_release */ ],
  "convertedToEpics": [ /* tasks that were converted */ ], // ⭐ Nuevo
  "generatedAt": "2025-07-13T21:00:00Z",
  "taskCount": 3,
  "convertedCount": 1                      // ⭐ Nuevo
}
```

---

## �🎨 **Convenciones de Código Estrictas**

### **📁 Organización de Archivos**
- **Cada componente/página** tiene su propia carpeta
- **`index.jsx`** para el componente principal (no repetir nombres)
- **`styles.scss`** para estilos específicos (no repetir nombres)
- **`useComponentName.js`** para hooks personalizados
- **NO usar nombres redundantes** como `ComponentName/ComponentName.jsx`

### **🔗 Imports y Exports**
```javascript
// ✅ CORRECTO
import TaskModal from '../modals/TaskModal';
import { useTaskModal } from '../modals/TaskModal/useTaskModal';

// ❌ INCORRECTO  
import { TaskModal } from '../modals/TaskModal/TaskModal';
```

### **🎯 Hooks Personalizados**
- **Un hook por funcionalidad específica**
- **Prefijo `use`** obligatorio
- **Retornar objetos** con propiedades nombradas
- **Manejo de estados loading/error** incluido

```javascript
// Ejemplo de hook bien estructurado
export const useTaskModal = (taskId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  return {
    task,
    isLoading,
    error,
    handleSave,
    handleDelete
  };
};
```

### **💾 Context API Pattern**
```javascript
// TaskContext con provider y hook personalizado
export const TaskProvider = ({ children }) => {
  // Estado y lógica
  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};
```

---

## 🔧 **Funcionalidades Implementadas**

### **🏠 Páginas Principales**

1. **KanbanPage** (`/`)
   - Vista principal con 4 columnas: To Do, In Progress, In Review, Ready to Release
   - Drag & Drop optimizado con actualizaciones optimistas
   - FloatingActionButton para crear tareas

2. **BacklogPage** (`/backlog`)
   - Lista de todas las tareas sin filtros de estado
   - Vista compacta para overview general

3. **ReleasePage** (`/release/:version`)
   - Tareas agrupadas por tipo (feature, hotfix, documentation, etc.)
   - Progreso visual de la release
   - Navegación directa por URL

4. **TaskDetailPage** (`/task/:id`)
   - Modal híbrido (funciona como modal o página completa)
   - CRUD completo de tareas con todas las propiedades
   - Subtareas, tags, assignees, fechas estimadas

5. **EpicDetailPage** (`/epic/:id`)
   - Gestión completa de epics
   - Progress tracking de tareas asociadas
   - Vista de breakdown por estados

### **🎛️ Componentes Clave**

- **TaskModal/EpicModal**: Modales híbridos (modal + página)
- **VersionSelector**: Selector de versiones con sincronización
- **FloatingActionButton**: Botón para crear nuevas tareas
- **ModalManager**: Gestión centralizada de modales

### **⚡ Funcionalidades Avanzadas**

- **Drag & Drop Optimizado**: Sin recargas completas
- **Routing Dinámico**: URLs directas para todas las entidades
- **Temas Dark/Light**: Cambio dinámico de temas
- **Optimistic Updates**: UI responsive sin esperas
- **Offline First**: Funciona sin conexión a internet

---

## 📊 **Modelo de Datos**

### **Task Structure**
```javascript
{
  id: "task-1752281610386",
  title: "Implementar login con JWT",
  description: "Crear sistema de autenticación...",
  state: "in_progress", // todo, in_progress, in_review, ready_to_release
  priority: "high",     // low, medium, high, critical
  type: "feature",      // feature, hotfix, documentation, poc, improvement, bug, refactor, test, chore
  epic: "epic-auth-123",
  author: "author-dev1",
  assignee: "author-dev2",
  estimatedPoints: 8,
  estimatedDate: "2025-07-20",
  tags: ["authentication", "security"],
  subtasks: [
    { text: "Instalar JWT library", completed: true },
    { text: "Crear middleware", completed: false }
  ],
  createdAt: "2025-07-13T10:30:00Z",
  updatedAt: "2025-07-13T14:45:00Z"
}
```

### **Epic Structure**
```javascript
{
  id: "epic-auth-123",
  name: "Authentication System", 
  description: "Complete user authentication...",
  color: "#3b82f6",
  status: "in_progress", // planning, in_progress, completed, on_hold
  priority: "high",
  startDate: "2025-07-01",
  endDate: "2025-07-31"
}
```

### **Release Structure**
```javascript
{
  version: "v0.1.0",
  name: "Initial Release",
  description: "First stable version...",
  releaseDate: "2025-07-30",
  tasks: [ /* embedded tasks */ ]
}
```

---

## 🚀 **Comandos y Scripts**

```bash
# Desarrollo
npm run dev              # Modo desarrollo
npm run build:frontend   # Build solo frontend
npm run build           # Build completo (frontend + ejecutables)
npm start               # Servidor en producción

# Estructura de archivos
npm run serve           # Servidor estático
```

### **Endpoints API Disponibles**
```
GET    /api/tasks       # Obtener todas las tareas
POST   /api/tasks       # Crear nueva tarea  
PUT    /api/tasks/:id   # Actualizar tarea
DELETE /api/tasks/:id   # Eliminar tarea

GET    /api/epics       # Obtener todos los epics
POST   /api/epics       # Crear nuevo epic
PUT    /api/epics/:id   # Actualizar epic
DELETE /api/epics/:id   # Eliminar epic

GET    /api/releases    # Obtener releases
GET    /api/authors     # Obtener autores
GET    /api/tags        # Obtener tags
```

---

## 🎯 **Patterns y Best Practices**

### **Component Composition**
```javascript
// Patrón de composición recomendado
const TaskDetailPage = () => {
  const { id } = useParams();
  
  return (
    <TaskModal 
      taskId={id} 
      isModal={false}     // Modo página
      showHeader={true}   // Con navegación
    />
  );
};
```

### **Performance Optimizations**
- **useOptimisticTasks**: Actualizaciones inmediatas de UI
- **useMemo/useCallback**: Optimización de re-renders
- **Lazy Loading**: Componentes cargados bajo demanda

### **Error Handling**
```javascript
// Pattern de manejo de errores consistente
const { data, isLoading, error } = useCustomHook();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

---

## 🔮 **Roadmap y Extensiones**

### **✅ Completado**
- ✅ Migración completa a React
- ✅ Arquitectura modular
- ✅ Drag & Drop optimizado  
- ✅ Modales híbridos
- ✅ Routing dinámico
- ✅ Sistema de versiones

### **🔄 En Desarrollo Actual (v0.1.0)**
- � **Backlog UI Fixes**: Corregir drag & drop en página de backlog
- 📚 **Documentation**: Documentación general de uso para usuarios
- 🧪 **Testing Suite**: Implementar tests con Jest en todos los componentes
- 📦 **PKG Distribution**: Hacer funcionar el empaquetado con PKG para binarios distribuibles
- � **Bug Fixes**: Resolver errores menores y optimizar performance

### **🔮 Roadmap Futuro (post v0.1.0)**
- 🐙 **GitHub Integration**: Integrar con GitHub Issues, PRs y Releases automáticos
- 📝 **Markdown Editor**: Editor rico para descripciones de tareas
- 🔍 **Advanced Search**: Búsqueda avanzada y filtros complejos
- ⌨️ **Keyboard Shortcuts**: Atajos de teclado para productividad
- 📊 **Analytics Dashboard**: Métricas y reportes de progreso
- 🌐 **TypeScript Migration**: Migrar todo el proyecto a TypeScript
- 🔔 **Notifications**: Sistema de notificaciones

### **🎯 Features Sugeridas para Agentes**
```javascript
// Ejemplos de requests típicos que puedes recibir:

// 1. Crear nuevos modales
"Crear AuthorModal para gestionar autores"

// 2. Nuevas páginas
"Agregar DashboardPage con métricas de progreso"

// 3. Mejoras de UX
"Implementar tooltips en todos los botones"

// 4. Funcionalidades
"Agregar sistema de comentarios en tareas"

// 5. Performance
"Optimizar carga inicial con code splitting"
```

---

## 🧭 **Guidelines para Agentes**

### **Cuando recibas requests:**

1. **📁 Seguir estructura**: Siempre usar carpetas con `index.jsx` y `styles.scss`
2. **🔗 Imports consistentes**: No crear referencias circulares
3. **🎯 Hooks específicos**: Un hook por funcionalidad
4. **🎨 SCSS modular**: Variables globales en `/styles/variables.scss`
5. **📱 Responsive**: Siempre considerar mobile-first
6. **⚡ Performance**: Usar optimistic updates cuando sea posible
7. **🧪 Error handling**: Incluir estados loading/error/success

### **❌ Evitar:**
- Nombres redundantes en archivos
- Referencias circulares en exports
- Componentes monolíticos
- Estilos inline
- Props drilling excesivo

### **✅ Preferir:**
- Context API para estado global
- Hooks personalizados para lógica
- Componentes pequeños y enfocados
- SCSS con variables
- TypeScript patterns (aunque use JS)

---

## 🤖 **Guidelines para AI Agents - Working with Tasks**

### **📋 Cuando recibas una tarea como contexto:**

1. **📖 Leer la tarea completa**: Analiza `title`, `description`, `subtasks`, `tags`, `priority`, `epic`
2. **🎯 Entender el objetivo**: Identifica exactamente qué necesita implementarse
3. **📁 Explorar estructura**: Usa herramientas para entender la arquitectura actual
4. **🔧 Implementar paso a paso**: Sigue las subtareas como guía de progreso
5. **✅ Actualizar subtareas**: Marca como completadas las subtareas conforme avances
6. **📊 Reportar progreso**: Actualiza el estado de la tarea cuando termine

### **🎯 Pattern de trabajo recomendado:**

```javascript
// 1. Investigar componentes existentes
// 2. Planificar implementación
// 3. Crear/modificar archivos necesarios
// 4. Testear funcionalidad
// 5. Actualizar documentación si es necesario
```

### **📝 Subtask Management:**

Cuando completes una subtarea, actualiza el JSON:
```json
{
  "id": "subtask-1",
  "text": "Diseñar UI del botón",
  "completed": true  // ← Cambiar a true
}
```

### **🔄 Estados de tarea válidos:**
- `in_backlog` - En backlog, no prioritizada
- `todo` - Listo para trabajar
- `in_progress` - En desarrollo activo
- `in_review` - Completado, esperando review
- `ready_to_release` - Aprobado y listo
- `converted_to_epic` - Convertido a épica (especial)

---
