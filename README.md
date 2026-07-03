# Asistente Vilamarina

Asistente de redacción impulsado por IA para gestionar la comunicación del Centro Vilamarina.

## 🚀 Demo

**URL:** [https://aminepm.github.io/redactor/](https://aminepm.github.io/redactor/)

## ✨ Características

- **📝 Redacción de Emails**: Genera emails profesionales para proveedores, operarios o equipos de seguridad
- **⚠️ Partes de Incidencia**: Crea registros formales de incidencias del centro
- **🔧 Autorizaciones de Operario**: Genera permisos de acceso para trabajos
- **📢 Comunicados Internos**: Redacta mensajes para el personal del centro
- **🎨 Interfaz Moderna**: Diseño oscuro con tema naranja y azul
- **🔐 Privacidad**: Tu API Key se guarda solo en tu navegador

## 🛠️ Tecnologías

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Hugging Face Inference API
- GitHub Pages

## 💻 Instalación

### Opción 1: Usar la versión en línea

Simplemente visita [https://aminepm.github.io/redactor/](https://aminepm.github.io/redactor/)

### Opción 2: Ejecutar localmente

1. Clona este repositorio:
```bash
git clone https://github.com/Aminepm/redactor.git
cd redactor
```

2. Abre `index.html` en tu navegador

## 🔑 Configuración de la API Key

1. Ve a [Hugging Face](https://huggingface.co/settings/tokens)
2. Crea un nuevo token de acceso
3. Haz clic en el badge de estado en la esquina superior derecha
4. Pega tu token (debe empezar con `hf_`)
5. Haz clic en "Conectar"

🔒 **Tu API Key se guarda únicamente en tu navegador (localStorage), nunca se envía a ningún servidor excepto a Hugging Face.**

## 📚 Uso

1. **Conecta tu API Key** haciendo clic en el badge de la esquina superior derecha
2. **Selecciona una herramienta** (Email, Incidencia, Autorización, o Comunicado)
3. **Rellena el formulario** con los datos necesarios
4. **Haz clic en "Generar"** para crear el texto
5. **Copia el resultado** con el botón "Copiar"

## 📝 Estructura del Proyecto

```
redactor/
├── index.html          # Estructura HTML
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
└── README.md           # Documentación
```

## 🌐 Navegadores Compatibles

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 👥 Autor

**Amine**
- GitHub: [@Aminepm](https://github.com/Aminepm)

## 📜 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propias necesidades.

## 🚀 Roadmap

- [ ] Añadir plantillas personalizables
- [ ] Soporte para múltiples idiomas
- [ ] Exportar a PDF
- [ ] Historial de textos generados
- [ ] Modo claro/oscuro

## ❓ Preguntas Frecuentes

**¿La API Key es segura?**
Sí, se guarda solo en tu navegador y nunca se envía a ningún servidor excepto a Hugging Face.

**¿Puedo usar otro modelo de IA?**
Actualmente está configurado para usar Meta-Llama-3-8B-Instruct, pero puedes modificar el código para usar otros modelos compatibles con Hugging Face.

**¿Cómo elimino mi API Key?**
Haz clic en el badge de estado y luego en "Eliminar".

---

Hecho con ❤️ para el Centro Vilamarina
