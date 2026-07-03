let apiKey = localStorage.getItem('vilamarina_hf_apikey');
let currentTool = 'email';
let widgetOpen = false;

function toggleApiWidget() {
    widgetOpen = !widgetOpen;
    document.getElementById('apiWidgetBody').classList.toggle('open', widgetOpen);
    document.getElementById('apiChevron').textContent = widgetOpen ? '⌵' : '›';
}

function updateApiStatus(connected) {
    const widget = document.getElementById('apiWidget');
    document.getElementById('apiStatusIcon').textContent = connected ? '✅' : '❌';
    document.getElementById('apiWidgetTitle').textContent = connected ? 'API Key Conectada' : 'API Key No conectada';
    document.getElementById('apiWidgetSubtitle').textContent = connected ? 'Hugging Face activo y listo para usar' : 'Haz clic para introducir tu token de Hugging Face';
    widget.classList.toggle('connected', connected);
    if (connected) document.getElementById('apiKeyInput').value = apiKey;
}

function saveApiKey() {
    const val = document.getElementById('apiKeyInput').value.trim();
    if (!val.startsWith('hf_') || val.length < 20) {
        showToast('El token no parece válido. Debe empezar por hf_...', true);
        return;
    }
    apiKey = val;
    localStorage.setItem('vilamarina_hf_apikey', apiKey);
    updateApiStatus(true);
    showToast('Token guardado correctamente.');
}

function disconnectApi() {
    apiKey = null;
    localStorage.removeItem('vilamarina_hf_apikey');
    document.getElementById('apiKeyInput').value = '';
    updateApiStatus(false);
    showToast('Token eliminado.');
}

function selectTool(tool, el) {
    currentTool = tool;
    document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.form-panel').forEach(f => f.classList.remove('visible'));
    document.getElementById('form-' + tool).classList.add('visible');
}

function getPrompt(tool) {
    if (tool === 'email') {
        return `Redacta un email profesional en español. Destinatario: ${v('email-destinatario')}. Asunto: ${v('email-asunto')}. Tono: ${v('email-tono')}. Contexto: ${v('email-contexto')}. Devuelve solo el texto final del email, bien estructurado.`;
    }
    if (tool === 'incidencia') {
        return `Redacta un parte de incidencia formal y claro en español con estos datos. Fecha: ${v('inc-fecha')}. Zona: ${v('inc-zona')}. Descripción: ${v('inc-descripcion')}. Acciones realizadas: ${v('inc-acciones')}. Devuelve solo el texto final.`;
    }
    if (tool === 'autorizacion') {
        return `Redacta una autorización de acceso para operario en español. Empresa: ${v('aut-empresa')}. Operario: ${v('aut-operario')}. Trabajo: ${v('aut-trabajo')}. Fecha y horario: ${v('aut-fecha')}. Observaciones: ${v('aut-obs')}. Devuelve solo el texto final.`;
    }
    return `Redacta un comunicado interno profesional en español. Título: ${v('com-titulo')}. Audiencia: ${v('com-audiencia')}. Mensaje: ${v('com-mensaje')}. Devuelve solo el texto final.`;
}

function v(id) {
    return document.getElementById(id).value.trim();
}

async function generateText(tool) {
    if (!apiKey) {
        showToast('Primero conecta tu token de Hugging Face.', true);
        return;
    }
    const prompt = getPrompt(tool);
    const resultBox = document.getElementById('resultBox');
    const textEl = document.getElementById('resultContent');
    resultBox.classList.add('visible');
    textEl.textContent = 'Generando...';
    try {
        const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b:fireworks-ai',
                stream: true,
                max_tokens: 1000,
                messages: [
                    { role: 'system', content: 'Eres un asistente profesional para redactar comunicaciones claras, formales y útiles en español.' },
                    { role: 'user', content: prompt }
                ]
            })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || err.message || 'Error de API');
        }
        textEl.textContent = '';
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                try {
                    const json = JSON.parse(data);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) textEl.textContent += delta;
                } catch {}
            }
        }
        if (!textEl.textContent.trim()) textEl.textContent = 'No se recibió contenido del modelo.';
    } catch (err) {
        textEl.textContent = '';
        showToast(err.message || 'No se pudo generar el texto.', true);
    }
}

function clearForm(tool) {
    const map = {
        email: ['email-destinatario', 'email-asunto', 'email-tono', 'email-contexto'],
        incidencia: ['inc-fecha', 'inc-zona', 'inc-descripcion', 'inc-acciones'],
        autorizacion: ['aut-empresa', 'aut-operario', 'aut-trabajo', 'aut-fecha', 'aut-obs'],
        comunicado: ['com-titulo', 'com-audiencia', 'com-mensaje']
    };
    map[tool].forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
    });
}

async function copyResult() {
    const text = document.getElementById('resultContent').textContent.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    showToast('Texto copiado.');
}

function showToast(msg, error = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (error ? ' error' : '');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => t.className = 'toast', 2200);
}

updateApiStatus(!!apiKey);
