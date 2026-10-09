# Política de Seguridad

## Versiones soportadas

Se da soporte a la versión en desarrollo del proyecto (`1.x`).

| Versión | Soportada |
| ------- | --------- |
| 1.x     | Sí        |

## Cómo reportar una vulnerabilidad

**No abras un issue público** para reportar un problema de seguridad. Reportalo
de forma privada usando los
[Security Advisories](https://docs.github.com/en/code-security/security-advisories)
de GitHub, o contactando al maintainer a través de su perfil.

Incluí, si podés:

- descripción del problema y su impacto,
- pasos para reproducirlo,
- versión/commit afectado,
- y, opcionalmente, una sugerencia de mitigación.

Se acusará recibo y se trabajará en un fix en un plazo razonable.

## Medidas ya aplicadas

- **Validación de entrada** con `ValidationPipe` en modo `whitelist` y
  `forbidNonWhitelisted` (evita mass assignment).
- **Headers de seguridad** con `helmet` y `x-powered-by` deshabilitado.
- **Límite de tamaño de body** (16kb) para reducir superficie de DoS.
- **Swagger deshabilitado en producción** (no expone el inventario de la API).
- **Errores sin filtrar internals**: los 5xx responden un mensaje genérico; el
  stack y los detalles quedan solo en los logs del servidor.
- **Correlación de requests** con `x-request-id` (en logs y en el body de error).
- **Configuración por variables de entorno**; no hay secretos en el repositorio.
- **Dependencias auditadas** (`npm audit` sin vulnerabilidades conocidas).

## Fuera de alcance (roadmap)

- Autenticación y autorización (JWT + roles).
- Rate limiting en endpoints de lectura.
- CORS explícito si se integra un front en otro origen.
