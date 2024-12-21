const completeTranslations = require("./completeTranslations").completeTranslations;
const translateAllEmptyFields = async (body) => {
    const languages = ["eng", "esp", "ita", "por"];
    for (const fromLang of languages) {
        for (const toLang of languages) {
            if (fromLang !== toLang) {
                await completeTranslations(fromLang, toLang, body);
            }
        }
    }
    return body;
};
module.exports = { translateAllEmptyFields };