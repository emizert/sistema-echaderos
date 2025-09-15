const API_URL = 'https://68c7ab8e5d8d9f5147328241.mockapi.io/dispositivos_echaderos';
const estadoGrafico = document.getElementById('estadoGrafico');
const tablaMonitoreo = document.getElementById('tablaMonitoreo');
const contador = document.getElementById('contador');

// Variables para el polling
let intervalo;
let tiempoRestante = 2;

// Cargar dispositivos para monitoreo
async function cargarMonitoreo() {
    try {
        console.log("Solicitando datos a la API...");
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Datos recibidos de la API:", data);
        
        // Verificar si la respuesta es un array, si no lo es, convertirlo en array
        let dispositivos = [];
        if (Array.isArray(data)) {
            dispositivos = data;
        } else if (typeof data === 'object' && data !== null) {
            // Si es un objeto individual, convertirlo a array
            dispositivos = [data];
        } else {
            throw new Error('Formato de respuesta inesperado de la API');
        }
        
        console.log("Dispositivos procesados:", dispositivos);
        
        // Actualizar el estado gráfico
        actualizarEstadoGrafico(dispositivos);
        
        // Actualizar la tabla
        actualizarTablaMonitoreo(dispositivos);
        
    } catch (error) {
        console.error('Error al cargar monitoreo:', error);
        estadoGrafico.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> 
                    Error al cargar los dispositivos: ${error.message}
                </div>
            </div>
        `;
        tablaMonitoreo.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> 
                    Error al cargar datos: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Obtener nombre legible del tipo de dispositivo
function obtenerNombreTipo(tipo) {
    const tipos = {
        'luces': 'Control de Luces',
        'llenado_piletas': 'Llenado de Piletas',
        'verificacion_pesebres': 'Verificación de Pesebres'
    };
    return tipos[tipo] || tipo;
}

// Obtener texto legible del estado según el tipo de dispositivo
function obtenerTextoEstado(estado, tipo) {
    if (tipo === 'verificacion_pesebres') {
        return estado === 'encendido' ? 'Lleno' : 
               estado === 'apagado' ? 'Vacío' : 
               'Monitoreando';
    } else if (tipo === 'llenado_piletas') {
        return estado === 'encendido' ? 'Lleno' : 
               estado === 'apagado' ? 'Vacío' : 
               'Automático';
    } else if (tipo === 'luces') {
        return estado === 'encendido'
                return estado === 'encendido' ? 'Encendido' : 
               estado === 'apagado' ? 'Apagado' : 
               'Automático';
    } else {
        return estado || 'Desconocido';
    }
}

// Obtener clase CSS según el estado
function obtenerClaseEstado(estado, tipo) {
    if (estado === 'encendido' || estado === 'Lleno') {
        return 'bg-success';
    } else if (estado === 'apagado' || estado === 'Vacío') {
        return 'bg-danger';
    } else if (estado === 'automatico' || estado === 'Monitoreando' || estado === 'Automático') {
        return 'bg-warning';
    } else {
        return 'bg-secondary';
    }
}

// Actualizar el estado gráfico
function actualizarEstadoGrafico(dispositivos) {
    estadoGrafico.innerHTML = '';
    
    if (dispositivos.length === 0) {
        estadoGrafico.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fa-solid fa-info-circle"></i> 
                    No hay dispositivos registrados
                </div>
            </div>
        `;
        return;
    }
    
    dispositivos.forEach(dispositivo => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        let icono = '';
        if (dispositivo.tipo === 'luces') icono = 'fa-lightbulb';
        else if (dispositivo.tipo === 'llenado_piletas') icono = 'fa-faucet';
        else if (dispositivo.tipo === 'verificacion_pesebres') icono = 'fa-warehouse';
        else icono = 'fa-microchip';
        
        const estadoTexto = obtenerTextoEstado(dispositivo.estado, dispositivo.tipo);
        const estadoClass = obtenerClaseEstado(dispositivo.estado, dispositivo.tipo);
        
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <i class="fa-solid ${icono} fa-3x"></i>
                    </div>
                    <h5 class="card-title">${dispositivo.nombre || 'Dispositivo sin nombre'}</h5>
                    <p class="card-text"><small class="text-muted">${obtenerNombreTipo(dispositivo.tipo)}</small></p>
                    <div class="d-flex justify-content-center align-items-center">
                        <span class="estado-indicador ${estadoClass.replace('bg-', 'estado-')}"></span>
                        <span class="badge ${estadoClass}">${estadoTexto}</span>
                    </div>
                </div>
            </div>
        `;
        
        estadoGrafico.appendChild(col);
    });
}

// Actualizar la tabla de monitoreo
function actualizarTablaMonitoreo(dispositivos) {
    tablaMonitoreo.innerHTML = '';
    
    if (dispositivos.length === 0) {
        tablaMonitoreo.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <i class="fa-solid fa-info-circle"></i> 
                    No hay dispositivos registrados
                </td>
            </tr>
        `;
        return;
    }
    
    dispositivos.forEach(dispositivo => {
        const fila = document.createElement('tr');
        
        const estadoTexto = obtenerTextoEstado(dispositivo.estado, dispositivo.tipo);
        const estadoClass = obtenerClaseEstado(dispositivo.estado, dispositivo.tipo);
        
        fila.innerHTML = `
            <td>${dispositivo.nombre || 'Sin nombre'}</td>
            <td>${obtenerNombreTipo(dispositivo.tipo)}</td>
            <td><span class="badge ${estadoClass}">${estadoTexto}</span></td>
            <td>${dispositivo.ultima_actualizacion || dispositivo.fecha || 'N/A'}</td>
        `;
        
        tablaMonitoreo.appendChild(fila);
    });
}

// Iniciar el polling de actualización automática
function iniciarPolling() {
    clearInterval(intervalo); // Limpiar intervalo previo si existe
    
    intervalo = setInterval(() => {
        tiempoRestante--;
        
        if (contador) {
            contador.textContent = `Actualizando en: ${tiempoRestante}s`;
        }
        
        if (tiempoRestante <= 0) {
            console.log("Actualizando datos...");
            cargarMonitoreo();
            tiempoRestante = 2;
        }
    }, 1000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando sistema de monitoreo...");
    cargarMonitoreo();
    iniciarPolling();
});