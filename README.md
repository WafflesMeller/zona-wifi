# 📡 Zona Wi-Fi - Project Roadmap

> **Sistema de gestión de Hotspot** para venta de fichas Wi-Fi automatizadas mediante Pago Móvil, con verificación en tiempo real y sincronización con MikroTik.

## 🛠 Stack Tecnológico

| Área | Tecnología |
|------|------------|
| **Frontend** | Vite + React + TypeScript + Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Edge Functions/RPC) |
| **Infraestructura** | MikroTik hEX + Starlink |

---

## 📅 Fase 1: Base de Datos (Supabase)
*El corazón del sistema. Donde se guarda el dinero y los tickets.*

- [x] **Crear Tabla `transacciones_inju`**: Registro de todos los pagos móviles recibidos (Webhook o Manual).
- [x] **Crear Tabla `ventas_wifi`**: Registro de los tickets generados y entregados al cliente.
- [x] **Crear Índices**: `idx_referencia_search` para búsquedas rápidas de los últimos 4 dígitos.
- [x] **Función RPC `procesar_venta_wifi`**: Lógica que verifica el pago y genera el ticket.
- [ ] **Configurar RLS (Row Level Security)**:
    - [ ] Política para que `ventas_wifi` sea legible por el público (para consultar su tiempo).
    - [ ] Política para que `transacciones_inju` sea privada (solo accesible vía función RPC o Admin).

---

## 🎨 Fase 2: Configuración del Proyecto (Frontend)
*El esqueleto de la aplicación web.*

- [ ] **Inicializar Proyecto Vite**:
    ```bash
    npm create vite@latest macuto-wifi -- --template react-ts
    ```
- [ ] **Instalar Tailwind CSS**: Configurar `postcss.config.js` y `tailwind.config.js`.
- [ ] **Instalar Librerías Clave**:
    - `@supabase/supabase-js` (Conexión BD).
    - `react-router-dom` (Navegación).
    - `lucide-react` (Iconos).
    - `date-fns` (Manejo de fechas y tiempos).
- [ ] **Estructura de Carpetas**:
    - `/src/pages/public` (Vista Cliente).
    - `/src/pages/admin` (Vista Operador).
    - `/src/components` (Botones, Inputs, Cards).
    - `/src/hooks` (Lógica de tiempo y base de datos).

---

## 📱 Fase 3: Interfaz Pública (El Cliente)
*Lo que ve la persona que compra el Wi-Fi en su teléfono.*

### 3.1. Página de Inicio y Pago (`/`)
- [ ] **Diseño de Planes**: Cards grandes con Precio y Duración.
    - *1 Hora x 1$*
    - *3 Horas x 2$*
    - *5 Horas x 3$*
- [ ] **Datos Bancarios**: Sección visual con el número de teléfono y C.I. para realizar el Pago Móvil.
- [ ] **Formulario de Registro y Validación**:
    *Campos necesarios para asociar la venta al usuario.*
    - Input: **Nombre y Apellido**.
    - Input: **Número de Teléfono** (Ej: 0412...).
    - Input: **Cédula de Identidad**.
    - Input: **Últimos 4 dígitos de referencia** (Del pago móvil).
- [ ] **Botón de Acción**: "Verificar y Conectar"
    - *Lógica*: Llama a la función `procesar_venta_wifi` enviando: `referencia`, `cedula`, `nombre`, `telefono` y `plan_id`.

### 3.2. Página de Estado (`/status`)
- [ ] **Persistencia**: Guardar el código generado en `localStorage` para que si recargan la página, no se pierda.
- [ ] **Contador Regresivo (Timer)**:
    - Calcular: *Hora Inicio + Plan - Hora Actual*.
    - Mostrar: "Te quedan HH:MM:SS".
- [ ] **Estado "Finalizado"**:
    - Cuando el tiempo llegue a 0.
    - Mostrar aviso: "Tu tiempo ha terminado".
    - Botón: "Comprar más tiempo" (Redirige al inicio).
*Lo que ve la persona que compra el Wi-Fi en su teléfono.*

### 3.1. Página de Inicio y Pago (`/`)
- [ ] **Diseño de Planes**: Cards grandes con Precio y Duración (1h, 3h, 5h).
- [ ] **Datos Bancarios**: Sección visual con el número de teléfono y C.I. para el Pago Móvil.
- [ ] **Formulario de Validación**:
    - Input para "Últimos 4 dígitos de referencia".
    - Input para "Cédula" (Opcional, para registro).
- [ ] **Botón de Acción**: "Verificar y Conectar" (Llama a la función `procesar_venta_wifi`).

### 3.2. Página de Estado (`/status`)
- [ ] **Persistencia**: Guardar el código generado en `localStorage` para evitar pérdida de datos al recargar.
- [ ] **Contador Regresivo (Timer)**:
    - Calcular: *Hora Inicio + Plan - Hora Actual*.
    - Mostrar: "Te quedan HH:MM:SS".
- [ ] **Estado "Finalizado"**:
    - Trigger: Cuando el tiempo llegue a 0.
    - Mostrar aviso: "Tu tiempo ha terminado".
    - Botón: "Comprar más tiempo" (Redirige al inicio).

---

## 🛡️ Fase 4: Panel Administrativo (El Operador)
*Tu herramienta de control.*

### 4.1. Autenticación (`/admin/login`)
- [ ] **Login Simple**: Correo y Contraseña (Usando Supabase Auth).
- [ ] **Protección de Rutas**: Middleware para evitar acceso a `/admin/dashboard` sin sesión activa.

### 4.2. Dashboard Principal (`/admin/dashboard`)
- [ ] **Resumen en Vivo**: Cards con métricas:
    - "Usuarios Activos".
    - "Ventas del Día (Bs y $)".
    - "Tickets Totales".
- [ ] **Lista de Activos**: Tabla mostrando quién está conectado y tiempo restante.

### 4.3. Reporte Manual de Pagos (`/admin/reportar`)
*Para contingencias (efectivo o fallos de webhook).*
- [ ] **Formulario Manual**:
    - Campos: Referencia (completa o 4 dígitos), Monto, Banco.
    - Acción: Insertar directo en la tabla `transacciones_inju`.
    - *Nota:* Esto habilita el canje normal del ticket en el "Inicio Público".

---

## 🔗 Fase 5: Integración MikroTik (El Router)
*Hacer que el internet funcione.*

- [ ] **API Endpoint (Edge Function o Vercel Route)**:
    - Crear ruta `/api/get-tickets`.
    - Consultar `ventas_wifi` (últimas 24h).
    - Formatear salida texto plano: `codigo,plan;codigo,plan`.
- [ ] **Script MikroTik**:
    - Copiar script de "Fetch & Sync".
    - Configurar Scheduler para ejecución cada 30-60 segundos.# zona-wifi
# zona-wifi
# zona-wifi


:local apiUrl "https://tu-dominio.vercel.app/api/get-tickets?key=CLAVE_SECRETA"
:local result ""

:do {
    :set result ([/tool fetch url=$apiUrl mode=https http-method=get keep-result=no as-value output=user]->"data")
} on-error={
    :log error "InjuWifi: Error conectando con API"
}

:if ([:len $result] > 0 && $result != "none" && $result != "error") do={

    :local content $result

    :while ([:len $content] > 0) do={

        :local semiPos [:find $content ";"]
        :local ticket ""

        :if ([:type $semiPos] = "num") do={
            :set ticket [:pick $content 0 $semiPos]
            :set content [:pick $content ($semiPos + 1) [:len $content]]
        } else={
            :set ticket $content
            :set content ""
        }

        :local commaPos [:find $ticket ","]
        :if ([:type $commaPos] = "num") do={

            :local userCode [:pick $ticket 0 $commaPos]
            :local userPlan [:pick $ticket ($commaPos + 1) [:len $ticket]]

            # Evitar duplicados
            :if ([:len [/ip hotspot user find name=$userCode]] = 0) do={

                :do {
                    /ip hotspot user add name=$userCode password=$userCode profile=$userPlan server="hotspot1"
                    :log info ("InjuWifi: Ticket creado -> " . $userCode . " / " . $userPlan)
                } on-error={
                    :log error ("InjuWifi: Perfil no existe -> " . $userPlan)
                }

            }

        }

    }

}
