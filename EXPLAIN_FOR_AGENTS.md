# 🎯 JoRA - Project Explanation for AI Agents

## 📋 **Project Overview**

**JoRA** (Just Outstanding Requirements Administration) es un **task manager offline moderno** desarrollado inicialmente en vanilla JavaScript y completamente migrado a **React con arquitectura modular**. Es una aplicación desktop que combina la simplicidad de un Kanban board con funcionalidades avanzadas de gestión de proyectos.

### 🎯 **Propósito Principal**
- **Gestión de tareas** con metodología Kanban
- **Administración de epics** y releases
- **Tracking de progreso** y métricas
- **Funciona completamente offline** sin dependencias externas
- **Interfaz moderna** con temas dark/light
- **Arquitectura escalable** y mantenible

---

## 🏗️ **Arquitectura y Estructura**

### **Stack Tecnológico**
```
Frontend: React 18+ + React Router + SCSS + Vite
Backend: Node.js + Express (API REST)
Database: JSON files (sistema de archivos)
Build: Vite + PKG (ejecutables multiplataforma)
```

### **Estructura de Archivos Organizada**
```
📁 src/
├── 📁 frontend/
│   ├── 📁 components/
│   │   ├── 📁 NavBar/
│   │   │   ├── index.jsx          # Componente principal
│   │   │   ├── useNavBar.js        # Hook personalizado
│   │   │   └── styles.scss         # Estilos específicos
│   │   ├── 📁 TaskColumn/
│   │   ├── 📁 Task/
│   │   ├── 📁 FilterBar/
│   │   ├── 📁 VersionSelector/
│   │   ├── 📁 FloatingActionButton/
│   │   └── 📁 modals/
│   │       ├── 📁 TaskModal/
│   │       └── 📁 EpicModal/
│   ├── 📁 pages/
│   │   ├── 📁 KanbanPage/
│   │   │   ├── index.jsx
│   │   │   └── styles.scss
│   │   ├── 📁 BacklogPage/
│   │   ├── 📁 ReleasePage/
│   │   │   ├── index.jsx
│   │   │   ├── useReleasePage.js   # Hook para lógica de release
│   │   │   └── styles.scss
│   │   ├── 📁 TaskDetailPage/
│   │   └── 📁 EpicDetailPage/
│   ├── 📁 contexts/
│   │   ├── TaskContext.jsx         # Estado global de tareas
│   │   ├── ThemeContext.jsx        # Gestión de temas
│   │   └── ModalContext.jsx        # Gestión de modales
│   ├── 📁 hooks/
│   │   ├── useTaskContext.js
│   │   ├── useOptimisticTasks.js   # Performance optimizada
│   │   └── useTheme.js
│   ├── 📁 services/
│   │   └── api.js                  # Cliente HTTP
│   ├── 📁 styles/
│   │   ├── globals.scss
│   │   ├── variables.scss
│   │   └── themes.scss
│   └── 📁 hocs/
│       └── withTaskContext.jsx
├── 📁 server/
│   └── server.js                   # API Express
├── 📁 core/
│   ├── project-manager.js
│   └── task-manager.js
└── cli.js                          # Entry point
```

---

## 🎨 **Convenciones de Código Estrictas**

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

### **🔄 En Desarrollo Potencial**
- 📝 **Markdown Editor**: Editor rico para descripciones
- 🔔 **Notifications**: Sistema de notificaciones
- 🔍 **Advanced Search**: Búsqueda avanzada y filtros
- ⌨️ **Keyboard Shortcuts**: Atajos de teclado
- 📊 **Analytics Dashboard**: Métricas y reportes
- 🌐 **Multi-language**: Internacionalización

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

## 🎉 **Estado Actual**

**JoRA está 100% funcional** con:
- ✅ **Arquitectura React moderna**
- ✅ **UI/UX pulida y responsive**  
- ✅ **Performance optimizada**
- ✅ **Funcionalidades core completas**
- ✅ **Estructura escalable**

**Ready para:** Nuevas features, optimizaciones, y mejoras de UX.

---

*Este documento debe ser tu guía principal para entender JoRA y implementar nuevas funcionalidades manteniendo los estándares de código y arquitectura establecidos.*
