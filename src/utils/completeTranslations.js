import { getTranslationFromOpenAI } from "../services/getTranslationFromOpenAI";

export const completeTranslations = async (fromLang, toLang) => {
    const fields = ["name", "heading", "description", "longDescription"];
    for (const field of fields) {
        if (!req.body[toLang][field] || req.body[toLang][field].trim() === "") {
            const sourceText = req.body[fromLang][field];
            if (sourceText && sourceText.trim() !== "") {
                const translationResponse = await getTranslationFromOpenAI(toLang, sourceText);
                if (translationResponse.role === "assistant" && translationResponse.content) {
                    req.body[toLang][field] = translationResponse.content.trim();
                } else {
                    throw new Error(
                        `Error al traducir '${field}' de '${fromLang}' a '${toLang}': ${translationResponse.refusal || "Error desconocido"}`
                    );
                }
            }
        }
    }
};