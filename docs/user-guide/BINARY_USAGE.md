# 📦 JoRA - Instrucciones de Uso de Binarios

## Descarga y Configuración

### 1. Descargar los Archivos

Desde las [releases de GitHub](https://github.com/gzzydevs/JoRA/releases), descarga **ambos archivos**:

**📱 Binario según tu Sistema Operativo:**
- **Linux**: `jora-linux`
- **Windows**: `jora-win.exe` 
- **macOS**: `jora-mac`

**🎨 Frontend (requerido para todos):**
- `jora-frontend.zip`

### 2. Preparar el Entorno

1. **Crea una carpeta** para JoRA en tu sistema:
   ```bash
   mkdir jora-app
   cd jora-app
   ```

2. **Mueve el binario** a esta carpeta:
   - Linux/macOS: `mv jora-linux jora-app/` (o `jora-mac`)
   - Windows: Mueve `jora-win.exe` a la carpeta

3. **Extrae el frontend** en la misma carpeta:
   ```bash
   unzip jora-frontend.zip
   ```

4. **Estructura final esperada:**
   ```
   jora-app/
   ├── jora-linux (o jora-mac, jora-win.exe)
   └── frontend/
       ├── index.html
       └── assets/
           ├── index-xxx.js
           └── index-xxx.css
   ```

### 3. Ejecutar JoRA

**Linux/macOS:**
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x jora-linux  # o jora-mac

# Ejecutar
./jora-linux
```

**Windows:**
```cmd
jora-win.exe
```

## 🚀 Primeros Pasos

### Inicializar un Proyecto

1. **Navega** a donde quieres crear tu proyecto JoRA:
   ```bash
   cd /ruta/a/tu/proyecto
   ```

2. **Inicializa** el proyecto:
   ```bash
   # Linux/macOS
   /ruta/a/jora-app/jora-linux init

   # Windows
   C:\ruta\a\jora-app\jora-win.exe init
   ```

3. **Accede** a la interfaz web:
   - Abre tu navegador en: `http://localhost:3333`

### Comandos Disponibles

```bash
# Inicializar proyecto en carpeta actual
./jora-linux init

# Ejecutar servidor en proyecto existente
./jora-linux start

# Ver ayuda
./jora-linux --help
```

## ⚠️ Requisitos

- **Frontend obligatorio**: El archivo `frontend.zip` debe estar extraído junto al binario
- **Puerto 3333**: Debe estar disponible en tu sistema
- **Navegador**: Chrome, Firefox, Safari o Edge (versiones recientes)

## 🔧 Resolución de Problemas

### "Frontend build not found"
- ✅ Verifica que la carpeta `frontend/` esté en el mismo directorio que el binario
- ✅ Asegúrate de haber extraído correctamente `jora-frontend.zip`

### "Port 3333 is already in use"
- ✅ Mata el proceso existente: `lsof -ti:3333 | xargs kill -9`
- ✅ O usa otro puerto si JoRA lo permite en futuras versiones

### Binario no ejecuta (Linux/macOS)
- ✅ Verifica permisos: `chmod +x jora-linux`
- ✅ En macOS, si aparece "no identificado": Ve a Configuración > Seguridad y permite la ejecución

---

**💡 Tip**: Puedes crear un alias o acceso directo para ejecutar JoRA desde cualquier lugar de tu sistema.
