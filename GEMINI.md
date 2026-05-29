# Reglas de Arquitectura del Proyecto (Boutique Estefany)

1. **Arquitectura Empresarial Estricta:** 
   - **Prohibido acoplar lógica de datos en los componentes.** 
   - Las pantallas (`src/screens`) y componentes (`src/components`) son exclusivamente para la capa de presentación (UI).
2. **Separación de Responsabilidades:**
   - **`src/services/`**: Funciones puras que realizan las llamadas HTTP (Axios, Firebase, etc.). Ninguna librería de estado o UI debe vivir aquí.
   - **`src/hooks/`**: Custom hooks (ej. React Query, Zustand) que consumen los servicios, manejan la caché y el ciclo de vida de los datos, y los exponen a la UI.
   - **`src/screens/`**: Solo importan los custom hooks. No deben tener endpoints quemados ni importar `axios` directamente.
3. **Gestor de Paquetes:** Uso exclusivo de `pnpm`.
