(function () {
    "use strict";

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("Supabase JS failed to load. Check your internet connection and try again.");
    }

    var storage = {
        getItem: function (key) {
            return localStorage.getItem(key) || sessionStorage.getItem(key);
        },
        setItem: function (key, value) {
            var remember = typeof window.IdealRememberSession === "boolean"
                ? window.IdealRememberSession
                : localStorage.getItem(key) !== null;
            var target = remember ? localStorage : sessionStorage;
            var other = remember ? sessionStorage : localStorage;
            other.removeItem(key);
            target.setItem(key, value);
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        }
    };

    window.IdealCloud = window.supabase.createClient(
        "https://jtcifleqpdhqvqnvhnre.supabase.co",
        "sb_publishable_MN-cZzIRHmLG2tEbTYPa_g_Q2x7S5QX",
        {
            auth: {
                storage: storage,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    );
})();
