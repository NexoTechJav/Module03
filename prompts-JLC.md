# Prompt: Análisis e implementación de "Añadir Candidato al Sistema"

---

## Contexto

> **Rol:** Actúa como un arquitecto de software senior.

Estoy trabajando sobre el repositorio **LTI** ya arrancado en local. La historia de usuario a implementar es:

---

## Historia de Usuario

**"Añadir Candidato al Sistema"**

- **Como** reclutador,
- **Quiero** tener la capacidad de añadir candidatos al sistema ATS,
- **Para que** pueda gestionar sus datos y procesos de selección de manera eficiente.

---

## Criterios de Aceptación

1. Debe haber un **botón o enlace visible** para añadir un nuevo candidato desde el dashboard principal del reclutador.
2. Al seleccionar la opción, debe mostrarse un **formulario** con los siguientes campos:
   - Nombre
   - Apellido
   - Correo electrónico
   - Teléfono
   - Dirección
   - Educación
   - Experiencia laboral
3. El formulario debe **validar datos obligatorios** y el formato correcto del email.
4. Debe permitir **cargar el CV** en formato `PDF` o `DOCX`.
5. Al guardar, debe mostrarse una **confirmación de éxito**.
6. Si hay errores, debe mostrarse un **mensaje adecuado** al usuario.
7. La funcionalidad debe ser **usable en distintos dispositivos y navegadores**.

---

## Solicitud

Quiero que primero **analices el proyecto actual** y me propongas un **plan de implementación en orden lógico**, separado en:

- 🗄️ Base de datos
- ⚙️ Backend
- 🖥️ Frontend
- ✅ Validaciones
- 🧪 Pruebas manuales

Indica también:
- Qué **archivos existentes** revisarías.
- Qué **archivos nuevos** crees que habrá que crear.

> **Prioriza mantener consistencia con la estructura actual del proyecto.**
>
> ⚠️ **No programes todavía.**

Implementemos ahora solo el ticket de base de datos.

Analiza el proyecto y propón el modelo Prisma necesario para soportar la creación de candidatos con estos campos:

- `firstName`
- `lastName`
- `email`
- `phone`
- `address`
- `education`
- `workExperience`
- `cvFileName` o equivalente
- `createdAt` / `updatedAt` si encaja con el estilo del proyecto

Quiero:

1. Explicación breve de decisiones de modelado
2. Código exacto para `schema.prisma`
3. Comando de migración a ejecutar
4. Cómo verificar que la tabla se creó correctamente

No avances a backend ni frontend todavía.

Vamos a implementar ahora SOLO el Ticket Backend para "Añadir candidato".

Contexto del proyecto:
- Backend en Express + TypeScript + Prisma + PostgreSQL.
- Ya existe el modelo Candidate en schema.prisma.
- La historia es solo de alta de candidato, no edición.
- POST /api/candidates debe crear un candidato nuevo.
- Si el email ya existe, debe responder 409 Conflict.
- El CV es opcional.
- Si se sube CV, debe aceptarse solo PDF o DOCX y máximo 5MB.
- La petición debe ser multipart/form-data.
- El frontend corre en http://localhost:3000, así que hay que configurar CORS.
- Respeta la estructura actual del proyecto. No inventes una arquitectura nueva si el backend actual es simple.

Quiero que:
1. analices el backend actual
2. me digas qué archivos crear o modificar
3. implementes el código exacto
4. uses multer para la subida de archivos
5. configures cors
6. añadas validación de campos obligatorios y formato de email
7. devuelvas respuestas claras:
   - 201 si crea
   - 409 si email duplicado
   - 400 si validación falla
   - 500 si hay error inesperado

No implementes frontend todavía.
Quiero también una explicación breve de cómo probar el endpoint manualmente.

Vamos a implementar ahora SOLO el Ticket Frontend para "Añadir candidato".

Contexto del proyecto:
- Frontend en React (Create React App)
- Backend ya implementado en http://localhost:3010
- Endpoint disponible: POST /api/candidates
- El endpoint espera multipart/form-data
- El campo de fichero es "cv"
- El CV es opcional
- Si el email ya existe devuelve 409
- Validaciones ya existen en backend

Requisitos:
1. Añadir botón visible "Añadir candidato" en la pantalla principal
2. Mostrar formulario con campos:
   - firstName
   - lastName
   - email
   - phone
   - address
   - education
   - workExperience
3. Permitir subir archivo CV (PDF o DOCX)
4. Validaciones en cliente:
   - campos obligatorios
   - email válido
   - tamaño CV <= 5MB
5. Enviar datos usando FormData a /api/candidates
6. Mostrar:
   - mensaje éxito si 201
   - mensaje error si 400 o 409
7. No implementar edición, solo creación

Quiero:
1. qué archivos modificar o crear
2. código exacto
3. cómo conectar con backend
4. cómo probar manualmente cada caso

No toques backend.