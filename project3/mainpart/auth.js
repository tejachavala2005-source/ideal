/* =====================================================
   IDEAL COLLEGE CLUBS - SHARED AUTH
   Student / Staff / Admin Module Switching
   Supabase-backed student accounts and registrations
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

    var SESSION_KEY = "ic_session";


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


    function norm(roll) {

        return String(
            roll || ""
        )
        .trim()
        .toUpperCase();
    }


    function client() {
        if (!window.IdealCloud) {
            throw new Error("Supabase is not configured. Check the Supabase setup instructions.");
        }
        return window.IdealCloud;
    }


    function loginEmail(roll) {
        var key = norm(roll);
        var encoded = btoa(unescape(encodeURIComponent(key)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");
        if (encoded.length > 56) {
            throw new Error("Roll number is too long to create a demo account.");
        }
        return "student." + encoded + "@students.idealcollege.example.com";
    }


    function profileFromRow(row) {
        return {
            id: row.id,
            name: row.full_name,
            roll: row.roll_number,
            mobile: row.mobile,
            year: row.year,
            group: row.group_name,
            role: row.role
        };
    }


    function saveSession(profile, remember) {
        Auth.clearSession();
        window.IdealRememberSession = Boolean(remember);
        if (!write(
            remember ? localStorage : sessionStorage,
            SESSION_KEY,
            profile
        )) {
            throw new Error("Could not save your sign-in state. Check your browser storage settings.");
        }
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
            var key = norm(data.roll);
            if (!key || key.length > 40) {
                return Promise.reject(new Error("Enter a roll number of 1 to 40 characters."));
            }

            var supabase = client();
            window.IdealRememberSession = true;
            return supabase.auth.signUp({
                email: loginEmail(key),
                password: data.password,
                options: {
                    data: {
                        roll_number: key,
                        full_name: data.name.trim(),
                        mobile: data.mobile,
                        year: data.year,
                        group_name: data.group
                    }
                }
            }).then(function (result) {
                if (result.error) {
                    throw result.error;
                }
                if (!result.data.session) {
                    throw new Error("Email confirmation is enabled in Supabase. Disable it for this roll-number demo, then register again.");
                }
                return profileForUser(supabase, result.data.user.id)
                    .then(function (profile) {
                        saveSession(profile, true);
                        return profile;
                    })
                    .catch(function (error) {
                        return supabase.auth.signOut().then(function (signOutResult) {
                            if (signOutResult.error) {
                                throw new Error(error.message + " Sign-out cleanup also failed: " + signOutResult.error.message);
                            }
                            throw error;
                        });
                    });
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

            var key = norm(roll);
            if (!key || key.length > 40) {
                return Promise.reject(new Error("Enter a valid roll number."));
            }

            window.IdealRememberSession = Boolean(remember);
            var supabase = client();
            return supabase.auth.signInWithPassword({
                email: loginEmail(key),
                password: password
            }).then(function (result) {
                if (result.error) {
                    throw result.error;
                }
                return profileForUser(supabase, result.data.user.id)
                    .then(function (profile) {
                        saveSession(profile, remember);
                        return profile;
                    })
                    .catch(function (error) {
                        return supabase.auth.signOut().then(function (signOutResult) {
                            if (signOutResult.error) {
                                throw new Error(error.message + " Sign-out cleanup also failed: " + signOutResult.error.message);
                            }
                            throw error;
                        });
                    });
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
            return client().auth.signOut().then(function (result) {
                if (result.error) {
                    throw result.error;
                }
            });
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

            Auth.logout().then(function () {
                window.location.href = targetURL;
            }).catch(function (error) {
                window.alert("Could not log out: " + error.message);
            });
        },


        /* =================================================
           ADD CLUB / EVENT REGISTRATION
        ================================================= */

        addRegistration: function (
            type,
            title,
            club
        ) {
            var supabase = client();
            return supabase.auth.getUser().then(function (result) {
                if (result.error) {
                    throw result.error;
                }
                if (!result.data.user) {
                    throw new Error("Please log in before registering.");
                }
                return supabase.from("registrations").insert({
                    student_id: result.data.user.id,
                    type: type,
                    title: title,
                    club: club || ""
                });
            }).then(function (result) {
                if (result.error) {
                    if (result.error.code === "23505") {
                        return "duplicate";
                    }
                    throw result.error;
                }
                return true;
            });
        },


        /* =================================================
           GET REGISTRATIONS
        ================================================= */

        getRegistrations: function () {
            var supabase = client();
            return supabase.from("registrations")
                .select("type,title,club,created_at")
                .order("created_at", { ascending: false })
                .then(function (result) {
                    if (result.error) {
                        throw result.error;
                    }
                    return result.data.map(function (row) {
                        return {
                            type: row.type,
                            title: row.title,
                            club: row.club,
                            date: new Date(row.created_at).toLocaleDateString()
                        };
                    });
                });
        },


        resetPassword: function () {
            return Promise.reject(new Error("Password reset is unavailable for roll-number accounts. Contact the demo administrator."));
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


    function profileForUser(supabase, userId) {
        return supabase.from("profiles")
            .select("id,roll_number,full_name,mobile,year,group_name,role")
            .eq("id", userId)
            .single()
            .then(function (result) {
                if (result.error) {
                    throw result.error;
                }
                return profileFromRow(result.data);
            });
    }


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
                        Auth.logout().then(function () {
                            window.location.href = HOME_URL;
                        }).catch(function (error) {
                            window.alert("Could not log out: " + error.message);
                        });
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


        if (form && clubName) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (!Auth.current()) {
                    Auth.requireLogin();
                    return;
                }
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                var mobileEl = document.getElementById("mobile");
                if (mobileEl && !/^[0-9]{10}$/.test(mobileEl.value.trim())) {
                    window.alert("Please enter a valid 10-digit mobile number.");
                    return;
                }

                Auth.addRegistration("Club Join", clubName, clubName)
                    .then(function (result) {
                        if (result === "duplicate") {
                            window.alert("You are already registered for " + clubName + ".");
                            return;
                        }
                        form.reset();
                        window.alert("Your registration for " + clubName + " was saved.");
                    })
                    .catch(function (error) {
                        window.alert("Registration failed: " + error.message);
                    });
            }, true);
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