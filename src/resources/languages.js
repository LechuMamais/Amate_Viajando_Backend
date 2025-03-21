const languagesAvailable = [
    { name: 'English', iso3code: 'eng', iso2code: 'en' },
    { name: 'Español', iso3code: 'esp', iso2code: 'es' },
    { name: 'Português', iso3code: 'por', iso2code: 'pt' },
    { name: 'Italiano', iso3code: 'ita', iso2code: 'it' },
    { name: 'Deutsch', iso3code: 'deu', iso2code: 'de' }
];

const getLanguageName = (languageCode) => {
    const language = languagesAvailable.find((lang) => lang.iso3code === languageCode);
    return language ? language.name : 'Unknown';
};

const languagesIso3CodeArray = languagesAvailable.map(language => language.iso3code);
const languages = languagesIso3CodeArray

module.exports = { languagesAvailable, languages, getLanguageName };