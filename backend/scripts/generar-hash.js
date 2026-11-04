/* ==========================================================================
   generar-hash.js - Genera el hash bcrypt para usuarios.password_hash
   Uso:  npm run hash -- miClave123
   ========================================================================== */

import bcrypt from "bcryptjs";

const clave = process.argv[2];

if (!clave) {
    console.log("Uso: npm run hash -- <contraseña>");
    process.exit(1);
}

console.log(bcrypt.hashSync(clave, 10));
