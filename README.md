# 🎓 Mapa Interactivo de Correlativas - UNLaM

Un visualizador interactivo, moderno y altamente personalizable del plan de estudios (Plan 2023) para la carrera de **Ingeniería Informática** en la **Universidad Nacional de La Matanza (UNLaM)**.

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Revisi%C3%B3n-warning)
![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)
![React Flow](https://img.shields.io/badge/React_Flow-11.10-ff0072)

---

## ✨ Características Principales

Esta aplicación fue construida pensando en ofrecer una experiencia de usuario (UX) premium, utilizando el estilo *Glassmorphism* y efectos de neón para facilitar la legibilidad del complejo grafo de 64 materias.

* **🗺️ Navegación Gráfica Interactiva**: Arrastra, haz zoom y explora libremente toda la malla curricular. Cuenta con un **Minimapa** integrado para no perderte.
* **🚦 Seguimiento de Estado Automático**: Haz clic en las materias para marcarlas como *Promocionadas* o *Cursadas*. El sistema evaluará automáticamente tus correlativas y desbloqueará las materias siguientes cambiando su estado a *Disponible*.
* **🔮 Modo Simulación**: ¿Quieres saber qué pasaría si apruebas Análisis Matemático II? Activa el **Modo Simulación**, haz clic en materias (se teñirán de púrpura) y el grafo te mostrará qué rutas se te habilitan a futuro, ¡sin afectar tu progreso real guardado!
* **🔥 Ruta Crítica (Shift + Hover)**: Mantén presionada la tecla `Shift` y pasa el ratón sobre cualquier materia avanzada. Se iluminará toda la cadena de requisitos hacia atrás hasta el primer año, utilizando un **gradiente de calor** (de naranja intenso a amarillo suave) indicando la profundidad o distancia de las materias.
* **📊 Paneles de Progreso**: Visualiza tu avance con anillos circulares (`SVG`) por cada año de la carrera, así como tu porcentaje de Título Intermedio y promedio general.
* **🗂️ Panel de Detalles y Notas**: Haz Doble Clic en cualquier materia para abrir un menú lateral deslizante. Allí verás los requisitos exactos y podrás guardar **anotaciones personales** (ej. tips del profesor, recordatorios).
* **💾 Persistencia Local**: Todo tu progreso y tus notas se guardan automáticamente en tu navegador usando `localStorage`. No necesitas crearte una cuenta.
* **📥 Exportación a Excel**: Exporta un reporte detallado de tu situación actual a un archivo `.xlsx` con un solo botón.

---

## 🛠️ Tecnologías y Librerías Utilizadas

El proyecto fue desarrollado utilizando un stack moderno de Frontend:

* **[React](https://react.dev/) + [Vite](https://vitejs.dev/)**: El núcleo de la aplicación. Se utilizó Vite por su extrema rapidez en el entorno de desarrollo y su eficiencia al empaquetar el bundle de producción.
* **[React Flow](https://reactflow.dev/)**: El motor gráfico detrás del mapa interactivo. Se utilizó esta librería especializada para manejar el renderizado de los nodos (materias), las flechas (correlativas), el minimapa y los controles de zoom/paneo.
* **[XLSX (SheetJS)](https://sheetjs.com/)**: Librería implementada para generar y descargar dinámicamente un archivo real de Microsoft Excel con los datos del progreso del estudiante.
* **[Lucide React](https://lucide.dev/)**: Conjunto de iconos vectoriales limpios y modernos utilizados en toda la interfaz (botones de exportar, simulación, ojos, checkmarks, etc).
* **Vanilla CSS**: Toda la estética premium, los efectos de *Glassmorphism* (desenfoques, transparencias), animaciones de flechas, pulsos de fondo circular y la lógica de degradado de colores de la ruta crítica fueron construidos 100% con CSS puro para mantener el proyecto ligero y sin dependencias pesadas como Tailwind.

---

## 🚀 Instalación y Uso Local

Si deseas descargar el código y correrlo en tu propia máquina para hacerle modificaciones:

### Prerrequisitos
- Tener [Node.js](https://nodejs.org/) instalado en tu computadora.

### Pasos
1. Clona este repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/unlam-mapa-interactivo.git
   ```
2. Entra a la carpeta del proyecto:
   ```bash
   cd unlam-mapa-interactivo
   ```
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
5. Abre el link que aparece en tu terminal (usualmente `http://localhost:5173`) en tu navegador web.

---
*Creado para facilitar la vida de los futuros ingenieros informáticos de la UNLaM.* 💻🎓
