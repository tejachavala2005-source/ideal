/* =====================================================
   IDEAL COLLEGE CLUBS - SHARED AUTH
   Student / Staff / Admin Module Switching
   Front-end demo using localStorage/sessionStorage
===================================================== */

(function () {
    "use strict";


    /* =====================================================
       BASE URLS
    ===================================================== */

    var scriptEl = document.currentScript;

    var BASE = scriptEl
        ? scriptEl.src.replace(/[^\/]*$/, "")
        : "";

    var LOGIN_URL = BASE + "logbtn.html";
    var REGISTER_URL = BASE + "registration.html";
    var HOME_URL = BASE + "main.html";
    var STAFF_URL = BASE + "staff-login.html";


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    var USERS_KEY = "ic_users";
    var SESSION_KEY = "ic_session";
    var REGS_KEY = "ic_registrations";


    /* =====================================================
       STORAGE HELPERS
    ===================================================== */

    function read(store, key, fallback) {

        try {

            var v = store.getItem(key);

            return v
                ? JSON.parse(v)
                : fallback;

        } catch (e) {

            return fallback;
        }
    }


    function write(store, key, value) {

        try {

            store.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (e) {

            return false;
        }
    }


    function users() {

        return read(
            localStorage,
            USERS_KEY,
            {}
        );
    }


    function norm(roll) {

        return String(
            roll || ""
        )
        .trim()
        .toUpperCase();
    }


    /* =====================================================
       PASSWORD HASHING
    ===================================================== */

    function fallbackHash(str) {

        var h1 = 5381;
        var h2 = 52711;

        for (
            var i = 0;
            i < str.length;
            i++
        ) {

            var c =
                str.charCodeAt(i);

            h1 =
                (h1 * 33) ^ c;

            h2 =
                (h2 * 33) ^ c;
        }

        return "f" +
            (h1 >>> 0).toString(16) +
            (h2 >>> 0).toString(16);
    }


    function hash(
        roll,
        password
    ) {

        var text =
            "ideal-college|" +
            norm(roll) +
            "|" +
            password;


        if (
            window.crypto &&
            crypto.subtle &&
            window.TextEncoder
        ) {

            return crypto.subtle
                .digest(
                    "SHA-256",
                    new TextEncoder()
                        .encode(text)
                )

                .then(function (buf) {

                    return Array.prototype
                        .map.call(
                            new Uint8Array(buf),
                            function (b) {

                                return (
                                    "0" +
                                    b.toString(16)
                                ).slice(-2);
                            }
                        )
                        .join("");

                })

                .catch(function () {

                    return fallbackHash(
                        text
                    );
                });
        }


        return Promise.resolve(
            fallbackHash(text)
        );
    }


    /* =====================================================
       AUTH OBJECT
    ===================================================== */

    var Auth = {


        /* =================================================
           GET CURRENT SESSION
        ================================================= */

        current: function () {

            return (

                read(
                    sessionStorage,
                    SESSION_KEY,
                    null
                )

                ||

                read(
                    localStorage,
                    SESSION_KEY,
                    null
                )
            );
        },


        /* =================================================
           GET CURRENT ROLE
        ================================================= */

        currentRole: function () {

            var user =
                Auth.current();

            if (!user) {
                return null;
            }

            return (
                user.role ||
                "STUDENT"
            ).toUpperCase();
        },


        /* =================================================
           STUDENT REGISTRATION
        ================================================= */

        register: function (data) {

            var key =
                norm(data.roll);

            var all =
                users();


            if (all[key]) {

                return Promise.reject(
                    new Error(
                        "This roll number is already registered. Please login."
                    )
                );
            }


            return hash(
                key,
                data.password
            )

            .then(function (h) {

                all[key] = {

                    name: data.name,

                    roll: key,

                    mobile:
                        data.mobile,

                    year:
                        data.year,

                    group:
                        data.group,

                    hash: h,

                    role: "STUDENT",

                    createdAt:
                        new Date()
                            .toISOString()
                };


                if (
                    !write(
                        localStorage,
                        USERS_KEY,
                        all
                    )
                ) {

                    throw new Error(
                        "Could not save your account. Please enable browser storage."
                    );
                }


                return all[key];
            });
        },


        /* =================================================
           STUDENT LOGIN
        ================================================= */

        login: function (
            roll,
            password,
            remember
        ) {

            var key =
                norm(roll);

            var user =
                users()[key];


            if (!user) {

                return Promise.reject(
                    new Error(
                        "No account found for this roll number. Please register first."
                    )
                );
            }


            return hash(
                key,
                password
            )

            .then(function (h) {

                if (
                    h !== user.hash
                ) {

                    throw new Error(
                        "Incorrect password. Please try again."
                    );
                }


                var session = {

                    name:
                        user.name,

                    roll:
                        user.roll,

                    mobile:
                        user.mobile,

                    year:
                        user.year,

                    group:
                        user.group,

                    role:
                        "STUDENT"
                };


                Auth.clearSession();


                write(
                    remember
                        ? localStorage
                        : sessionStorage,

                    SESSION_KEY,

                    session
                );


                return session;
            });
        },


        /* =================================================
           CLEAR CURRENT SESSION
        ================================================= */

        clearSession: function () {

            localStorage.removeItem(
                SESSION_KEY
            );

            sessionStorage.removeItem(
                SESSION_KEY
            );
        },


        /* =================================================
           LOGOUT
        ================================================= */

        logout: function () {

            Auth.clearSession();
        },


        /* =================================================
           REQUIRE LOGIN
        ================================================= */

        requireLogin: function () {

            if (
                Auth.current()
            ) {

                return true;
            }


            window.location.href =
                LOGIN_URL +
                "?next=" +
                encodeURIComponent(
                    window.location.href
                );

            return false;
        },


        /* =================================================
           REQUIRE SPECIFIC ROLE
        ================================================= */

        requireRole: function (
            requiredRole
        ) {

            var user =
                Auth.current();


            if (!user) {

                return false;
            }


            return (
                String(
                    user.role
                ).toUpperCase()
                ===
                String(
                    requiredRole
                ).toUpperCase()
            );
        },


        /* =================================================
           SWITCH MODULE
           
           Student → Staff
           Staff → Student
           Staff → Admin
           Admin → Student
        ================================================= */

        switchModule: function (
            targetRole,
            targetURL
        ) {

            targetRole =
                String(
                    targetRole || ""
                ).toUpperCase();


            var currentUser =
                Auth.current();


            /* -----------------------------------------
               NO CURRENT LOGIN
            ----------------------------------------- */

            if (!currentUser) {

                window.location.href =
                    targetURL;

                return;
            }


            var currentRole =
                String(
                    currentUser.role ||
                    "STUDENT"
                ).toUpperCase();


            /* -----------------------------------------
               SAME ROLE
            ----------------------------------------- */

            if (
                currentRole ===
                targetRole
            ) {

                window.location.href =
                    targetURL;

                return;
            }


            /* -----------------------------------------
               ROLE NAMES
            ----------------------------------------- */

            var roleNames = {

                STUDENT:
                    "Student",

                COORDINATOR:
                    "Club Coordinator",

                STAFF:
                    "Staff",

                ADMIN:
                    "Admin"
            };


            var currentName =
                roleNames[currentRole] ||
                currentRole;


            var targetName =
                roleNames[targetRole] ||
                targetRole;


            /* -----------------------------------------
               CONFIRMATION MESSAGE
            ----------------------------------------- */

            var message =

                "You are currently logged in as a " +
                currentName +
                ".\n\n" +

                "To enter the " +
                targetName +
                " Module, you need to logout from your " +
                currentName +
                " Account.\n\n" +

                "Are you sure you want to logout and continue?";


            var confirmed =
                window.confirm(
                    message
                );


            /* -----------------------------------------
               CANCEL
            ----------------------------------------- */

            if (!confirmed) {

                return;
            }


            /* -----------------------------------------
               LOGOUT CURRENT ACCOUNT
            ----------------------------------------- */

            Auth.logout();


            /* -----------------------------------------
               OPEN TARGET MODULE
            ----------------------------------------- */

            window.location.href =
                targetURL;
        },


        /* =================================================
           ADD CLUB / EVENT REGISTRATION
        ================================================= */

        addRegistration: function (
            type,
            title,
            club
        ) {

            var user =
                Auth.current();


            if (!user) {

                return false;
            }


            var all =
                read(
                    localStorage,
                    REGS_KEY,
                    {}
                );


            var list =
                all[user.roll] || [];


            for (
                var i = 0;
                i < list.length;
                i++
            ) {

                if (
                    list[i].type === type &&
                    list[i].title === title
                ) {

                    return "duplicate";
                }
            }


            list.push({

                type:
                    type,

                title:
                    title,

                club:
                    club || "",

                date:
                    new Date()
                        .toLocaleDateString()
            });


            all[user.roll] =
                list;


            write(
                localStorage,
                REGS_KEY,
                all
            );


            return true;
        },


        /* =================================================
           GET REGISTRATIONS
        ================================================= */

        getRegistrations: function () {

            var user =
                Auth.current();


            if (!user) {

                return [];
            }


            return read(
                localStorage,
                REGS_KEY,
                {}
            )[user.roll] || [];
        },


        /* =================================================
           URLS
        ================================================= */

        urls: {

            login:
                LOGIN_URL,

            register:
                REGISTER_URL,

            home:
                HOME_URL,

            staff:
                STAFF_URL
        }
    };


    /* =====================================================
       MAKE AUTH AVAILABLE GLOBALLY
    ===================================================== */

    window.IdealAuth =
        Auth;


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function esc(s) {

        return String(s)
            .replace(
                /[&<>"']/g,

                function (c) {

                    return {

                        "&":
                            "&amp;",

                        "<":
                            "&lt;",

                        ">":
                            "&gt;",

                        '"':
                            "&quot;",

                        "'":
                            "&#39;"
                    }[c];
                }
            );
    }


    /* =====================================================
       HEADER AUTH
    ===================================================== */

    function buildHeaderAuth() {

        var holder =
            document.querySelector(
                ".nav-right, .header-actions, .nav-actions, .actions"
            );


        if (
            !holder ||
            holder.querySelector(
                ".auth-box"
            )
        ) {

            return;
        }


        var user =
            Auth.current();


        var box =
            document.createElement(
                "div"
            );


        box.className =
            "auth-box";


        if (user) {

            var first =
                esc(
                    (
                        user.name ||
                        "User"
                    )
                    .split(" ")[0]
                );


            var role =
                esc(
                    user.role ||
                    "STUDENT"
                );


            box.innerHTML =

                '<span class="auth-user" ' +

                'title="' +
                esc(
                    user.name ||
                    ""
                ) +
                '">' +

                '\uD83D\uDC64 ' +
                first +

                ' <small>(' +
                role +
                ')</small>' +

                '</span>' +

                '<button type="button" ' +
                'class="auth-btn auth-logout">' +

                'Logout' +

                '</button>';


            box
                .querySelector(
                    ".auth-logout"
                )
                .addEventListener(
                    "click",
                    function () {

                        Auth.logout();

                        window.location.href =
                            HOME_URL;
                    }
                );

        } else {

            box.innerHTML =

                '<a class="auth-btn auth-login" ' +
                'href="' +
                LOGIN_URL +
                '">' +

                'Login' +

                '</a>' +

                '<a class="auth-btn auth-register" ' +
                'href="' +
                REGISTER_URL +
                '">' +

                'Register' +

                '</a>';
        }


        /* -----------------------------------------
           STAFF BUTTON
        ----------------------------------------- */

        var staffLink =
            document.createElement(
                "a"
            );


        staffLink.className =
            "auth-btn auth-staff";


        staffLink.href =
            STAFF_URL;


        staffLink.title =
            "Admin / Coordinator login";


        staffLink.textContent =
            "Staff";


        /*
           IMPORTANT:
           Use our module-switch system.
        */

        staffLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                Auth.switchModule(
                    "STAFF",
                    STAFF_URL
                );
            }
        );


        box.appendChild(
            staffLink
        );


        var menuBtn =
            holder.querySelector(
                ".menu-btn"
            );


        if (menuBtn) {

            holder.insertBefore(
                box,
                menuBtn
            );

        } else {

            holder.appendChild(
                box
            );
        }
    }


    /* =====================================================
       MODULE LINK PROTECTION

       You can use:

       data-module-role="STUDENT"

       data-module-role="STAFF"

       data-module-role="ADMIN"

       data-module-role="COORDINATOR"
    ===================================================== */

    function protectModuleLinks() {

        var links =
            document.querySelectorAll(
                "[data-module-role]"
            );


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        var role =
                            link.getAttribute(
                                "data-module-role"
                            );


                        var url =
                            link.getAttribute(
                                "href"
                            );


                        if (!role) {
                            return;
                        }


                        event.preventDefault();


                        Auth.switchModule(
                            role,
                            url
                        );
                    }
                );
            }
        );
    }


    /* =====================================================
       PREFILL CLUB JOIN FORM
    ===================================================== */

    function enhanceJoinForms() {

        var user =
            Auth.current();


        var map = {

            studentName:
                "name",

            rollNumber:
                "roll",

            mobile:
                "mobile",

            year:
                "year",

            group:
                "group"
        };


        if (user) {

            Object.keys(map)
                .forEach(
                    function (id) {

                        var el =
                            document.getElementById(
                                id
                            );


                        if (
                            el &&
                            !el.value
                        ) {

                            el.value =
                                user[
                                    map[id]
                                ] || "";
                        }
                    }
                );
        }


        var CLUB_BY_PATH = [

            [
                "tech",
                "i-Tech Hub"
            ],

            [
                "stage",
                "Stage & Spotlight"
            ],

            [
                "soc",
                "Social Impact"
            ],

            [
                "arts",
                "Art & Expression"
            ],

            [
                "speech",
                "Voice & Vision"
            ],

            [
                "nature",
                "Nature Warrior"
            ],

            [
                "frame",
                "Frame & Focus"
            ]
        ];


        var clubName = "";


        CLUB_BY_PATH.forEach(
            function (p) {

                if (
                    !clubName &&
                    location.pathname
                        .split("/")
                        .pop()
                        .toLowerCase()
                        .indexOf(
                            p[0]
                        ) === 0
                ) {

                    clubName =
                        p[1];
                }
            }
        );


        var form =

            document.getElementById(
                "joinForm"
            )

            ||

            document.getElementById(
                "registrationForm"
            )

            ||

            document.getElementById(
                "form"
            );


        if (
            form &&
            user &&
            clubName
        ) {

            form.addEventListener(
                "submit",
                function () {

                    var mobileEl =
                        document.getElementById(
                            "mobile"
                        );


                    var okMobile =
                        !mobileEl ||

                        /^[0-9]{10}$/
                            .test(
                                mobileEl.value
                                    .trim()
                            );


                    if (
                        okMobile &&
                        form.checkValidity()
                    ) {

                        Auth.addRegistration(
                            "Club Join",
                            clubName,
                            clubName
                        );
                    }
                }
            );
        }
    }

    /* =====================================================
       PAGE LOAD
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            buildHeaderAuth();

            protectModuleLinks();

            if (
                !/logbtn|registration/
                    .test(
                        location.pathname
                    )
            ) {

                enhanceJoinForms();
            }
        }
    );

})();