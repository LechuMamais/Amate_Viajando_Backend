function checkAllFieldsAreComplete(eng, esp, ita, por) {
    const hasCompleteField = [eng, esp, ita, por].some(lang =>
        lang &&
        Object.values(lang).some(field => field && field.trim() !== "")
    );
    return hasCompleteField
};
module.exports = checkAllFieldsAreComplete;