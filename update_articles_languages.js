const API_BASE_URL = "http://localhost:3000/api/v1";
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const updateAllArticles = async (bearerToken) => {
    try {
        console.log("🔄 Obteniendo todos los artículos...");
        const response = await fetch(`${API_BASE_URL}/articles`);
        console.log(response)
        if (!response.ok) throw new Error("❌ Error al obtener los artículos");

        const articles = await response.json();

        for (const article of articles) {
            console.log(`✏️ Actualizando artículo: ${article._id}`);

            const updateResponse = await fetch(`${API_BASE_URL}/articles/${article._id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(article),
            });

            if (!updateResponse.ok) {
                console.error(`❌ Error al actualizar ${article._id}`);
            } else {
                console.log(`✅ Artículo ${article._id} actualizado`);
            }
        }

        console.log("🎉 Proceso de actualización completado.");
    } catch (error) {
        console.error("❌ Error general:", error);
    } finally {
        readline.close(); // Cierra la interfaz de lectura
    }
};

// Solicitar el Bearer Token por consola
readline.question("🔑 Introduce tu Bearer Token: ", (token) => {
    updateAllArticles(token);
});