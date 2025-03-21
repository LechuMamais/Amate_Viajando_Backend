const { languages } = require("../resources/languages");
const completeTranslations = require("./completeTranslations").completeTranslations;

const translateAllEmptyFields = async (body, fields) => {
    console.log('Translating empty fields');
    for (const fromLang of languages) {
        for (const toLang of languages) {
            if (fromLang !== toLang) {
                console.log(`Translating from ${fromLang} to ${toLang}`);
                await completeTranslations(fromLang, toLang, body, fields);
            }
        }
    }
    console.log("All empty fields translated");
    return body;
};

module.exports = { translateAllEmptyFields };