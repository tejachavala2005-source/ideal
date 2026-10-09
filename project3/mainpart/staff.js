(function () {
    "use strict";

    var CLUBS = [
        "i-Tech Hub",
        "Stage & Spotlight",
        "Social Impact",
        "Art & Expression",
        "Voice & Vision",
        "Nature Warrior",
        "Frame & Focus"
    ];

    function client() {
        if (!window.IdealCloud) {
            throw new Error("Supabase is not configured. Check the Supabase setup instructions.");
        }
        return window.IdealCloud;
    }

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function staffMemberForUser(supabase, user) {
        return supabase.from("staff_members")
            .select("user_id,role,club")
            .eq("user_id", user.id)
            .maybeSingle()
            .then(function (result) {
                if (result.error) {
                    throw result.error;
                }
                if (!result.data) {
                    return null;
                }

                var role = result.data.role.toLowerCase();
                if (role !== "admin" && role !== "coordinator") {
                    throw new Error("This account has an invalid staff role.");
                }
                if (role === "coordinator" && CLUBS.indexOf(result.data.club) < 0) {
                    throw new Error("This coordinator account has no valid club assignment.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: (user.user_metadata && user.user_metadata.full_name) || user.email,
                    role: role,
                    club: result.data.club
                };
            });
    }

    function currentStaff() {
        var supabase = client();
        return supabase.auth.getUser().then(function (result) {
            if (result.error) {
                throw result.error;
            }
            if (!result.data.user) {
                return null;
            }
            return staffMemberForUser(supabase, result.data.user);
        });
    }

    function mapRegistration(row) {
        var student = row.student || {};
        return {
            id: row.id,
            name: student.full_name || "",
            roll: student.roll_number || "",
            mobile: student.mobile || "",
            year: student.year || "",
            group: student.group_name || "",
            type: row.type,
            title: row.title,
            club: row.club,
            date: new Date(row.created_at).toLocaleDateString()
        };
    }

    var Staff = {
        CLUBS: CLUBS,
        esc: esc,

        login: function (email, password) {
            var supabase = client();
            window.IdealRememberSession = false;

            return supabase.auth.signInWithPassword({
                email: String(email || "").trim(),
                password: password
            }).then(function (result) {
                if (result.error) {
                    throw result.error;
                }

                return staffMemberForUser(supabase, result.data.user).then(
                    function (staff) {
                        if (!staff) {
                            return supabase.auth.signOut().then(function (signOutResult) {
                                if (signOutResult.error) {
                                    throw new Error("This account has not been granted staff access. Sign-out also failed: " + signOutResult.error.message);
                                }
                                throw new Error("This account has not been granted staff access.");
                            });
                        }

                        sessionStorage.removeItem("ic_session");
                        localStorage.removeItem("ic_session");
                        return staff;
                    },
                    function (error) {
                        return supabase.auth.signOut().then(function (signOutResult) {
                            if (signOutResult.error) {
                                throw new Error(error.message + " Sign-out cleanup also failed: " + signOutResult.error.message);
                            }
                            throw error;
                        });
                    });
            });
        },

        currentStaff: currentStaff,

        requireRole: function (role) {
            return currentStaff().then(function (staff) {
                if (!staff) {
                    window.location.replace("staff-login.html");
                    return null;
                }
                if (staff.role !== role) {
                    window.location.replace(staff.role === "admin" ? "admin.html" : "coordinator.html");
                    return null;
                }
                return staff;
            });
        },

        logout: function () {
            sessionStorage.removeItem("ic_session");
            localStorage.removeItem("ic_session");
            return client().auth.signOut().then(function (result) {
                if (result.error) {
                    throw result.error;
                }
            });
        },

        allUsers: function () {
            return client().from("profiles")
                .select("id,roll_number,full_name,mobile,year,group_name,created_at")
                .order("created_at", { ascending: false })
                .then(function (result) {
                    if (result.error) {
                        throw result.error;
                    }
                    return result.data.map(function (row) {
                        return {
                            id: row.id,
                            name: row.full_name,
                            roll: row.roll_number,
                            mobile: row.mobile,
                            year: row.year,
                            group: row.group_name,
                            createdAt: row.created_at
                        };
                    });
                });
        },

        allRegistrations: function () {
            return client().from("registrations")
                .select("id,type,title,club,created_at,student:profiles!registrations_student_id_fkey(full_name,roll_number,mobile,year,group_name)")
                .order("created_at", { ascending: false })
                .then(function (result) {
                    if (result.error) {
                        throw result.error;
                    }
                    return result.data.map(mapRegistration);
                });
        },

        downloadCSV: function (filename, headers, rows) {
            function cell(value) {
                var text = String(value == null ? "" : value);
                return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
            }

            var output = [headers.map(cell).join(",")]
                .concat(rows.map(function (row) {
                    return row.map(cell).join(",");
                }))
                .join("\n");
            var blob = new Blob(["\uFEFF" + output], { type: "text/csv;charset=utf-8" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(function () {
                URL.revokeObjectURL(link.href);
            }, 1000);
        }
    };

    window.IdealStaff = Staff;
})();
