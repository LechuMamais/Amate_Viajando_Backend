const API_BASE_URL = "http://localhost:3000/api/v1";
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// 🛠️ Función Genérica para Actualizar Colecciones
const updateAll = async (collection, bearerToken) => {
    try {
        console.log(`🔄 Obteniendo todos los ${collection}...`);
        const response = await fetch(`${API_BASE_URL}/${collection}/all`, {
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error(`❌ Error al obtener ${collection}`);

        const items = await response.json();

        for (const item of items) {
            if (collection === "articles/lang") { collection = "articles" }
            console.log(`✏️ Actualizando ${collection.slice(0, -1)}: ${item._id}`);

            const updateResponse = await fetch(`${API_BASE_URL}/${collection}/${item._id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(item),
            });

            if (!updateResponse.ok) {
                console.error(`❌ Error al actualizar ${item._id}`);
            } else {
                console.log(`✅ ${collection.slice(0, -1)} ${item._id} actualizado`);
            }
        }

        console.log(`🎉 Proceso de actualización completado para ${collection}.`);
    } catch (error) {
        console.error(`❌ Error en ${collection}:`, error);
    }
};

// 🔄 Ejecutar Todas las Actualizaciones en Paralelo
const runUpdates = async (bearerToken) => {
    await Promise.all([
        updateAll("articles/lang", bearerToken),
        updateAll("destinations", bearerToken),
        updateAll("tours", bearerToken),
    ]);
    readline.close(); // 🔹 Ahora se cierra solo cuando todo ha terminado
};

// 🛠️ Pedir Token y Ejecutar
readline.question("🔑 Introduce tu Bearer Token: ", (token) => {
    console.log("🚀 Iniciando actualizaciones...");
    runUpdates(token);

});
