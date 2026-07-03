// Estado global
let apiKey = localStorage.getItem('vilamarina_hf_apikey');
let currentTool = 'email';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateApiStatus();
    selectTool('email', document.querySelector('.tool-card'));
});

// Funciones del Modal de API
function toggleApiModal() {
    const modal = document.getElementById('apiModal');
    modal.classList.toggle('show');
    
    if (modal.classList.contains('show')) {
        document.getElementById('apiKeyInput').value = apiKey || '';
    }
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput').value.trim();
    
    if (!input.startsWith('hf_') || input.length < 20) {
        showToast('❌ Token inválido. Debe empezar con "hf_"', true);
        return;
    }
    
    apiKey = input;
    localStorage.setItem('vilamarina_hf_apikey', apiKey);
    updateApiStatus();
    toggleApiModal();
    showToast('✅ API Key guardada correctamente');
}

function disconnectApi() {
    apiKey = null;
    localStorage.removeItem('vilamarina_hf_apikey');
    updateApiStatus();
    toggleApiModal();
    showToast('🔌 API Key eliminada');
}

function updateApiStatus() {
    const badge = document.getElementById('apiStatusBadge');
    const icon = document.getElementById('statusIcon');
    const text = document.getElementById('statusText');
    
    if (apiKey) {
        badge.classList.remove('disconnected');
        badge.classList.add('connected');
        icon.textContent = '✅';
        text.textContent = 'Conectada';
    } else {
        badge.classList.remove('connected');
        badge.classList.add('disconnected');
        icon.textContent = '❌';
        text.textContent = 'No conectada';
    }
}

// Selección de herramienta
function selectTool(tool, element) {
    currentTool = tool;
    
    // Actualizar tarjetas activas
    document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('active');
    });
    element.classList.add('active');
    
    // Ocultar todos los formularios
    document.querySelectorAll('.form-panel').forEach(panel => {
        panel.classList.remove('visible');
    });
    
    // Mostrar formulario seleccionado
    const panel = document.getElementById(`form-${tool}`);
    if (panel) {
        panel.classList.add('visible');
    }
    
    // Ocultar resultado
    document.getElementById('resultBox').classList.remove('visible');
}

// Limpiar formulario
function clearForm(tool) {
    const panel = document.getElementById(`form-${tool}`);
    if (!panel) return;
    
    // Limpiar todos los inputs y textareas
    panel.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.tagName === 'SELECT') {
            field.selectedIndex = 0;
        } else {
            field.value = '';
        }
    });
    
    showToast('🧹 Formulario limpiado');
}

// Generar texto
async function generateText(tool) {
    if (!apiKey) {
        showToast('⚠️ Primero conecta tu API Key', true);
        toggleApiModal();
        return;
    }
    
    const prompt = buildPrompt(tool);
    if (!prompt) {
        showToast('⚠️ Rellena todos los campos obligatorios', true);
        return;
    }
    
    const resultBox = document.getElementById('resultBox');
    const resultContent = document.getElementById('resultContent');
    
    resultContent.textContent = '⏳ Generando texto...';
    resultBox.classList.add('visible');
    
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const generatedText = data[0]?.generated_text || 'No se pudo generar el texto.';
        
        resultContent.textContent = generatedText.trim();
        showToast('✅ Texto generado correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        resultContent.textContent = '❌ Error al generar el texto. Verifica tu API Key y vuelve a intentarlo.';
        showToast('❌ Error en la generación', true);
    }
}

function buildPrompt(tool) {
    let prompt = '';
    
    switch(tool) {
        case 'email':
            const destinatario = document.getElementById('email-destinatario').value;
            const tono = document.getElementById('email-tono').value;
            const asunto = document.getElementById('email-asunto').value;
            const contexto = document.getElementById('email-contexto').value;
            
            if (!destinatario || !asunto || !contexto) return null;
            
            prompt = `Redacta un email profesional con las siguientes características:\n\nDestinatario: ${destinatario}\nTono: ${tono}\nAsunto: ${asunto}\nContexto: ${contexto}\n\nEl email debe ser claro, profesional y con el tono ${tono}. Incluye saludo, cuerpo del mensaje y despedida apropiados.`;
            break;
            
        case 'incidencia':
            const tipo = document.getElementById('inc-tipo').value;
            const ubicacion = document.getElementById('inc-ubicacion').value;
            const fecha = document.getElementById('inc-fecha').value;
            const descripcion = document.getElementById('inc-descripcion').value;
            
            if (!tipo || !descripcion) return null;
            
            prompt = `Redacta un parte de incidencia formal con los siguientes datos:\n\nTipo de incidencia: ${tipo}\nUbicación: ${ubicacion || 'No especificada'}\nFecha y hora: ${fecha || 'Ahora'}\nDescripción: ${descripcion}\n\nEl parte debe ser claro, formal y completo.`;
            break;
            
        case 'autorizacion':
            const operario = document.getElementById('aut-operario').value;
            const empresa = document.getElementById('aut-empresa').value;
            const trabajo = document.getElementById('aut-trabajo').value;
            const fechaAut = document.getElementById('aut-fecha').value;
            const duracion = document.getElementById('aut-duracion').value;
            
            if (!operario || !trabajo) return null;
            
            prompt = `Redacta una autorización formal para un operario con los siguientes datos:\n\nNombre del operario: ${operario}\nEmpresa: ${empresa || 'No especificada'}\nTrabajo a realizar: ${trabajo}\nFecha: ${fechaAut || 'A especificar'}\nDuración estimada: ${duracion || 'A determinar'}\n\nLa autorización debe ser formal y completa.`;
            break;
            
        case 'comunicado':
            const titulo = document.getElementById('com-titulo').value;
            const audiencia = document.getElementById('com-audiencia').value;
            const mensaje = document.getElementById('com-mensaje').value;
            
            if (!titulo || !mensaje) return null;
            
            prompt = `Redacta un comunicado interno con las siguientes características:\n\nTítulo: ${titulo}\nAudiencia: ${audiencia || 'Todo el personal'}\nMensaje principal: ${mensaje}\n\nEl comunicado debe ser claro, profesional y bien estructurado.`;
            break;
    }
    
    return prompt;
}

// Copiar resultado
function copyResult() {
    const resultContent = document.getElementById('resultContent').textContent;
    
    if (resultContent.includes('Generando') || resultContent.includes('Error')) {
        showToast('⚠️ No hay texto para copiar', true);
        return;
    }
    
    navigator.clipboard.writeText(resultContent).then(() => {
        showToast('📋 Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showToast('❌ Error al copiar', true);
    });
}

// Mostrar toast
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    if (isError) toast.classList.add('toast_error');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }, 3000);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('apiModal');
    if (e.target === modal) {
        toggleApiModal();
    }
});
