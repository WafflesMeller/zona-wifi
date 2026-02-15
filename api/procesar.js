// -----------------------------------------------------------------
// 3. PREPARAR PAYLOAD (AJUSTADO A transacciones_inju)
// -----------------------------------------------------------------

let payloadDB = {};

if (procesado) {
    payloadDB = {
        referencia: data.referencia,
        monto: Number(data.monto.toFixed(2)), // numeric(10,2)
        banco_origen: data.banco,
        estado: 'pendiente'
        // created_at se genera solo
        // id se genera solo
    };
} else {
    // Si no se pudo procesar el formato
    const refError = `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    payloadDB = {
        referencia: refError,
        monto: 0,
        banco_origen: 'DESCONOCIDO',
        estado: 'pendiente'
    };
}

// -----------------------------------------------------------------
// 4. GUARDAR EN SUPABASE (TABLA CORRECTA)
// -----------------------------------------------------------------

const guardarConReintentos = async (intentosMaximos = 3) => {
    for (let i = 1; i <= intentosMaximos; i++) {
        try {
            const { error } = await supabase
                .from('transacciones_inju') // 👈 TABLA CORRECTA
                .insert([payloadDB]); // insert siempre como array

            if (!error) return { exito: true };

            // Código PostgreSQL para violación UNIQUE
            if (error.code === '23505') {
                return { exito: false, esDuplicado: true };
            }

            throw error;

        } catch (err) {
            if (i === intentosMaximos) {
                return { exito: false, esDuplicado: false, error: err };
            }

            await new Promise(resolve => setTimeout(resolve, 1000 * i));
        }
    }
};

const resultado = await guardarConReintentos();

// -----------------------------------------------------------------
// 5. RESPUESTA
// -----------------------------------------------------------------

if (resultado.exito) {
    console.log(`✅ Transacción guardada: ${payloadDB.referencia}`);

    return res.status(200).json({
        success: true,
        mensaje: "Transacción registrada correctamente.",
        data
    });

} else if (resultado.esDuplicado) {

    console.warn(`⛔ Referencia duplicada: ${payloadDB.referencia}`);

    return res.status(409).json({
        success: false,
        codigo: 'DUPLICADO',
        mensaje: "Esta referencia ya existe."
    });

} else {

    console.error("❌ Error crítico BD:", resultado.error);

    return res.status(503).json({
        success: false,
        mensaje: "Error de conexión con la base de datos.",
        detalle: resultado.error?.message
    });
}
