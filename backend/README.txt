# TraderCopilot

_Asistente de trading impulsado por IA para traders que quieren pensar en estrategias, no en cables._

TraderCopilot es un backend de análisis técnico y generación de señales, apoyado en modelos LLM y un “cerebro” modular de contexto por activo. El objetivo del proyecto es construir un **copiloto de trading** serio y evaluable, capaz de:

- Generar señales cuantificables (modo LITE).
- Producir análisis profesionales y explicables (modo PRO).
- Actuar como asesor táctico alrededor de tus posiciones (modo ADVISOR).
- Registrar y evaluar de forma automática el rendimiento de las señales.

Este repositorio contiene el **backend oficial** y la lógica central del producto, incluyendo API REST, sistema de logging, evaluación de señales y las bases del sistema RAG de contexto por token.

---

## 🧭 Visión del producto

El propósito de TraderCopilot no es “adivinar el futuro”, sino:

1. **Estandarizar el análisis técnico**: misma estructura, mismo nivel de profundidad, para cada señal.
2. **Reducir ruido y sesgos**: el LLM trabaja con reglas y contexto predefinido, no con impulsos emocionales.
3. **Ser verificable**: cada señal LITE puede ser evaluada automáticamente y registrada, construyendo un histórico real de aciertos/errores.
4. **Servir como interfaz inteligente** entre:
   - Datos de mercado (precio, indicadores, sentimiento).
   - Estrategias cuantitativas (via `trading_lab` y otros módulos).
   - El trader humano que toma la decisión final.

La idea central: **un copiloto que te hable en “idioma trader”**, pero con disciplina de máquina.

---

## ✨ Funcionalidades clave (estado actual del MVP v0.7.0)

### 1. API de análisis por modos

- `LITE` – Señales rápidas, cuantificables y evaluables.
- `PRO` – Análisis estructurado y profundo, con bloques claramente diferenciados (contexto, técnico, plan, insight, parámetros).
- `ADVISOR` – Modo conversacional de asesoramiento (diseñado para acompañar decisiones del trader).

Cada modo tiene su propia lógica de prompt y de logging.

---

### 2. Sistema de logging y evaluación

TraderCopilot registra las señales en CSV por **modo** y por **token**, con una estructura tipo:

- `backend/logs/LITE/eth.csv`
- `backend/logs/PRO/btc.csv`
- `backend/logs/ADVISOR/sol.csv`

Características:

- Cada señal incluye:
  - Timestamp.
  - Token.
  - Timeframe.
  - Texto de la señal o análisis.
  - Parámetros clave (TP, SL, tipo de operación, etc. según el modo).

Además, existe un módulo de evaluación (LITE):

- Evalúa automáticamente las señales LITE pasada cierta ventana de tiempo.
- Recupera el precio actual.
- Calcula la variación vs TP/SL.
- Marca la señal como “correcta/incorrecta” según las reglas definidas.
- Guarda los resultados en archivos `.evaluated.csv`.

Esto sienta las bases para:

- Estadísticas de performance.
- Integración con dashboards.
- Informes automáticos.

---

### 3. Sistema RAG de contexto por token (`brain/`)

TraderCopilot incorpora un sistema de contexto modular por activo (tokens, índices, etc.), pensado como:

- `brain/eth/…`
- `brain/btc/…`
- `brain/sol/…`

Dentro de cada carpeta de token pueden existir archivos como:

- `insights.md` – Observaciones estructurales sobre el activo (comportamiento típico, rangos relevantes, etc.).
- `news.txt` – Noticias recientes o contexto macro relevante.
- `onchain.txt` – Datos on-chain clave (para cripto).
- `sentiment.txt` – Lectura de sentimiento de mercado.

Este contenido se integra en el prompt del modelo para enriquecer el análisis.  
El diseño está pensado para:

- Empezar con contenido “hardcodeado” (estático) al inicio.
- Evolucionar hacia fuentes dinámicas (APIs de noticias, datos on-chain, feeds externos).

---

### 4. Integración con Telegram (enfoque producto real)

TraderCopilot está diseñado para integrarse con un bot de Telegram (por ejemplo, `@traderCopilot_bot`):

- Endpoint `/notify/telegram` en el backend para enviar mensajes al chat configurado.
- El objetivo es usar Telegram como **canal de entrega** de señales:
  - Señales LITE enviadas como mensajes estructurados.
  - Análisis PRO enviados como bloques markdown legibles.
  - Alertas y notificaciones automatizadas.

⚠️ Por motivos de seguridad, los tokens reales de Telegram se definen vía `.env` y **no** deben subirse al repo.

---

### 5. Preparación para integración con laboratorio cuantitativo (`trading_lab`)

TraderCopilot está pensado para integrarse con un proyecto paralelo tipo `trading_lab`, que se encarga de:

- Calcular indicadores (RSI, EMA, MACD, Bollinger, ATR, etc.).
- Ejecutar backtests sobre datos históricos.
- Validar estrategias (por ejemplo, combinaciones RSI+MACD+volumen).

La idea a medio plazo:

- TraderCopilot consume outputs de estos modelos cuantitativos.
- Los incorpora en el prompt del LLM.
- Y genera análisis/planes basados en datos reales, no solo en “intuición de modelo”.

---

## 🧱 Arquitectura general

A alto nivel:

- **Backend FastAPI**
  - Endpoints `/analyze/*` por modo.
  - Endpoint `/notify/telegram`.
  - Endpoints `/logs/{token}/{mode}` para servir históricos.
- **Sistema de contexto `brain/`**
  - Archivo por token / tipo de información.
  - Inyectado dinámicamente en los prompts.
- **Modelo LLM externo**
  - Cliente configurable (DeepSeek, OpenAI u otro proveedor compatible).
  - Key definida vía `.env`.
- **Logs + Evaluación**
  - CSVs por token/modo.
  - Evaluador automático para señales LITE.
- **Clientes externos**
  - Bot de Telegram.
  - Aplicación móvil / frontend (fuera de este repo, pero prevista en el roadmap).

---

## 🛠️ Stack tecnológico

- **Lenguaje:** Python 3.11+
- **Framework web:** FastAPI
- **Servidor ASGI:** Uvicorn
- **ORM / Base de datos:** actualmente enfoque ligero (CSV/archivos); DB local opcional vía SQLite
- **Formato de logs:** CSV (estructura simple y fácil de consumir desde otras herramientas)
- **Mensajería:** Telegram Bot API
- **Integración con LLM:** cliente HTTP hacia proveedor externo (DeepSeek/OpenAI/otros)
- **Scripts auxiliares:** PowerShell para:
  - Levantar entorno de desarrollo (`tools/start_dev.ps1`).
  - Manejo de backups/versiones.
  - Automatizar tareas de mantenimiento.

---

## ⚙️ Configuración y variables de entorno

En la carpeta `backend/` se utiliza un archivo `.env` (no incluido en el repo por seguridad).

Ejemplo de `.env`:

DEEPSEEK_API_KEY=sk_tu_api_key_aqui  
TRADERCOPILOT_BOT_TOKEN=1234567890:AA...tu_token_de_telegram...  
TELEGRAM_CHAT_ID=130261699  
DB_PATH=backend/data/signalbot.db  
CACHE_TTL_SEC=120  
RATE_LIMIT_PER_MIN=30  

Notas:

- `DEEPSEEK_API_KEY` (o equivalente) apunta al proveedor LLM que se quiera usar.
- `TRADERCOPILOT_BOT_TOKEN` es el token del bot de Telegram.
- `TELEGRAM_CHAT_ID` puede ser un chat privado o un grupo/canal.
- `DB_PATH` puede usarse para una futura persistencia más robusta.
- `CACHE_TTL_SEC` y `RATE_LIMIT_PER_MIN` ayudan a controlar:
  - Cache interna de respuestas/datos.
  - Límite de peticiones por minuto para evitar abusos o costes inesperados.

---

## 🚀 Puesta en marcha local

### 1. Clonar el repositorio

    git clone https://github.com/tsmluky/TraderCopilot.git
    cd TraderCopilot/backend

### 2. Crear entorno virtual

    python -m venv .venv
    .venv\Scripts\activate  # en Windows

### 3. Instalar dependencias

    pip install -r requirements.txt

*(Si el proyecto incluye un script PowerShell `tools/start_dev.ps1`, se puede usar para levantar todo con una sola orden.)*

### 4. Configurar `.env`

Crear el archivo `.env` en `backend/` con las claves necesarias:

- API del modelo LLM.
- Token del bot de Telegram.
- Chat ID de test.

### 5. Ejecutar el servidor

Desde `backend/`:

    uvicorn main:app --reload --port 8010

El backend debería quedar disponible en:

- `http://127.0.0.1:8010/health` → comprobación rápida.
- `http://127.0.0.1:8010/docs` → documentación interactiva Swagger.

---

## 🔌 Endpoints principales (resumen)

- `GET /health`  
  Devuelve `{ "ok": true }` para comprobar que el servicio está vivo.

- `POST /analyze/lite`  
  Entrada: token, timeframe, parámetros básicos.  
  Salida: señal clara y cuantificable (tipo “BUY/SELL”, TP/SL, comentario breve).  
  Cada llamada se registra en logs por token.

- `POST /analyze/pro`  
  Entrada: token, timeframe, mensaje del usuario.  
  Salida: bloque de análisis estructurado para lectura profesional y posterior renderizado (por ejemplo, en una app móvil o web).

- `POST /analyze/advisor`  
  Entrada: contexto + mensaje del usuario.  
  Salida: respuesta tipo “asesor personal”, apoyada en contexto y reglas configuradas.

- `POST /notify/telegram`  
  Entrada: texto (y, en el futuro, plantillas de mensaje).  
  Salida: envío del mensaje al chat configurado en `.env`.

- `GET /logs/{token}/{mode}`  
  Devuelve el histórico de señales para ese token y modo, listo para ser consumido por un frontend o por herramientas de análisis.

*(Los nombres exactos de los endpoints pueden variar ligeramente según la versión; ver `/docs` del servidor en tu entorno.)*

---

## 🗺️ Roadmap (alto nivel)

La planificación evolutiva de TraderCopilot se estructura en versiones con sentido de negocio:

### v0.7.x – MVP Backend sólido (estado actual)

- Backend estable (`/analyze` por modos).
- Logging por token y modo.
- Evaluación automática de señales LITE.
- Integración básica con Telegram.
- Sistema `brain/` operativo en tokens clave.

### v0.8 – Integración cuantitativa y métricas

- Integración formal con `trading_lab` u otro motor de backtesting.
- Exposición de endpoints para:
  - Estadísticas de performance de señales.
  - Métricas de riesgo (drawdown, winrate, profit factor).
- Informe periódico (semanal/mensual) auto-generado.

### v0.9 – Experiencia de usuario (frontend / Telegram avanzado)

- Plantillas de mensajes ricas para Telegram (markdown, emojis, layouts claros).
- Frontend web/móvil ligero para:
  - Ver histórico.
  - Filtrar por token/modo.
  - Explorar resultados evaluados.
- Perfiles básicos de usuario y preferencias.

### v1.0 – Producto listo para monetizar

- Estructura de planes (free / premium).
- Hardening de seguridad y límites de uso.
- Observabilidad y logging de producción.
- Documentación robusta para usuarios y contribuidores.

---

## 🤝 Contribuir

Aunque el enfoque principal del proyecto es construir un producto real y monetizable, se mantiene una filosofía cercana al open source:

- Sugerencias de arquitectura.
- Mejoras de prompts y estructura de análisis.
- Integraciones con nuevas APIs de datos (precios, indicadores, sentimiento).
- Ideas para visualizar y explotar los logs y evaluaciones.

Si quieres proponer cambios:

1. Haz un fork del repo.
2. Crea una rama descriptiva (`feat/nuevo-modo`, `fix/logging-evaluated`, etc.).
3. Abre un Pull Request explicando:
   - El problema que resuelves.
   - La solución propuesta.
   - Cómo probarla.

---

## 📄 Licencia

La licencia concreta puede definirse en función de la estrategia de negocio del proyecto.  
Por defecto, considera que **no tienes permiso para usar TraderCopilot como producto comercial directo sin autorización explícita**, aunque revisar el código, aprender de él y sugerir mejoras es bienvenido.

---

## 🧩 Filosofía de diseño

TraderCopilot se construye con estos principios:

- **Primero robustez, luego glamour.**  
  Antes de interfaces vistosas: señales correctas, evaluables y loggeadas.

- **Cero magia negra.**  
  El LLM se usa como capa de interpretación y lenguaje, pero siempre con datos y contexto acotado.

- **Metric-driven.**  
  Cada señal registrada y evaluada es un dato más para entender si el sistema funciona.

- **Escalabilidad mental.**  
  El sistema está pensado para que tú puedas crecer como trader junto con él: no para sustituirte, sino para multiplicar tu capacidad de análisis.

---

Si estás leyendo esto desde el repo de GitHub, estás viendo uno de los checkpoints del camino.  
La meta: que TraderCopilot sea tu **copiloto de confianza** cuando te sientes delante del gráfico.
