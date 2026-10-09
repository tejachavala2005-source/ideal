/* =====================================================
   IDEAL COLLEGE CLUBS - STAFF (ADMIN / COORDINATOR) AUTH

   One shared staff token (see staff-config.js) is used for
   both Admin and Coordinator login.

   FRONT-END DEMO: for real security move this to a server.
===================================================== */

(function () {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    var CFG = window.IDEAL_CONFIG || {};

    var STAFF_TOKEN =
        String(
            CFG.STAFF_TOKEN ||
            CFG.ADMIN_TOKEN ||
            ""
        )
        .trim()
        .toUpperCase();

    var STAFF_HASH =
        STAFF_TOKEN.length >= 8
            ? sha256("ideal-token|" + STAFF_TOKEN)
            : "";


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    var COORD_LOG_KEY = "ic_coord_log";

    var STAFF_SESSION = "ic_staff_session";

    var ATTEMPT_KEY = "ic_staff_attempts";

    var USERS_KEY = "ic_users";

    var REGS_KEY = "ic_registrations";

    /* Student session key */
    var STUDENT_SESSION = "ic_session";


    /* =====================================================
       CLUBS
    ===================================================== */

    var CLUBS = [
        "i-Tech Hub",
        "Stage & Spotlight",
        "Social Impact",
        "Art & Expression",
        "Voice & Vision",
        "Nature Warrior",
        "Frame & Focus"
    ];


    /* =====================================================
       PURE JAVASCRIPT SHA-256
    ===================================================== */

    function sha256(str) {

        str = unescape(encodeURIComponent(str));

        var K = [],
            H = [],
            i,
            j;

        var isPrime = {},
            cand = 2,
            count = 0;

        function frac(x) {
            return ((x - Math.floor(x)) * 4294967296) | 0;
        }

        while (count < 64) {

            if (!isPrime[cand]) {

                for (
                    i = cand * cand;
                    i < 313;
                    i += cand
                ) {
                    isPrime[i] = 1;
                }

                if (count < 8) {
                    H[count] =
                        frac(Math.pow(cand, 0.5));
                }

                K[count++] =
                    frac(Math.pow(cand, 1 / 3));
            }

            cand++;
        }


        var bytes = [];

        for (i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }


        var bitLen = bytes.length * 8;

        bytes.push(0x80);

        while (bytes.length % 64 !== 56) {
            bytes.push(0);
        }


        var hi =
            Math.floor(bitLen / 4294967296);

        var lo = bitLen >>> 0;


        bytes.push(
            (hi >>> 24) & 255,
            (hi >>> 16) & 255,
            (hi >>> 8) & 255,
            hi & 255,

            (lo >>> 24) & 255,
            (lo >>> 16) & 255,
            (lo >>> 8) & 255,
            lo & 255
        );


        function rr(v, n) {
            return (
                (v >>> n) |
                (v << (32 - n))
            );
        }


        for (
            var off = 0;
            off < bytes.length;
            off += 64
        ) {

            var w = [];


            for (i = 0; i < 16; i++) {

                w[i] =
                    (bytes[off + i * 4] << 24) |
                    (bytes[off + i * 4 + 1] << 16) |
                    (bytes[off + i * 4 + 2] << 8) |
                    bytes[off + i * 4 + 3];

            }


            for (i = 16; i < 64; i++) {

                var s0 =
                    rr(w[i - 15], 7) ^
                    rr(w[i - 15], 18) ^
                    (w[i - 15] >>> 3);

                var s1 =
                    rr(w[i - 2], 17) ^
                    rr(w[i - 2], 19) ^
                    (w[i - 2] >>> 10);

                w[i] =
                    (w[i - 16] +
                        s0 +
                        w[i - 7] +
                        s1) |
                    0;
            }


            var a = H[0],
                b = H[1],
                c = H[2],
                d = H[3],
                e = H[4],
                f = H[5],
                g = H[6],
                h = H[7];


            for (i = 0; i < 64; i++) {

                var S1 =
                    rr(e, 6) ^
                    rr(e, 11) ^
                    rr(e, 25);

                var ch =
                    (e & f) ^
                    (~e & g);

                var t1 =
                    (h +
                        S1 +
                        ch +
                        K[i] +
                        w[i]) |
                    0;

                var S0 =
                    rr(a, 2) ^
                    rr(a, 13) ^
                    rr(a, 22);

                var mj =
                    (a & b) ^
                    (a & c) ^
                    (b & c);

                var t2 =
                    (S0 + mj) |
                    0;


                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }


            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;

            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        }


        var out = "";

        for (i = 0; i < 8; i++) {

            out +=
                ("00000000" +
                    (H[i] >>> 0).toString(16))
                    .slice(-8);
        }

        return out;
    }


    /* =====================================================
       TOKEN HELPERS
    ===================================================== */

    function normToken(t) {

        return String(t || "")
            .trim()
            .toUpperCase();
    }


    function tokenHash(t) {

        return sha256(
            "ideal-token|" +
            normToken(t)
        );
    }


    /* =====================================================
       RANDOM TOKEN GENERATOR
    ===================================================== */

    function randomToken(prefix, groups) {

        var alpha =
            "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

        var parts = [];

        var buf =
            new Uint8Array(groups * 5);


        if (
            window.crypto &&
            crypto.getRandomValues
        ) {

            crypto.getRandomValues(buf);

        } else {

            for (
                var k = 0;
                k < buf.length;
                k++
            ) {

                buf[k] =
                    Math.floor(
                        Math.random() * 256
                    );
            }
        }


        for (
            var g = 0;
            g < groups;
            g++
        ) {

            var s = "";

            for (
                var n = 0;
                n < 5;
                n++
            ) {

                s += alpha.charAt(
                    buf[g * 5 + n] %
                    alpha.length
                );

            }

            parts.push(s);
        }


        return prefix +
            "-" +
            parts.join("-");
    }


    /* =====================================================
       STORAGE
    ===================================================== */

    function read(store, key, fb) {

        try {

            var v =
                store.getItem(key);

            return v
                ? JSON.parse(v)
                : fb;

        } catch (e) {

            return fb;
        }
    }


    function write(store, key, val) {

        try {

            store.setItem(
                key,
                JSON.stringify(val)
            );

            return true;

        } catch (e) {

            return false;
        }
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function esc(s) {

        return String(
            s == null ? "" : s
        ).replace(
            /[&<>"']/g,
            function (c) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[c];

            }
        );
    }


    /* =====================================================
       BRUTE FORCE PROTECTION
    ===================================================== */

    function lockInfo() {

        var a =
            read(
                localStorage,
                ATTEMPT_KEY,
                {
                    count: 0,
                    until: 0
                }
            );


        var left =
            Math.ceil(
                (a.until - Date.now()) /
                1000
            );


        return {
            attempts: a,
            left: left > 0 ? left : 0
        };
    }


    function failAttempt() {

        var a =
            lockInfo().attempts;


        if (
            a.until &&
            a.until < Date.now()
        ) {

            a = {
                count: 0,
                until: 0
            };
        }


        a.count++;


        if (a.count >= 5) {

            a.until =
                Date.now() + 60000;

            a.count = 0;
        }


        write(
            localStorage,
            ATTEMPT_KEY,
            a
        );
    }


    function clearAttempts() {

        localStorage.removeItem(
            ATTEMPT_KEY
        );
    }


    function checkLock() {

        var l = lockInfo();


        if (l.left > 0) {

            throw new Error(
                "Too many wrong tokens. Try again in " +
                l.left +
                " seconds."
            );
        }
    }


    /* =====================================================
       SESSION
    ===================================================== */

    function setSession(s) {

        write(
            sessionStorage,
            STAFF_SESSION,
            s
        );
    }


    /* =====================================================
       STAFF AUTH OBJECT
    ===================================================== */

    var Staff = {

        CLUBS: CLUBS,

        esc: esc,

        tokenHash: tokenHash,


        /* -------------------------------------------------
           GET CURRENT STAFF SESSION
        ------------------------------------------------- */

        session: function () {

            var s =
                read(
                    sessionStorage,
                    STAFF_SESSION,
                    null
                );


            if (
                !s ||
                !STAFF_HASH ||
                s.hash !== STAFF_HASH
            ) {

                return null;
            }


            if (
                s.role !== "admin" &&
                s.role !== "coordinator"
            ) {

                return null;
            }


            return s;
        },


        /* -------------------------------------------------
           ADMIN LOGIN
        ------------------------------------------------- */

        adminLogin: function (token) {

            checkLock();


            var h =
                tokenHash(token);


            if (
                !STAFF_HASH ||
                h !== STAFF_HASH
            ) {

                failAttempt();

                throw new Error(
                    "Invalid staff token."
                );
            }


            clearAttempts();


            /*
             * IMPORTANT:
             * A successful staff login starts
             * a completely separate staff module.
             *
             * Remove any old student session here.
             * This does NOT bypass the confirmation
             * because this code runs only after the
             * user has already reached Staff Login.
             */

            localStorage.removeItem(
                STUDENT_SESSION
            );

            sessionStorage.removeItem(
                STUDENT_SESSION
            );


            var s = {
                role: "admin",
                name: "Administrator",
                hash: h
            };


            setSession(s);


            return s;
        },


        /* -------------------------------------------------
           COORDINATOR LOGIN
        ------------------------------------------------- */

        coordinatorLogin: function (
            token,
            name,
            club
        ) {

            checkLock();


            name =
                String(name || "")
                    .trim();


            if (name.length < 2) {

                throw new Error(
                    "Enter your name."
                );
            }


            if (
                CLUBS.indexOf(club) < 0
            ) {

                throw new Error(
                    "Select your club."
                );
            }


            var h =
                tokenHash(token);


            if (
                !STAFF_HASH ||
                h !== STAFF_HASH
            ) {

                failAttempt();

                throw new Error(
                    "Invalid staff token."
                );
            }


            clearAttempts();


            /*
             * Remove old student session only
             * after successful staff authentication.
             */

            localStorage.removeItem(
                STUDENT_SESSION
            );

            sessionStorage.removeItem(
                STUDENT_SESSION
            );


            /* Coordinator login history */

            var log =
                read(
                    localStorage,
                    COORD_LOG_KEY,
                    []
                );


            log.unshift({
                name: name,
                club: club,
                time: new Date().toLocaleString()
            });


            write(
                localStorage,
                COORD_LOG_KEY,
                log.slice(0, 100)
            );


            var s = {
                role: "coordinator",
                name: name,
                club: club,
                hash: h
            };


            setSession(s);


            return s;
        },


        /* -------------------------------------------------
           STAFF LOGOUT
        ------------------------------------------------- */

        logout: function () {

            sessionStorage.removeItem(
                STAFF_SESSION
            );
        },


        /* -------------------------------------------------
           REQUIRE ROLE
        ------------------------------------------------- */

        requireRole: function (role) {

            var s =
                Staff.session();


            if (
                !s ||
                s.role !== role
            ) {

                Staff.logout();


                window.location.replace(
                    "staff-login.html?role=" +
                    encodeURIComponent(role)
                );


                return null;
            }


            return s;
        },


        /* -------------------------------------------------
           COORDINATOR LOGIN HISTORY
        ------------------------------------------------- */

        coordinatorLog: function () {

            return read(
                localStorage,
                COORD_LOG_KEY,
                []
            );
        },


        /* -------------------------------------------------
           GET ALL STUDENTS
        ------------------------------------------------- */

        allUsers: function () {

            var u =
                read(
                    localStorage,
                    USERS_KEY,
                    {}
                );


            return Object.keys(u)
                .map(function (k) {

                    return u[k];

                });
        },


        /* -------------------------------------------------
           DELETE STUDENT
        ------------------------------------------------- */

        deleteUser: function (roll) {

            var u =
                read(
                    localStorage,
                    USERS_KEY,
                    {}
                );


            delete u[roll];


            write(
                localStorage,
                USERS_KEY,
                u
            );


            var r =
                read(
                    localStorage,
                    REGS_KEY,
                    {}
                );


            delete r[roll];


            write(
                localStorage,
                REGS_KEY,
                r
            );
        },


        /* -------------------------------------------------
           ALL REGISTRATIONS
        ------------------------------------------------- */

        allRegistrations: function () {

            var regs =
                read(
                    localStorage,
                    REGS_KEY,
                    {}
                );


            var users =
                read(
                    localStorage,
                    USERS_KEY,
                    {}
                );


            var rows = [];


            Object.keys(regs)
                .forEach(function (roll) {

                    var u =
                        users[roll] || {};


                    regs[roll]
                        .forEach(function (r) {

                            rows.push({

                                roll: roll,

                                name:
                                    u.name ||
                                    "(deleted)",

                                mobile:
                                    u.mobile || "",

                                year:
                                    u.year || "",

                                group:
                                    u.group || "",

                                type:
                                    r.type,

                                title:
                                    r.title,

                                club:
                                    r.club || "",

                                date:
                                    r.date
                            });

                        });

                });


            return rows;
        },


        /* -------------------------------------------------
           DOWNLOAD CSV
        ------------------------------------------------- */

        downloadCSV: function (
            filename,
            headers,
            rows
        ) {

            function cell(v) {

                v =
                    String(
                        v == null
                            ? ""
                            : v
                    );


                return /[",\n]/.test(v)

                    ? '"' +
                      v.replace(
                          /"/g,
                          '""'
                      ) +
                      '"'

                    : v;
            }


            var out =
                [headers.join(",")]
                .concat(
                    rows.map(function (r) {

                        return r
                            .map(cell)
                            .join(",");

                    })
                )
                .join("\n");


            var blob =
                new Blob(
                    [
                        "\uFEFF" + out
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8"
                    }
                );


            var a =
                document.createElement("a");


            a.href =
                URL.createObjectURL(blob);

            a.download =
                filename;


            document.body.appendChild(a);

            a.click();

            a.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        a.href
                    );

                },
                1000
            );
        }
    };


    /* =====================================================
       GLOBAL STAFF AUTH
    ===================================================== */

    window.IdealStaff = Staff;

})();