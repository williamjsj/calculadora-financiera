document.addEventListener('DOMContentLoaded', () => {
    const formTasa = document.getElementById('form-tasa');
    const formPrestamo = document.getElementById('form-prestamo');
    const btnCalcularTasa = document.getElementById('btn-calcular-tasa');
    const btnCalcularPrestamo = document.getElementById('btn-calcular-prestamo');
    const moneyInputs = document.querySelectorAll('.money-input');
    const percentageInput = document.getElementById('tasa-prestamo');

    // Muestra el formulario correcto al hacer clic en los botones
    btnCalcularTasa.addEventListener('click', () => {
        formPrestamo.style.display = 'none';
        formTasa.style.display = 'block';
        limpiarCampos();
    });

    btnCalcularPrestamo.addEventListener('click', () => {
        formTasa.style.display = 'none';
        formPrestamo.style.display = 'block';
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

    // Formato automático para porcentaje con símbolo %
    if (percentageInput) {
        percentageInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/[^0-9.]/g, '');
            e.target.value = valor ? `${valor}%` : '';
        });
    }
});

/**
 * Función para limpiar y convertir una cadena de texto a un número flotante.
 * Elimina puntos de miles y reemplaza la coma decimal por un punto.
 * @param {string} str - La cadena de texto a limpiar.
 * @returns {number} El número flotante limpio.
 */
function limpiarNumero(str) {
    if (typeof str !== 'string') return NaN;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

// Función para calcular la tasa de interés (método de Newton-Raphson)
function calcularTasa() {
    const prestamo = limpiarNumero(document.getElementById('prestamo-tasa').value);
    const tiempo = parseInt(document.getElementById('tiempo-tasa').value);
    const cuota = limpiarNumero(document.getElementById('cuota-tasa').value);

    if (isNaN(prestamo) || isNaN(tiempo) || isNaN(cuota) || prestamo <= 0 || tiempo <= 0 || cuota <= 0) {
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
    
    const resultadoMensual = (tasa * 100).toFixed(2);
    const resultadoAnual = (tasaAnual * 100).toFixed(2);
    
    mostrarResultado(`
        <p>La tasa de interés efectiva mensual es: **${resultadoMensual}%**</p>
        <p>La tasa de interés efectiva anual es: **${resultadoAnual}%**</p>
    `);
}

// Función para calcular el monto del préstamo
function calcularPrestamo() {
    const cuota = limpiarNumero(document.getElementById('cuota-prestamo').value);
    const tasa = limpiarNumero(document.getElementById('tasa-prestamo').value) / 100;
    const tiempo = parseInt(document.getElementById('tiempo-prestamo').value);

    if (isNaN(cuota) || isNaN(tasa) || isNaN(tiempo) || cuota <= 0 || tasa <= 0 || tiempo <= 0) {
        mostrarResultado("Por favor, ingresa valores válidos.");
        return;
    }
    
    const prestamo = cuota * ((1 - Math.pow(1 + tasa, -tiempo)) / tasa);
    
    const prestamoFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(prestamo);
    
    mostrarResultado(`El monto de préstamo que te pueden otorgar es: **${prestamoFormateado}**`);
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
}
