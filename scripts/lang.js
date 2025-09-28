const style = document.createElement('style');
document.head.appendChild(style);

function getDefaultLanguage() {
    const defaultLanguage =
        window.localStorage.getItem('lang') ??
        navigator.language?.substring(0, 2) ??
        'it';
    return defaultLanguage.toLowerCase();
}

function changeLanguage(requestedLang = getDefaultLanguage()) {
    const availableLangs = ['it', 'sl', 'en'];
    const lang = availableLangs.includes(requestedLang) ? requestedLang : availableLangs[0];
    window.localStorage.setItem('lang', lang);
    style.innerText = `[lang]:not([lang|="${lang}"]) { display: none; }`;
}

changeLanguage();
