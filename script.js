document.addEventListener('DOMContentLoaded', () => {
    const formTasa = document.getElementById('form-tasa');
    const formPrestamo = document.getElementById('form-prestamo');
    const formCuota = document.getElementById('form-cuota');
    const btnCalcularTasa = document.getElementById('btn-calcular-tasa');
    const btnCalcularPrestamo = document.getElementById('btn-calcular-prestamo');
    const btnCalcularCuota = document.getElementById('btn-calcular-cuota');
    const moneyInputs = document.querySelectorAll('.money-input');
    const percentageInputs = document.querySelectorAll('.percentage-input');

    // Muestra el formulario correcto al hacer clic en los botones
    btnCalcularTasa.addEventListener('click', () => {
        formPrestamo.style.display = 'none';
        formCuota.style.display = 'none';
        formTasa.style.display = 'block';
        limpiarCampos();
    });

    btnCalcularPrestamo.addEventListener('click', () => {
        formTasa.style.display = 'none';
        formCuota.style.display = 'none';
        formPrestamo.style.display = 'block';
        limpiarCampos();
    });
    
    btnCalcularCuota.addEventListener('click', () => {
        formTasa.style.display = 'none';
        formPrestamo.style.display = 'none';
        formCuota.style.display = 'block';
        limpiarCampos();
    });

    // Formato automático para dinero con separadores de miles
    moneyInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^0-9]/g, '');
            if (valor) {
                e.target.value = new Intl.NumberFormat('es-CO').format(valor);
            }
        });
    });

    // Formato automático para porcentaje con coma decimal
    percentageInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Permitir números, coma decimal y borrado
            let valor = e.target.value.replace(/[^0-9,]/g, '');
            
            // Reemplazar múltiples comas por una sola
            valor = valor.replace(/,+/g, ',');
            
            // Limitar a una coma decimal
            const partes = valor.split(',');
            if (partes.length > 2) {
                valor = partes[0] + ',' + partes.slice(1).join('');
            }
            
            e.target.value = valor;
        });
        
        // Agregar el símbolo % al perder el foco
        input.addEventListener('blur', (e) => {
            if (e.target.value && !e.target.value.includes('%')) {
                e.target.value = e.target.value + '%';
            }
        });
        
        // Quitar el símbolo % al obtener el foco para edición
        input.addEventListener('focus', (e) => {
            e.target.value = e.target.value.replace('%', '');
        });
    });
});

/**
 * Función para limpiar y convertir una cadena de texto a un número flotante.
 * Elimina puntos de miles y reemplaza la coma decimal por un punto.
 * @param {string} str - La cadena de texto a limpiar.
 * @returns {number} El número flotante limpio.
 */
function limpiarNumero(str) {
    if (typeof str !== 'string') return NaN;
    
    // Eliminar símbolo % si está presente
    let valorLimpio = str.replace('%', '');
    
    // Reemplazar coma decimal por punto y eliminar separadores de miles
    valorLimpio = valorLimpio.replace(/\./g, '').replace(',', '.');
    
    return parseFloat(valorLimpio);
}

/**
 * Aplica clases de error a un elemento de input y su label asociado.
 * @param {HTMLElement} element - El elemento de input al que se le aplicará el error.
 */
function aplicarError(element) {
    element.classList.add('error-input');
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
        label.classList.add('error-label');
    }
}

/**
 * Limpia las clases de error de todos los inputs y labels.
 */
function limpiarErrores() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('error-input'));
    const labels = document.querySelectorAll('label');
    labels.forEach(label => label.classList.remove('error-label'));
}

// Función para calcular la tasa de interés (método de Newton-Raphson)
function calcularTasa() {
    limpiarErrores();
    const prestamo = limpiarNumero(document.getElementById('prestamo-tasa').value);
    const tiempo = parseInt(document.getElementById('tiempo-tasa').value);
    const cuota = limpiarNumero(document.getElementById('cuota-tasa').value);

    let valido = true;
    if (isNaN(prestamo) || prestamo <= 0) {
        aplicarError(document.getElementById('prestamo-tasa'));
        valido = false;
    }
    if (isNaN(tiempo) || tiempo <= 0) {
        aplicarError(document.getElementById('tiempo-tasa'));
        valido = false;
    }
    if (isNaN(cuota) || cuota <= 0) {
        aplicarError(document.getElementById('cuota-tasa'));
        valido = false;
    }

    if (!valido) {
        mostrarResultado("Por favor, ingresa valores válidos.");
        return;
    }

    let tasa = 0.05;
    const tolerancia = 0.000001;
    let iteraciones = 0;

    while (iteraciones < 100) {
        const f_i = prestamo - (cuota * (1 - Math.pow(1 + tasa, -tiempo)) / tasa);
        
        const f_prime_i = (cuota / (tasa * tasa)) * ( (1 - Math.pow(1 + tasa, -tiempo)) - (tiempo * tasa * Math.pow(1 + tasa, -tiempo - 1)));
        
        const nuevaTasa = tasa - (f_i / f_prime_i);
        
        if (Math.abs(nuevaTasa - tasa) < tolerancia) {
            tasa = nuevaTasa;
            break;
        }
        
        tasa = nuevaTasa;
        iteraciones++;
    }
    
    // Calculamos la Tasa Efectiva Anual (TEA)
    const tasaAnual = (Math.pow(1 + tasa, 12) - 1);
    
    const resultadoMensual = (tasa * 100).toFixed(2).replace('.', ',');
    const resultadoAnual = (tasaAnual * 100).toFixed(2).replace('.', ',');
    
    mostrarResultado(`
        <p>La tasa de interés efectiva mensual es: <strong>${resultadoMensual}%</strong></p>
        <p>La tasa de interés efectiva anual es: <strong>${resultadoAnual}%</strong></p>
    `);
}

// Función para calcular el monto del préstamo
function calcularPrestamo() {
    limpiarErrores();
    const cuota = limpiarNumero(document.getElementById('cuota-prestamo').value);
    const tasa = limpiarNumero(document.getElementById('tasa-prestamo').value) / 100;
    const tiempo = parseInt(document.getElementById('tiempo-prestamo').value);

    let valido = true;
    if (isNaN(cuota) || cuota <= 0) {
        aplicarError(document.getElementById('cuota-prestamo'));
        valido = false;
    }
    if (isNaN(tasa) || tasa <= 0) {
        aplicarError(document.getElementById('tasa-prestamo'));
        valido = false;
    }
    if (isNaN(tiempo) || tiempo <= 0) {
        aplicarError(document.getElementById('tiempo-prestamo'));
        valido = false;
    }

    if (!valido) {
        mostrarResultado("Por favor, ingresa valores válidos.");
        return;
    }
    
    const prestamo = cuota * ((1 - Math.pow(1 + tasa, -tiempo)) / tasa);
    
    const prestamoFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(prestamo);
    
    mostrarResultado(`El monto de préstamo que te pueden otorgar es: <strong>${prestamoFormateado}</strong>`);
}

// Función para calcular la cuota fija
function calcularCuota() {
    limpiarErrores();
    const prestamo = limpiarNumero(document.getElementById('prestamo-cuota').value);
    const tasaInput = limpiarNumero(document.getElementById('tasa-cuota').value);
    const tiempo = parseInt(document.getElementById('tiempo-cuota').value);
    
    const tipoTasa = document.querySelector('input[name="tasa-tipo"]:checked');

    let valido = true;
    let mensajeError = "Por favor, ingresa valores válidos.";

    if (isNaN(prestamo) || prestamo <= 0) {
        aplicarError(document.getElementById('prestamo-cuota'));
        valido = false;
    }
    if (isNaN(tasaInput) || tasaInput <= 0) {
        aplicarError(document.getElementById('tasa-cuota'));
        valido = false;
    }
    if (!tipoTasa) {
        const labels = document.querySelectorAll('label[for^="tasa-"]');
        labels.forEach(label => label.classList.add('error-label'));
        valido = false;
        mensajeError = "Debes seleccionar el período de tiempo de la tasa de interés (mensual o anual).";
    }
    if (isNaN(tiempo) || tiempo <= 0) {
        aplicarError(document.getElementById('tiempo-cuota'));
        valido = false;
    }

    if (!valido) {
        mostrarResultado(mensajeError);
        return;
    }

    let tasa;
    // Convertir la tasa de interés anual a mensual si es necesario
    if (tipoTasa.value === 'anual') {
        tasa = (Math.pow(1 + (tasaInput / 100), 1/12) - 1);
    } else {
        tasa = tasaInput / 100;
    }
    
    // Fórmula corregida para el cálculo de la cuota
    const cuota = (prestamo * tasa) / (1 - Math.pow(1 + tasa, -tiempo));
    
    const cuotaFormateada = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(cuota);
    
    mostrarResultado(`El valor de la cuota fija mensual es: <strong>${cuotaFormateada}</strong>`);
}

// Función para mostrar el resultado en la página
function mostrarResultado(mensaje) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = mensaje;
}

// Función para limpiar los campos al cambiar de opción
function limpiarCampos() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    document.getElementById('resultado').innerHTML = '';
    limpiarErrores();
}
