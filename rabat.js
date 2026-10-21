// Kod rabatowy: jeden kod na jedno urządzenie/przeglądarkę.
// Kod zapisujemy w DWÓCH miejscach (localStorage + ciasteczko).
// Jeśli ktoś wyczyści tylko jedno z nich, kod zostanie odtworzony z drugiego
// i nie powstanie nowy.
(function () {
    'use strict';

    var KEY = 'kluczserw_rabat';
    // bez znaków mylących się ze sobą: I, O, 0, 1
    var CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var CODE_FORMAT = /^KS-5-[A-HJ-NP-Z2-9]{4}$/;
    var DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

    function randomString(length) {
        var result = '';
        var cryptoObj = window.crypto || window.msCrypto;
        var values = new Uint32Array(length);
        if (cryptoObj && cryptoObj.getRandomValues) {
            cryptoObj.getRandomValues(values);
        } else {
            for (var i = 0; i < length; i++) {
                values[i] = Math.floor(Math.random() * 4294967296);
            }
        }
        for (var j = 0; j < length; j++) {
            result += CHARS.charAt(values[j] % CHARS.length);
        }
        return result;
    }

    function todayISO() {
        var d = new Date();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + mm + '-' + dd;
    }

    // Sprawdzamy, czy zapisane dane wyglądają poprawnie (ochrona przed błędami i grzebaniem w pamięci)
    function parse(raw) {
        if (!raw) return null;
        try {
            var data = JSON.parse(raw);
            if (data && CODE_FORMAT.test(data.code) && DATE_FORMAT.test(data.date)) {
                return data;
            }
        } catch (e) { /* uszkodzone dane – ignorujemy */ }
        return null;
    }

    function readLocal() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function readCookie() {
        var parts = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < parts.length; i++) {
            var idx = parts[i].indexOf('=');
            if (parts[i].substring(0, idx) === KEY) {
                try { return decodeURIComponent(parts[i].substring(idx + 1)); } catch (e) { return null; }
            }
        }
        return null;
    }

    function save(data) {
        var raw = JSON.stringify(data);
        try { localStorage.setItem(KEY, raw); } catch (e) { /* np. tryb prywatny */ }
        var secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = KEY + '=' + encodeURIComponent(raw) +
            '; max-age=' + (60 * 60 * 24 * 365 * 2) + '; path=/; SameSite=Lax' + secure;
    }

    function formatDate(iso) {
        var p = iso.split('-');
        return p[2] + '.' + p[1] + '.' + p[0];
    }

    // 1. Szukamy istniejącego kodu (najpierw localStorage, potem ciasteczko)
    var data = parse(readLocal()) || parse(readCookie());

    // 2. Jeśli go nie ma – to pierwsza wizyta, tworzymy nowy
    if (!data) {
        data = { code: 'KS-5-' + randomString(4), date: todayISO() };
    }

    // 3. Zapisujemy zawsze w obu miejscach (odtwarza brakujące)
    save(data);

    // 4. Pokazujemy kod i datę wygenerowania
    document.getElementById('code-display').textContent = data.code;
    var dateEl = document.getElementById('code-date');
    if (dateEl) {
        dateEl.textContent = 'Kod wygenerowano: ' + formatDate(data.date);
    }
})();
