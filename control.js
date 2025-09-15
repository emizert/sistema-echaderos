const API_URL = 'https://68c7ab8e5d8d9f5147328241.mockapi.io/dispositivos_echaderos';
const dispositivosContainer = document.getElementById('dispositivosContainer');

// Obtener la fecha y hora actual
function obtenerFechaActual() {
    const opciones = {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const fecha = new Date();
    return new Intl.DateTimeFormat('es-MX', opciones).format(fecha);
}

// Cargar dispositivos
async function cargarDispositivos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Verificar si la respuesta es un array
        const dispositivos = Array.isArray(data) ? data : [data];
        
        dispositivosContainer.innerHTML = '';
        
        if (dispositivos.length === 0) {
            dispositivosContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">No hay dispositivos registrados</div>
                </div>
            `;
            return;
        }
        
        dispositivos.forEach(dispositivo => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            
            let icono = '';
            let estadosPersonalizados = [];
            
            if (dispositivo.tipo === 'luces') {
                icono = 'fa-lightbulb';
                estadosPersonalizados = [
                    { valor: 'apagado', texto: 'Apagado' },
                    { valor: 'encendido', texto: 'Encendido' },
                    { valor: 'automatico', texto: 'Automático' }
                ];
            } else if (dispositivo.tipo === 'llenado_piletas') {
                icono = 'fa-faucet';
                estadosPersonalizados = [
                    { valor: 'apagado', texto: 'Vacío' },
                    { valor: 'encendido', texto: 'Lleno' },
                    { valor: 'automatico', texto: 'Automático' }
                ];
            } else if (dispositivo.tipo === 'verificacion_pesebres') {
                icono = 'fa-warehouse';
                estadosPersonalizados = [
                    { valor: 'apagado', texto: 'Vacío' },
                    { valor: 'encendido', texto: 'Lleno' },
                    { valor: 'automatico', texto: 'Monitoreando' }
                ];
            } else {
                icono = 'fa-microchip';
                estadosPersonalizados = [
                    { valor: 'apagado', texto: 'Apagado' },
                    { valor: 'encendido', texto: 'Encendido' },
                    { valor: 'automatico', texto: 'Automático' }
                ];
            }
            
            // Encontrar el estado actual para marcar el radio button correcto
            let estadoActual = dispositivo.estado || 'apagado';
            
            col.innerHTML = `
                <div class="card dispositivo-card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fa-solid ${icono}"></i> ${dispositivo.nombre}
                        </h5>
                        <span class="badge bg-secondary">${obtenerNombreTipo(dispositivo.tipo)}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Ubicación:</strong> ${dispositivo.ubicacion}</p>
                        <p class="card-text"><strong>IP:</strong> ${dispositivo.ip || 'N/A'}</p>
                        <p class="card-text"><strong>Última actualización:</strong><br>${dispositivo.ultima_actualizacion || 'N/A'}</p>
                        
                        <div class="mb-3">
                            <label class="form-label"><strong>Estado:</strong></label>
                            ${estadosPersonalizados.map((estado, index) => `
                                <div class="form-check">
                                    <input class="form-check-input estado-radio" type="radio" 
                                        name="estado-${dispositivo.id}" 
                                        id="${estado.valor}-${dispositivo.id}" 
                                        value="${estado.valor}" 
                                        ${estadoActual === estado.valor ? 'checked' : ''}>
                                    <label class="form-check-label" for="${estado.valor}-${dispositivo.id}">
                                        ${estado.texto}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary w-100 actualizar-btn" data-id="${dispositivo.id}">
                            <i class="fa-solid fa-refresh"></i> Actualizar Estado
                        </button>
                    </div>
                </div>
            `;
            
            dispositivosContainer.appendChild(col);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.actualizar-btn').forEach(btn => {
            btn.addEventListener('click', actualizarEstado);
        });
    } catch (error) {
        console.error('Error al cargar dispositivos:', error);
        alert('Error al cargar los dispositivos');
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

// Actualizar estado del dispositivo
async function actualizarEstado(event) {
    const id = event.target.closest('.actualizar-btn').dataset.id;
    const estadoSeleccionado = document.querySelector(`input[name="estado-${id}"]:checked`).value;
    
    try {
        // Primero obtener el dispositivo actual
        const response = await fetch(`${API_URL}/${id}`);
        const dispositivo = await response.json();
        
        // Actualizar solo el estado y la fecha
        const dispositivoActualizado = {
            ...dispositivo,
            estado: estadoSeleccionado,
            ultima_actualizacion: obtenerFechaActual()
        };
        
        const updateResponse = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dispositivoActualizado)
        });
        
        if (updateResponse.ok) {
            alert('Estado actualizado correctamente');
            cargarDispositivos();
        } else {
            throw new Error('Error al actualizar el estado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el estado');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarDispositivos);