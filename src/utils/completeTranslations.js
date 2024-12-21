const getTranslationFromOpenAI = require("../services/getTranslationFromOpenAI");

const completeTranslations = async (fromLang, toLang, body) => {
    const fields = ["name", "heading", "description", "longDescription"];
    for (const field of fields) {
        if (!body[toLang][field] || body[toLang][field].trim() === "") {
            const sourceText = body[fromLang][field];
            if (sourceText && sourceText.trim() !== "") {
                const translationResponse = await getTranslationFromOpenAI(toLang, sourceText);
                if (translationResponse.role === "assistant" && translationResponse.content) {
                    body[toLang][field] = translationResponse.content.trim();
                } else {
                    throw new Error(
                        `Error al traducir '${field}' de '${fromLang}' a '${toLang}': ${translationResponse.refusal || "Error desconocido"}`
                    );
                }
            }
        }
    }
    return body;
};

module.exports = { completeTranslations };