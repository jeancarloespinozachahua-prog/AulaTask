/* ==========================================================
   AulaTask · Lógica de la aplicación
   Secciones: 1. Configuración   5. Avisos
              2. Utilidades      6. Formulario y edición
              3. Persistencia    7. Acciones sobre tareas
              4. Renderizado     8. Eventos e inicio
   ========================================================== */
(function () {
    "use strict";

    /* ---------- 1. Configuración ---------- */
    const CLAVE_DATOS = "aulatask.v1";
    const CLAVE_TEMA = "aulatask.tema";
    const PRIORIDADES = ["alta", "media", "baja"];
    const PESO_PRIORIDAD = { alta: 0, media: 1, baja: 2 };
    const ETIQUETA_PRIORIDAD = { alta: "Alta", media: "Media", baja: "Baja" };
    const TAMANO_MAXIMO_IMPORTACION = 2 * 1024 * 1024;

    const $ = (id) => document.getElementById(id);

    const formulario = $("formulario");
    const panelFormulario = $("panel-formulario");
    const tituloFormulario = $("titulo-formulario");
    const campoTitulo = $("titulo");
    const campoResponsable = $("responsable");
    const campoMateria = $("materia");
    const campoFecha = $("fecha");
    const errorTitulo = $("error-titulo");
    const errorResponsable = $("error-responsable");
    const botonGuardar = $("boton-guardar");
    const botonCancelar = $("boton-cancelar");
    const listaResponsables = $("lista-responsables");
    const listaMaterias = $("lista-materias");

    const lista = $("lista");
    const vacio = $("vacio");
    const vacioTitulo = $("vacio-titulo");
    const vacioTexto = $("vacio-texto");
    const vacioAccion = $("vacio-accion");
    const cantidad = $("cantidad");
    const campoBusqueda = $("busqueda");
    const filtroPrioridad = $("filtro-prioridad");
    const selectorOrden = $("orden");

    const botonExportar = $("boton-exportar");
    const botonImportar = $("boton-importar");
    const archivoImportar = $("archivo-importar");
    const botonBorrarCompletadas = $("boton-borrar-completadas");
    const zonaAvisos = $("avisos");

    const botonTema = $("boton-tema");
    const iconoLuna = $("icono-luna");
    const iconoSol = $("icono-sol");

    /* ---------- Estado ---------- */
    let tareas = [];
    let idEditando = null;
    let idDestacada = null;
    let idEnfocar = null;
    let accionVacio = null;

    const vista = {
        busqueda: "",
        estado: "todas",
        prioridad: "todas",
        orden: "recientes"
    };

    /* ---------- 2. Utilidades ---------- */
    const formatoCorto = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
    const formatoLargo = new Intl.DateTimeFormat("es", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    function generarId() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function plural(n, singular, varios) {
        return n === 1 ? singular : varios;
    }

    function limpiar(valor, maximo) {
        return typeof valor === "string"
            ? valor.trim().replace(/\s+/g, " ").slice(0, maximo)
            : "";
    }

    // Quita tildes y mayúsculas para que la búsqueda sea tolerante.
    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function iniciales(nombre) {
        const partes = nombre.trim().split(/\s+/).filter(Boolean);
        if (!partes.length) return "?";
        const primera = partes[0][0];
        const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
        return (primera + ultima).toUpperCase();
    }

    // Mismo nombre, mismo color: ayuda a reconocer responsables de un vistazo.
    function tonoDe(nombre) {
        let hash = 0;
        for (const caracter of normalizar(nombre.trim())) {
            hash = (hash * 31 + caracter.codePointAt(0)) >>> 0;
        }
        return hash % 360;
    }

    function fechaISO(fecha) {
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        return fecha.getFullYear() + "-" + mes + "-" + dia;
    }

    function hoyLocal() {
        const ahora = new Date();
        return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    }

    // Convierte "AAAA-MM-DD" en fecha local (evita el desfase por zona horaria).
    function parsearFecha(texto) {
        const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto || "");
        if (!partes) return null;
        const fecha = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
        return fecha.getMonth() === Number(partes[2]) - 1 ? fecha : null;
    }

    function diasHasta(texto) {
        const fecha = parsearFecha(texto);
        if (!fecha) return null;
        return Math.round((fecha - hoyLocal()) / 86400000);
    }

    function estaVencida(tarea) {
        const dias = diasHasta(tarea.fecha);
        return !tarea.completada && dias !== null && dias < 0;
    }

    function describirEntrega(tarea) {
        const fecha = parsearFecha(tarea.fecha);
        if (!fecha) return null;

        const corta = formatoCorto.format(fecha);
        const dias = diasHasta(tarea.fecha);

        if (tarea.completada) return { texto: corta, clase: "" };
        if (dias < -1) return { texto: "Venció hace " + (-dias) + " días", clase: "vencida" };
        if (dias === -1) return { texto: "Venció ayer", clase: "vencida" };
        if (dias === 0) return { texto: "Vence hoy", clase: "pronto" };
        if (dias === 1) return { texto: "Vence mañana", clase: "pronto" };
        if (dias <= 7) return { texto: "Vence en " + dias + " días", clase: "" };
        return { texto: "Vence el " + corta, clase: "" };
    }

    /* ---------- 3. Persistencia ---------- */
    function sanear(entrada) {
        if (!Array.isArray(entrada)) return [];

        const usados = new Set();
        const resultado = [];

        entrada.forEach(function (item) {
            if (!item || typeof item !== "object") return;

            const titulo = limpiar(item.titulo, 100);
            const responsable = limpiar(item.responsable, 60);
            if (!titulo || !responsable) return;

            let id = typeof item.id === "string" || typeof item.id === "number"
                ? String(item.id)
                : generarId();
            if (usados.has(id)) id = generarId();
            usados.add(id);

            resultado.push({
                id: id,
                titulo: titulo,
                responsable: responsable,
                materia: limpiar(item.materia, 60),
                prioridad: PRIORIDADES.includes(item.prioridad) ? item.prioridad : "media",
                fecha: parsearFecha(item.fecha) ? item.fecha : "",
                completada: item.completada === true,
                creada: Number.isFinite(item.creada) ? item.creada : Date.now()
            });
        });

        return resultado;
    }

    function cargar() {
        try {
            const crudo = localStorage.getItem(CLAVE_DATOS);
            if (!crudo) return [];
            const datos = JSON.parse(crudo);
            return sanear(Array.isArray(datos) ? datos : datos.tareas);
        } catch (error) {
            return [];
        }
    }

    function guardar() {
        try {
            localStorage.setItem(CLAVE_DATOS, JSON.stringify({ version: 1, tareas: tareas }));
        } catch (error) {
            avisar("No se pudo guardar en este navegador. Exporta tus tareas para no perderlas.", { error: true });
        }
    }

    function persistir() {
        guardar();
        renderizar();
    }

    /* ---------- 4. Renderizado ---------- */
    const ICONOS = {
        editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        eliminar: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>'
    };

    function crearIcono(nombre) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.classList.add("icono");
        svg.innerHTML = ICONOS[nombre]; // Solo constantes internas, nunca datos del usuario.
        return svg;
    }

    function crearChip(texto, clase) {
        const chip = document.createElement("span");
        chip.className = "chip" + (clase ? " " + clase : "");
        chip.textContent = texto;
        return chip;
    }

    function crearBotonIcono(nombre, etiqueta, clase, alHacerClic) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn-icono " + clase;
        boton.setAttribute("aria-label", etiqueta);
        boton.title = etiqueta;
        boton.append(crearIcono(nombre));
        boton.addEventListener("click", alHacerClic);
        return boton;
    }

    function crearItem(tarea) {
        const elemento = document.createElement("li");
        elemento.className = "tarea";
        elemento.dataset.id = tarea.id;
        elemento.dataset.prioridad = tarea.prioridad;
        if (tarea.completada) elemento.classList.add("terminada");
        if (tarea.id === idEditando) elemento.classList.add("editando");
        if (tarea.id === idDestacada) elemento.classList.add("destacada");

        // Casilla de estado
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.className = "check";
        casilla.checked = tarea.completada;
        casilla.setAttribute(
            "aria-label",
            (tarea.completada ? "Marcar como pendiente: " : "Marcar como completada: ") + tarea.titulo
        );
        casilla.addEventListener("change", function () {
            cambiarEstado(tarea.id, casilla.checked);
        });

        // Contenido
        const cuerpo = document.createElement("div");

        const titulo = document.createElement("p");
        titulo.className = "titulo-tarea";
        titulo.textContent = tarea.titulo;

        const meta = document.createElement("div");
        meta.className = "meta";

        const responsable = document.createElement("span");
        responsable.className = "responsable";

        const avatar = document.createElement("span");
        avatar.className = "avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.style.setProperty("--tono", tonoDe(tarea.responsable));
        avatar.textContent = iniciales(tarea.responsable);

        const prefijo = document.createElement("span");
        prefijo.className = "sr-only";
        prefijo.textContent = "Responsable: ";

        const nombre = document.createElement("span");
        nombre.className = "nombre";
        nombre.textContent = tarea.responsable;

        responsable.append(avatar, prefijo, nombre);
        meta.append(responsable);

        if (tarea.materia) {
            meta.append(crearChip(tarea.materia, ""));
        }

        const entrega = describirEntrega(tarea);
        if (entrega) {
            const chipFecha = crearChip(entrega.texto, entrega.clase);
            chipFecha.title = formatoLargo.format(parsearFecha(tarea.fecha));
            meta.append(chipFecha);
        }

        const chipPrioridad = crearChip("", "prio-" + tarea.prioridad);
        const prefijoPrioridad = document.createElement("span");
        prefijoPrioridad.className = "sr-only";
        prefijoPrioridad.textContent = "Prioridad ";
        chipPrioridad.append(prefijoPrioridad, ETIQUETA_PRIORIDAD[tarea.prioridad]);
        meta.append(chipPrioridad);

        cuerpo.append(titulo, meta);

        // Acciones
        const acciones = document.createElement("div");
        acciones.className = "acciones";
        acciones.append(
            crearBotonIcono("editar", "Editar tarea: " + tarea.titulo, "editar", function () {
                iniciarEdicion(tarea.id);
            }),
            crearBotonIcono("eliminar", "Eliminar tarea: " + tarea.titulo, "eliminar", function () {
                eliminarTarea(tarea.id);
            })
        );

        elemento.append(casilla, cuerpo, acciones);
        return elemento;
    }

    function coincideConFiltros(tarea) {
        if (vista.estado === "pendientes" && tarea.completada) return false;
        if (vista.estado === "completadas" && !tarea.completada) return false;
        if (vista.prioridad !== "todas" && tarea.prioridad !== vista.prioridad) return false;

        const consulta = normalizar(vista.busqueda.trim());
        if (consulta) {
            const texto = normalizar(tarea.titulo + " " + tarea.responsable + " " + tarea.materia);
            if (!texto.includes(consulta)) return false;
        }
        return true;
    }

    function comparar(a, b) {
        // Las pendientes siempre van antes que las completadas.
        if (a.completada !== b.completada) return a.completada ? 1 : -1;

        const porFecha = function () {
            if (a.fecha === b.fecha) return 0;
            if (!a.fecha) return 1;
            if (!b.fecha) return -1;
            return a.fecha < b.fecha ? -1 : 1;
        };
        const porCreacion = b.creada - a.creada;

        if (vista.orden === "entrega") return porFecha() || porCreacion;
        if (vista.orden === "prioridad") {
            return (PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad]) || porFecha() || porCreacion;
        }
        return porCreacion;
    }

    function configurarVacio(hayTareas) {
        if (!hayTareas) {
            vacioTitulo.textContent = "Todavía no hay tareas";
            vacioTexto.textContent = "Registra la primera con el formulario o carga algunos ejemplos para explorar la aplicación.";
            vacioAccion.textContent = "Cargar ejemplos";
            accionVacio = cargarEjemplos;
        } else {
            vacioTitulo.textContent = "Ninguna tarea coincide";
            vacioTexto.textContent = "Prueba con otra búsqueda o quita los filtros para ver todas las tareas.";
            vacioAccion.textContent = "Quitar filtros";
            accionVacio = function () {
                limpiarFiltros();
                renderizarLista();
            };
        }
    }

    function renderizarLista() {
        const visibles = tareas.filter(coincideConFiltros).sort(comparar);

        const fragmento = document.createDocumentFragment();
        visibles.forEach(function (tarea) {
            fragmento.append(crearItem(tarea));
        });
        lista.replaceChildren(fragmento);

        lista.hidden = visibles.length === 0;
        vacio.hidden = visibles.length > 0;
        if (visibles.length === 0) configurarVacio(tareas.length > 0);

        cantidad.textContent = tareas.length
            ? "Mostrando " + visibles.length + " de " + tareas.length
            : "";

        // Si el usuario marcó una casilla, el foco vuelve a ella tras redibujar.
        if (idEnfocar) {
            const casilla = lista.querySelector('[data-id="' + CSS.escape(idEnfocar) + '"] .check');
            if (casilla) casilla.focus({ preventScroll: true });
            idEnfocar = null;
        }
        idDestacada = null;
    }

    function textoResumen(total, pendientes, vencidas, paraHoy) {
        if (total === 0) return "Aún no hay tareas. Registra la primera para empezar.";
        if (pendientes === 0) return "Todo al día. Completaste todas las tareas.";

        const partes = ["Hay " + pendientes + " " + plural(pendientes, "tarea pendiente", "tareas pendientes") + "."];
        if (vencidas) partes.push(vencidas + " " + plural(vencidas, "está vencida", "están vencidas") + ".");
        if (paraHoy) partes.push(paraHoy + " " + plural(paraHoy, "vence", "vencen") + " hoy.");
        return partes.join(" ");
    }

    function renderizarResumen() {
        const total = tareas.length;
        const hechas = tareas.filter(function (t) { return t.completada; }).length;
        const pendientes = total - hechas;
        const vencidas = tareas.filter(estaVencida).length;
        const paraHoy = tareas.filter(function (t) {
            return !t.completada && diasHasta(t.fecha) === 0;
        }).length;

        $("total").textContent = total;
        $("completadas").textContent = hechas;
        $("pendientes").textContent = pendientes;
        $("vencidas").textContent = vencidas;
        $("texto-resumen").textContent = textoResumen(total, pendientes, vencidas, paraHoy);

        const pctHechas = total ? (hechas / total) * 100 : 0;
        const pctVencidas = total ? (vencidas / total) * 100 : 0;
        const pctPendientes = total ? 100 - pctHechas - pctVencidas : 0;

        $("seg-hechas").style.width = pctHechas + "%";
        $("seg-pendientes").style.width = pctPendientes + "%";
        $("seg-vencidas").style.width = pctVencidas + "%";

        const etiqueta = total ? Math.round(pctHechas) + " % completado" : "Sin tareas";
        $("porcentaje").textContent = etiqueta;
        $("barra").setAttribute("aria-label", etiqueta);

        $("cuenta-todas").textContent = total;
        $("cuenta-pendientes").textContent = pendientes;
        $("cuenta-completadas").textContent = hechas;

        botonExportar.disabled = total === 0;
        botonBorrarCompletadas.disabled = hechas === 0;
    }

    function llenarSugerencias(datalist, valores) {
        const unicos = Array.from(new Set(valores.filter(Boolean)))
            .sort(function (a, b) { return a.localeCompare(b, "es"); });

        datalist.replaceChildren(...unicos.map(function (valor) {
            const opcion = document.createElement("option");
            opcion.value = valor;
            return opcion;
        }));
    }

    function renderizar() {
        renderizarLista();
        renderizarResumen();
        llenarSugerencias(listaResponsables, tareas.map(function (t) { return t.responsable; }));
        llenarSugerencias(listaMaterias, tareas.map(function (t) { return t.materia; }));
    }

    /* ---------- 5. Avisos ---------- */
    function avisar(texto, opciones) {
        const config = opciones || {};
        const aviso = document.createElement("div");
        aviso.className = "aviso" + (config.error ? " error" : "");

        const mensaje = document.createElement("span");
        mensaje.textContent = texto;
        aviso.append(mensaje);

        let temporizador = null;
        const cerrar = function () {
            clearTimeout(temporizador);
            aviso.classList.add("saliendo");
            setTimeout(function () { aviso.remove(); }, 200);
        };

        if (config.accion) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "aviso-accion";
            boton.textContent = config.etiquetaAccion || "Deshacer";
            boton.addEventListener("click", function () {
                config.accion();
                cerrar();
            });
            aviso.append(boton);
        }

        zonaAvisos.append(aviso);
        while (zonaAvisos.children.length > 3) {
            zonaAvisos.firstElementChild.remove();
        }

        temporizador = setTimeout(cerrar, config.accion || config.error ? 7000 : 4000);
    }

    /* ---------- 6. Formulario y edición ---------- */
    function leerFormulario() {
        return {
            titulo: limpiar(campoTitulo.value, 100),
            responsable: limpiar(campoResponsable.value, 60),
            materia: limpiar(campoMateria.value, 60),
            prioridad: formulario.elements.prioridad.value,
            fecha: campoFecha.value
        };
    }

    function marcarCampo(campo, elementoError, mensaje) {
        elementoError.textContent = mensaje;
        if (mensaje) {
            campo.setAttribute("aria-invalid", "true");
        } else {
            campo.removeAttribute("aria-invalid");
        }
    }

    function limpiarErrores() {
        marcarCampo(campoTitulo, errorTitulo, "");
        marcarCampo(campoResponsable, errorResponsable, "");
    }

    function validar(datos) {
        const mensajeTitulo = datos.titulo.length < 3
            ? "Escribe un título de al menos 3 caracteres."
            : "";
        const mensajeResponsable = datos.responsable.length < 2
            ? "Indica quién es el responsable."
            : "";

        marcarCampo(campoTitulo, errorTitulo, mensajeTitulo);
        marcarCampo(campoResponsable, errorResponsable, mensajeResponsable);

        if (mensajeTitulo) {
            campoTitulo.focus();
            return false;
        }
        if (mensajeResponsable) {
            campoResponsable.focus();
            return false;
        }
        return true;
    }

    function mostrarModoCreacion() {
        panelFormulario.classList.remove("editando");
        tituloFormulario.textContent = "Nueva tarea";
        botonGuardar.textContent = "Agregar tarea";
        botonCancelar.hidden = true;
    }

    function iniciarEdicion(id) {
        const tarea = tareas.find(function (t) { return t.id === id; });
        if (!tarea) return;

        idEditando = id;
        limpiarErrores();

        campoTitulo.value = tarea.titulo;
        campoResponsable.value = tarea.responsable;
        campoMateria.value = tarea.materia;
        campoFecha.value = tarea.fecha;
        formulario.elements.prioridad.value = tarea.prioridad;

        panelFormulario.classList.add("editando");
        tituloFormulario.textContent = "Editar tarea";
        botonGuardar.textContent = "Guardar cambios";
        botonCancelar.hidden = false;

        renderizarLista();
        campoTitulo.focus();
    }

    function salirDeEdicion() {
        idEditando = null;
        formulario.reset();
        limpiarErrores();
        mostrarModoCreacion();
    }

    function cancelarEdicion() {
        salirDeEdicion();
        renderizarLista();
    }

    /* ---------- 7. Acciones sobre tareas ---------- */
    function limpiarFiltros() {
        vista.busqueda = "";
        vista.estado = "todas";
        vista.prioridad = "todas";
        campoBusqueda.value = "";
        filtroPrioridad.value = "todas";
        formulario.ownerDocument.querySelector('input[name="estado"][value="todas"]').checked = true;
    }

    function crearTarea(datos) {
        const tarea = Object.assign({ id: generarId(), completada: false, creada: Date.now() }, datos);
        tareas.push(tarea);
        idDestacada = tarea.id;

        // Si los filtros ocultarían la tarea nueva, se quitan para que se vea.
        if (!coincideConFiltros(tarea)) limpiarFiltros();

        formulario.reset();
        limpiarErrores();
        campoTitulo.focus();
        persistir();
        avisar("Tarea agregada.");
    }

    function actualizarTarea(datos) {
        const tarea = tareas.find(function (t) { return t.id === idEditando; });
        if (!tarea) {
            cancelarEdicion();
            return;
        }

        Object.assign(tarea, datos);
        idDestacada = tarea.id;
        salirDeEdicion();
        persistir();
        avisar("Cambios guardados.");
    }

    function cambiarEstado(id, completada) {
        const tarea = tareas.find(function (t) { return t.id === id; });
        if (!tarea) return;

        tarea.completada = completada;
        idEnfocar = id;
        persistir();
        avisar(completada ? "Tarea completada." : "Tarea marcada como pendiente.");
    }

    // Reinserta tareas eliminadas en su posición original.
    function restaurar(elementos) {
        elementos
            .slice()
            .sort(function (a, b) { return a.indice - b.indice; })
            .forEach(function (item) {
                tareas.splice(Math.min(item.indice, tareas.length), 0, item.tarea);
            });
        persistir();
        avisar(elementos.length === 1 ? "Tarea restaurada." : "Tareas restauradas.");
    }

    function eliminarTarea(id) {
        const indice = tareas.findIndex(function (t) { return t.id === id; });
        if (indice < 0) return;

        const quitada = tareas.splice(indice, 1)[0];
        if (idEditando === id) salirDeEdicion();
        persistir();

        avisar("Tarea eliminada.", {
            accion: function () { restaurar([{ tarea: quitada, indice: indice }]); }
        });
    }

    function borrarCompletadas() {
        const quitadas = [];
        tareas = tareas.filter(function (tarea, indice) {
            if (!tarea.completada) return true;
            quitadas.push({ tarea: tarea, indice: indice });
            return false;
        });

        if (!quitadas.length) {
            avisar("No hay tareas completadas para borrar.");
            return;
        }

        if (idEditando && !tareas.some(function (t) { return t.id === idEditando; })) {
            salirDeEdicion();
        }
        persistir();

        const n = quitadas.length;
        avisar(n + " " + plural(n, "tarea eliminada", "tareas eliminadas") + ".", {
            accion: function () { restaurar(quitadas); }
        });
    }

    function cargarEjemplos() {
        const enDias = function (n) {
            const fecha = hoyLocal();
            fecha.setDate(fecha.getDate() + n);
            return fechaISO(fecha);
        };

        const ejemplos = [
            ["Exposición sobre la Revolución Industrial", "Ana Torres", "Historia", "alta", 2, false],
            ["Informe del laboratorio de química", "Luis Quispe", "Ciencias", "media", 5, true],
            ["Maquetar la página de inicio", "Camila Rojas", "Programación web", "alta", -1, false],
            ["Resolver la práctica de álgebra", "Diego Salas", "Matemática", "baja", 9, false],
            ["Reunión de coordinación del equipo", "Ana Torres", "Proyecto", "media", 0, false]
        ];

        const ahora = Date.now();
        ejemplos.forEach(function (datos, posicion) {
            tareas.push({
                id: generarId(),
                titulo: datos[0],
                responsable: datos[1],
                materia: datos[2],
                prioridad: datos[3],
                fecha: enDias(datos[4]),
                completada: datos[5],
                creada: ahora - posicion * 1000
            });
        });

        persistir();
        avisar("Se cargaron " + ejemplos.length + " tareas de ejemplo.");
    }

    function exportar() {
        if (!tareas.length) return;

        const contenido = JSON.stringify({
            aplicacion: "AulaTask",
            version: 1,
            exportado: new Date().toISOString(),
            tareas: tareas
        }, null, 2);

        const blob = new Blob([contenido], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "aulatask-" + fechaISO(new Date()) + ".json";
        document.body.append(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

        avisar("Archivo exportado.");
    }

    async function importar(archivo) {
        try {
            if (archivo.size > TAMANO_MAXIMO_IMPORTACION) throw new Error("Archivo demasiado grande");

            const datos = JSON.parse(await archivo.text());
            const importadas = sanear(Array.isArray(datos) ? datos : datos.tareas)
                .map(function (tarea) { return Object.assign(tarea, { id: generarId() }); });

            if (!importadas.length) throw new Error("Sin tareas válidas");

            tareas.push(...importadas);
            persistir();
            avisar(importadas.length + " " + plural(importadas.length, "tarea importada", "tareas importadas") + ".");
        } catch (error) {
            avisar("No se pudo importar. Elige un archivo .json exportado desde AulaTask.", { error: true });
        } finally {
            archivoImportar.value = "";
        }
    }

    /* ---------- Tema ---------- */
    const consultaOscuro = window.matchMedia("(prefers-color-scheme: dark)");

    function temaActual() {
        return document.documentElement.dataset.tema || (consultaOscuro.matches ? "oscuro" : "claro");
    }

    function actualizarBotonTema() {
        const oscuro = temaActual() === "oscuro";
        // Los elementos SVG no tienen la propiedad .hidden; se usa el atributo.
        iconoLuna.toggleAttribute("hidden", oscuro);
        iconoSol.toggleAttribute("hidden", !oscuro);
        botonTema.setAttribute("aria-label", oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
    }

    /* ---------- 8. Eventos e inicio ---------- */
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const datos = leerFormulario();
        if (!validar(datos)) return;

        if (idEditando) {
            actualizarTarea(datos);
        } else {
            crearTarea(datos);
        }
    });

    formulario.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && idEditando) cancelarEdicion();
    });

    campoTitulo.addEventListener("input", function () {
        if (campoTitulo.hasAttribute("aria-invalid")) marcarCampo(campoTitulo, errorTitulo, "");
    });

    campoResponsable.addEventListener("input", function () {
        if (campoResponsable.hasAttribute("aria-invalid")) marcarCampo(campoResponsable, errorResponsable, "");
    });

    botonCancelar.addEventListener("click", cancelarEdicion);

    campoBusqueda.addEventListener("input", function () {
        vista.busqueda = campoBusqueda.value;
        renderizarLista();
    });

    document.querySelectorAll('input[name="estado"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            vista.estado = radio.value;
            renderizarLista();
        });
    });

    filtroPrioridad.addEventListener("change", function () {
        vista.prioridad = filtroPrioridad.value;
        renderizarLista();
    });

    selectorOrden.addEventListener("change", function () {
        vista.orden = selectorOrden.value;
        renderizarLista();
    });

    vacioAccion.addEventListener("click", function () {
        if (accionVacio) accionVacio();
    });

    botonExportar.addEventListener("click", exportar);
    botonImportar.addEventListener("click", function () { archivoImportar.click(); });
    archivoImportar.addEventListener("change", function () {
        if (archivoImportar.files[0]) importar(archivoImportar.files[0]);
    });
    botonBorrarCompletadas.addEventListener("click", borrarCompletadas);

    botonTema.addEventListener("click", function () {
        const nuevo = temaActual() === "oscuro" ? "claro" : "oscuro";
        document.documentElement.dataset.tema = nuevo;
        try {
            localStorage.setItem(CLAVE_TEMA, nuevo);
        } catch (error) { /* sin almacenamiento: el tema dura solo esta sesión */ }
        actualizarBotonTema();
    });

    consultaOscuro.addEventListener("change", actualizarBotonTema);

    // Atajo: "/" lleva el foco al buscador.
    document.addEventListener("keydown", function (evento) {
        const destino = evento.target;
        const escribiendo = destino instanceof HTMLElement &&
            (destino.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName));

        if (evento.key === "/" && !escribiendo && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
            evento.preventDefault();
            campoBusqueda.focus();
        }
    });

    // Sincroniza varias pestañas abiertas a la vez.
    window.addEventListener("storage", function (evento) {
        if (evento.key !== CLAVE_DATOS) return;
        tareas = cargar();
        if (idEditando && !tareas.some(function (t) { return t.id === idEditando; })) {
            salirDeEdicion();
        }
        renderizar();
    });

    // Al volver a la pestaña se recalculan los plazos (por ejemplo, tras cambiar de día).
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) renderizar();
    });

    tareas = cargar();
    actualizarBotonTema();
    renderizar();
})();
