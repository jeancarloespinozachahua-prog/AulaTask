# AulaTask - Gestor de tareas académicas

## Descripción
AulaTask es una aplicación web que permite organizar las actividades
académicas de un aula y repartirlas entre los integrantes de un equipo.
Funciona en cualquier navegador moderno, sin instalar nada.

## Funcionalidades
- Registrar tareas con título, responsable, materia, prioridad y fecha de entrega.
- Editar y eliminar tareas, con opción de **deshacer** al eliminar.
- Marcar tareas como completadas o volver a dejarlas pendientes.
- Panel de resumen con barra de progreso, contadores y tareas vencidas.
- Avisos de plazo: "Vence hoy", "Vence mañana", "Venció hace 2 días".
- Buscar por título, responsable o materia (ignora tildes y mayúsculas).
- Filtrar por estado y prioridad, y ordenar por fecha, prioridad o recientes.
- Los datos **se guardan automáticamente** en el navegador (no se pierden al recargar).
- Exportar e importar las tareas en formato JSON para compartirlas con el equipo.
- Borrar todas las tareas completadas de una vez (también se puede deshacer).
- Tema claro y oscuro, que respeta la preferencia del sistema.
- Diseño adaptable a celular, tableta y computadora.
- Validación de formulario con mensajes claros junto a cada campo.
- Accesible: navegación por teclado, etiquetas para lectores de pantalla,
  avisos anunciados y respeto por "reducir movimiento".

### Atajos de teclado
| Tecla | Acción |
|-------|--------|
| `/`   | Ir al buscador |
| `Esc` | Cancelar la edición de una tarea |

## Tecnologías
- HTML5
- CSS3 (variables, grid, flexbox, modo oscuro)
- JavaScript (sin librerías ni dependencias)
- Git
- GitHub

## Estructura del proyecto
```
AulaTask/
├── index.html    Estructura de la página
├── estilos.css   Estilos, temas y diseño adaptable
├── app.js        Lógica de la aplicación
├── README.md
└── .gitignore
```

## Instalación y ejecución
1. Clonar el repositorio.
2. Abrir la carpeta del proyecto.
3. Abrir `index.html` en el navegador.

No se necesita instalar dependencias ni ejecutar un servidor.

## Formato de exportación
El archivo exportado es un JSON con esta forma:

```json
{
  "aplicacion": "AulaTask",
  "version": 1,
  "tareas": [
    {
      "id": "…",
      "titulo": "Preparar exposición",
      "responsable": "Ana Torres",
      "materia": "Historia",
      "prioridad": "alta",
      "fecha": "2026-10-20",
      "completada": false,
      "creada": 1760400000000
    }
  ]
}
```
Al importar, las tareas se **agregan** a las existentes y los campos se validan.

## Decisiones de diseño
- **Sin dependencias:** solo HTML, CSS y JavaScript, para que sea fácil de
  revisar y de ejecutar en cualquier equipo del aula.
- **Seguridad:** el texto escrito por el usuario siempre se inserta con
  `textContent`, nunca como HTML, y los datos importados se validan.
- **Fechas locales:** las fechas se interpretan en la zona horaria del
  usuario para evitar errores de un día.
- **Deshacer en lugar de confirmar:** eliminar no interrumpe con ventanas
  emergentes; se puede revertir desde el aviso.

## Organización del equipo
- Integrante 1: estructura HTML.
- Integrante 2: estilos CSS.
- Integrante 3: registro y gestión de tareas.
- Integrante 4: filtros, contadores y pruebas.

## Limitaciones
Los datos se guardan en el navegador (`localStorage`) del dispositivo que se
usa. No se sincronizan entre dispositivos distintos: para compartir tareas
hay que usar **Exportar** e **Importar**. Borrar los datos del navegador
también borra las tareas.

## Trabajo colaborativo
El equipo utiliza ramas, commits y Pull Requests para registrar y revisar
los cambios.
