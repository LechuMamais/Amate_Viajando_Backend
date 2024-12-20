import { OpenAI } from "openai";

const max_tokens = 3000
const temperature = 0   // A tope de serio, 0 creativo

export const getTranslationFromOpenAI = async (language, text) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const lang = language === 'eng' ? 'English' : language === 'ita' ? 'Italian' : language === 'por' ? 'Portuguese' : 'Unknown';
    try {
        const message = `Return only the translation to the language ${lang}' of the text between ''
        '${text}'
        No other information is needed. Don't include quotes. Don't include the language name.
        Dont include the original text. Only the translation.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: message },
            ],
            max_tokens,
            temperature,
        });

        return {
            role: response.choices[0].message?.role || '',
            content: response.choices[0].message?.content || 'Respuesta no disponible',
            refusal: response.choices[0].message?.refusal,
        };
    } catch (error) {
        console.error('Error al consultar OpenAI:', error);
        return {
            role: 'assistant',
            content: 'Error al obtener la respuesta de OpenAI',
            refusal: error,
        };
    }
};
