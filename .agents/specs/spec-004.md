- crea un workflow para github actions
- debe ejecutarse ante cada pull request hacia master
- debe realizar un test y build, si falla no debe permitir el pull request
- debe dockerizar la aplicacion mediante el dockerfile que esta en el proyecto
- si falla alguna de las anteriores no debe permitir el pull request

---
### Resumen de Trabajo Realizado:
- Se implementó un flujo de integración continua (CI) utilizando GitHub Actions.
- El workflow está configurado en `.github/workflows/ci.yml` y se dispara en cada Pull Request a `master`.
- **Job `test-and-build`**: Ejecuta `npm install`, `npm run test` y `npm run build` para asegurar la calidad del código.
- **Job `dockerize`**: Valida el `Dockerfile` construyendo la imagen para garantizar que el contenedor sea funcional.
- Se agregó el archivo `.dockerignore` para optimizar el proceso de build.

**Justificación:** La integración de un sistema de CI garantiza que cada cambio propuesto sea validado automáticamente, evitando que código defectuoso llegue a la rama principal y asegurando que la imagen Docker esté siempre lista para producción.
