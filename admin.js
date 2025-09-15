const API_URL = 'https://68c7ab8e5d8d9f5147328241.mockapi.io/dispositivos_echaderos';

const dispositivoForm = document.getElementById('dispositivoForm');
const tablaDispositivos = document.getElementById('tablaDispositivos');
const btnCancelar = document.getElementById('btnCancelar');
const selectTipo = document.getElementById('tipo');
const selectEstado = document.getElementById('estado');

let editando = false;
let dispositivoEditId = null;

// Configurar opciones de estado según el tipo de dispositivo
function configurarOpcionesEstado(tipo) {
    // Limpiar opciones actuales
    selectEstado.innerHTML = '';
    
    let opciones = [];
    
    if (tipo === 'luces') {
        opciones = [
            { value: 'apagado', text: 'Apagado' },
            { value: 'encendido', text: 'Encendido' },
            { value: 'automatico', text: 'Automático' }
        ];
    } else if (tipo === 'llenado_piletas') {
        opciones = [
            { value: 'apagado', text: 'Vacío' },
            { value: 'encendido', text: 'Lleno' },
            { value: 'automatico', text: 'Automático' }
        ];
    } else if (tipo === 'verificacion_pesebres') {
        opciones = [
            { value: 'apagado', text: 'Vacío' },
            { value: 'encendido', text: 'Lleno' },
            { value: 'automatico', text: 'Monitoreando' }
        ];
    } else {
        // Opciones por defecto para tipos desconocidos
        opciones = [
            { value: 'apagado', text: 'Apagado/Desactivado' },
            { value: 'encendido', text: 'Encendido/Activado' },
            { value: 'automatico', text: 'Automático' }
        ];
    }
    
    // Agregar las opciones al select
    opciones.forEach(opcion => {
        const option = document.createElement('option');
        option.value = opcion.value;
        option.textContent = opcion.text;
        selectEstado.appendChild(option);
    });
}

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
        
        tablaDispositivos.innerHTML = '';
        
        if (dispositivos.length === 0) {
            tablaDispositivos.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay dispositivos registrados</td>
                </tr>
            `;
            return;
        }
        
        dispositivos.forEach(dispositivo => {
            const fila = document.createElement('tr');
            
            let badgeClass = '';
            let estadoTexto = '';
            
            if (dispositivo.tipo === 'luces') {
                estadoTexto = dispositivo.estado === 'encendido' ? 'Encendido' : 
                             dispositivo.estado === 'apagado' ? 'Apagado' : 'Automático';
                badgeClass = dispositivo.estado === 'encendido' ? 'bg-success' : 
                            dispositivo.estado === 'apagado' ? 'bg-danger' : 'bg-warning';
            } else if (dispositivo.tipo === 'llenado_piletas') {
                estadoTexto = dispositivo.estado === 'encendido' ? 'Lleno' : 
                             dispositivo.estado === 'apagado' ? 'Vacío' : 'Automático';
                badgeClass = dispositivo.estado === 'encendido' ? 'bg-success' : 
                            dispositivo.estado === 'apagado' ? 'bg-danger' : 'bg-warning';
            } else if (dispositivo.tipo === 'verificacion_pesebres') {
                estadoTexto = dispositivo.estado === 'encendido' ? 'Lleno' : 
                             dispositivo.estado === 'apagado' ? 'Vacío' : 'Monitoreando';
                badgeClass = dispositivo.estado === 'encendido' ? 'bg-success' : 
                            dispositivo.estado === 'apagado' ? 'bg-danger' : 'bg-warning';
            } else {
                estadoTexto = dispositivo.estado || 'Desconocido';
                badgeClass = 'bg-secondary';
            }
            
            fila.innerHTML = `
                <td>${dispositivo.nombre}</td>
                <td>${obtenerNombreTipo(dispositivo.tipo)}</td>
                <td><span class="badge ${badgeClass}">${estadoTexto}</span></td>
                <td>${dispositivo.ubicacion}</td>
                <td>${dispositivo.ultima_actualizacion || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1 editar-btn" data-id="${dispositivo.id}">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger eliminar-btn" data-id="${dispositivo.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            
            tablaDispositivos.appendChild(fila);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.editar-btn').forEach(btn => {
            btn.addEventListener('click', editarDispositivo);
        });
        
        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', eliminarDispositivo);
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

// Agregar o editar dispositivo
async function guardarDispositivo(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo').value;
    const estado = document.getElementById('estado').value;
    const ubicacion = document.getElementById('ubicacion').value;
    
    if (!nombre || !tipo || !estado || !ubicacion) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    const dispositivo = {
        nombre,
        tipo,
        estado,
        ubicacion,
        ip: '192.168.1.1', // IP por defecto
        ultima_actualizacion: obtenerFechaActual()
    };
    
    try {
        let response;
        
        if (editando) {
            response = await fetch(`${API_URL}/${dispositivoEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dispositivo)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dispositivo)
            });
        }
        
        if (response.ok) {
            alert(editando ? 'Dispositivo actualizado correctamente' : 'Dispositivo agregado correctamente');
            dispositivoForm.reset();
            cancelarEdicion();
            cargarDispositivos();
        } else {
            throw new Error('Error al guardar el dispositivo');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el dispositivo');
    }
}

// Editar dispositivo
async function editarDispositivo(event) {
    const id = event.target.closest('.editar-btn').dataset.id;
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const dispositivo = await response.json();
        
        document.getElementById('dispositivoId').value = dispositivo.id;
        document.getElementById('nombre').value = dispositivo.nombre;
        document.getElementById('tipo').value = dispositivo.tipo;
        
        // Configurar las opciones de estado según el tipo
        configurarOpcionesEstado(dispositivo.tipo);
        document.getElementById('estado').value = dispositivo.estado;
        
        document.getElementById('ubicacion').value = dispositivo.ubicacion;
        
        document.getElementById('btnGuardar').textContent = 'Actualizar Dispositivo';
        btnCancelar.style.display = 'block';
        
        editando = true;
        dispositivoEditId = id;
        
        // Scroll al formulario
        document.getElementById('dispositivoForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error al cargar dispositivo para editar:', error);
        alert('Error al cargar el dispositivo');
    }
}

// Eliminar dispositivo
async function eliminarDispositivo(event) {
    const id = event.target.closest('.eliminar-btn').dataset.id;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Dispositivo eliminado correctamente');
            cargarDispositivos();
        } else {
            throw new Error('Error al eliminar el dispositivo');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el dispositivo');
    }
}

// Cancelar edición
function cancelarEdicion() {
    dispositivoForm.reset();
    document.getElementById('dispositivoId').value = '';
    document.getElementById('btnGuardar').textContent = 'Guardar Dispositivo';
    btnCancelar.style.display = 'none';
    editando = false;
    dispositivoEditId = null;
    
    // Restablecer opciones por defecto
    configurarOpcionesEstado('');
}

// Event listeners
dispositivoForm.addEventListener('submit', guardarDispositivo);
btnCancelar.addEventListener('click', cancelarEdicion);
selectTipo.addEventListener('change', function() {
    configurarOpcionesEstado(this.value);
});

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar opciones iniciales
    configurarOpcionesEstado('');
    cargarDispositivos();
});