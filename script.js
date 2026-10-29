document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. ELEMENTOS DEL FORMULARIO
    // ==========================================
    const formulario = document.getElementById("form-hero-informes");
    const llegada = document.getElementById("info_fecha");
    const salida = document.getElementById("info_salida");
    const habitacion = document.getElementById("info_carrera");
    const personas = document.getElementById("info_personas");
    const nombre = document.getElementById("info_nombre");
    const apellido = document.getElementById("info_apellido");
    const correo = document.getElementById("info_email");
    const telefono = document.getElementById("info_telefono");
    const tipoViaje = document.getElementById("info_nivel");
    const comentarios = document.getElementById("info_comentarios");

    // ==========================================
    // 2. PRECIOS ESTIMADOS POR NOCHE
    // Puedes cambiar estos precios cuando quieras.
    // ==========================================
    const precios = {
        estandar: 800,
        doble: 1200,
        suite: 2000,
        familiar: 1800
    };

    const nombresHabitaciones = {
        estandar: "Habitación Estándar",
        doble: "Habitación Doble",
        suite: "Suite de Lujo",
        familiar: "Habitación Familiar"
    };

    // ==========================================
    // 3. FECHA MÍNIMA Y VALIDACIÓN DE FECHAS
    // ==========================================
    function fechaLocal() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    if (llegada && salida) {
        llegada.min = fechaLocal();
        salida.min = fechaLocal();

        llegada.addEventListener("change", function () {
            salida.min = llegada.value || fechaLocal();

            if (salida.value && salida.value <= llegada.value) {
                salida.value = "";
            }

            actualizarEstimacion();
        });

        salida.addEventListener("change", actualizarEstimacion);
    }

    // ==========================================
    // 4. CALCULAR NOCHES Y PRECIO ESTIMADO
    // ==========================================
    function calcularNoches() {
        if (!llegada.value || !salida.value) return 0;

        const fecha1 = new Date(llegada.value + "T00:00:00");
        const fecha2 = new Date(salida.value + "T00:00:00");

        return Math.round((fecha2 - fecha1) / 86400000);
    }

    function actualizarEstimacion() {
        let resumen = document.getElementById("resumen-estimacion");

        if (!resumen && formulario) {
            resumen = document.createElement("div");
            resumen.id = "resumen-estimacion";
            resumen.className = "resumen-hotel";
            formulario.appendChild(resumen);
        }

        if (!resumen) return;

        const noches = calcularNoches();
        const tipo = habitacion.value;
        const cantidad = Number(personas.value);
        const precio = precios[tipo];

        if (noches > 0 && precio && cantidad >= 1) {
            const total = noches * precio;

            resumen.innerHTML = `
                <h3>Resumen de tu estancia</h3>
                <p><strong>Habitación:</strong> ${nombresHabitaciones[tipo]}</p>
                <p><strong>Noches:</strong> ${noches}</p>
                <p><strong>Huéspedes:</strong> ${cantidad}</p>
                <p><strong>Precio por noche:</strong> ${formatearMoneda(precio)}</p>
                <p class="precio-total">
                    Total estimado: ${formatearMoneda(total)}
                </p>
                <small>Precio ilustrativo, sujeto a confirmación del hotel.</small>
            `;
            resumen.hidden = false;
        } else {
            resumen.innerHTML = `
                <h3>Calcula tu estancia</h3>
                <p>Selecciona la habitación, las fechas y el número de huéspedes para ver el precio estimado.</p>
            `;
            resumen.hidden = false;
        }
    }

    function formatearMoneda(cantidad) {
        return cantidad.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        });
    }

    if (habitacion) habitacion.addEventListener("change", actualizarEstimacion);
    if (personas) personas.addEventListener("input", actualizarEstimacion);

    actualizarEstimacion();

    // ==========================================
    // 5. VALIDAR Y MOSTRAR LA RESERVACIÓN
    // ==========================================
    if (formulario) {
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            if (!formulario.reportValidity()) return;

            const noches = calcularNoches();

            if (noches < 1) {
                alert("La fecha de salida debe ser posterior a la fecha de llegada.");
                salida.focus();
                return;
            }

            const total = noches * precios[habitacion.value];

            const datos = {
                nombre: `${nombre.value.trim()} ${apellido.value.trim()}`,
                correo: correo.value.trim(),
                telefono: telefono.value.trim(),
                viaje: tipoViaje.options[tipoViaje.selectedIndex].text,
                habitacion: nombresHabitaciones[habitacion.value],
                llegada: llegada.value,
                salida: salida.value,
                noches: noches,
                personas: personas.value,
                comentarios: comentarios.value.trim(),
                total: formatearMoneda(total)
            };

            // Crear una confirmación sin salir de la página.
            let confirmacion = document.getElementById("confirmacion-reserva");

            if (!confirmacion) {
                confirmacion = document.createElement("div");
                confirmacion.id = "confirmacion-reserva";
                confirmacion.className = "confirmacion-hotel";
                formulario.appendChild(confirmacion);
            }

            confirmacion.innerHTML = `
                <h3>¡Solicitud preparada!</h3>
                <p>Gracias, <strong>${escaparHTML(datos.nombre)}</strong>.</p>
                <p>Revisa los datos de tu estancia:</p>
                <ul>
                    <li><strong>Correo:</strong> ${escaparHTML(datos.correo)}</li>
                    <li><strong>Teléfono:</strong> ${escaparHTML(datos.telefono)}</li>
                    <li><strong>Tipo de viaje:</strong> ${escaparHTML(datos.viaje)}</li>
                    <li><strong>Habitación:</strong> ${escaparHTML(datos.habitacion)}</li>
                    <li><strong>Llegada:</strong> ${escaparHTML(datos.llegada)}</li>
                    <li><strong>Salida:</strong> ${escaparHTML(datos.salida)}</li>
                    <li><strong>Noches:</strong> ${datos.noches}</li>
                    <li><strong>Huéspedes:</strong> ${datos.personas}</li>
                    <li><strong>Total estimado:</strong> ${datos.total}</li>
                    <li><strong>Comentarios:</strong> ${escaparHTML(datos.comentarios || "Sin comentarios")}</li>
                </ul>
                <p><strong>Nota:</strong> esta página es una demostración. La solicitud todavía no se ha enviado al hotel.</p>
                <button type="button" id="editar-reserva" class="btn-editar-reserva">
                    Editar mis datos
                </button>
            `;

            confirmacion.hidden = false;
            confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });

            document.getElementById("editar-reserva").addEventListener("click", function () {
                formulario.scrollIntoView({ behavior: "smooth", block: "start" });
                nombre.focus();
            });
        });
    }

    // Evita que el texto introducido por el visitante se interprete como HTML.
    function escaparHTML(texto) {
        return String(texto).replace(/[&<>"']/g, function (caracter) {
            const entidades = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };
            return entidades[caracter];
        });
    }

    // ==========================================
    // 6. CARRUSEL DEL PERSONAL
    // ==========================================
    const personal = document.getElementById("teachers-track");
    const anterior = document.getElementById("btn-prev");
    const siguiente = document.getElementById("btn-next");

    function moverPersonal(direccion) {
        if (!personal) return;

        const tarjeta = personal.querySelector(".teacher-card");
        const distancia = tarjeta
            ? tarjeta.getBoundingClientRect().width + 20
            : 280;

        personal.scrollBy({
            left: direccion * distancia,
            behavior: "smooth"
        });
    }

    if (anterior) {
        anterior.addEventListener("click", function () {
            moverPersonal(-1);
        });
    }

    if (siguiente) {
        siguiente.addEventListener("click", function () {
            moverPersonal(1);
        });
    }

    // ==========================================
    // 7. EFECTO DE APARICIÓN DE LAS TARJETAS
    // ==========================================
    const tarjetas = document.querySelectorAll(
        ".career-card, .teacher-card, .convenio-card"
    );

    tarjetas.forEach(function (tarjeta, indice) {
        tarjeta.style.animationDelay = `${(indice % 4) * 0.08}s`;
    });

    // ==========================================
    // 8. ACTUALIZAR AÑO DEL PIE DE PÁGINA
    // ==========================================
    const pie = document.querySelector(".footer-info p");

    if (pie) {
        pie.textContent = `Hotel Brisa Dorada © ${new Date().getFullYear()}`;
    }

});