IDEAL COLLEGE CLUBS - GITHUB PAGES DEMO

The site is a static frontend hosted by GitHub Pages. Student accounts and
club/competition registrations are stored in Supabase PostgreSQL and shared
between visitors. Open index.html locally for a preview or use the deployed
GitHub Pages URL.

Pages
- mainpart/main.html          Home (clubs, competitions, gallery)
- mainpart/logbtn.html        Login
- mainpart/registration.html  Student registration
- mainpart/techo/tech.html, stage-spotlight/stage.html, social-impact/soc.html,
  arts-expressions/arts.html, speech/speech.html, nature/nature.html, frame-focus/frame.html

SUPABASE SETUP (required before enabling the live demo)
1. Create a Supabase project.
2. In Authentication > Sign In / Providers > Email, disable email confirmation.
   Roll-number accounts use generated, non-deliverable email addresses.
3. In the Supabase SQL Editor, run supabase/setup.sql.
4. mainpart/supabase-config.js contains the Supabase Project URL and the
   browser-safe publishable key. Never put a service_role/secret key in the site.
5. In Supabase Authentication > URL Configuration, add the final GitHub Pages
   URL to the allowed redirect URLs (for example:
   https://OWNER.github.io/REPOSITORY/**).
6. In the GitHub repository, choose Settings > Pages > Build and deployment >
   Source: GitHub Actions. Push to the main branch to deploy project3/.

Student login uses roll number and password. Password recovery is disabled
because these accounts do not have reachable email addresses.
Accounts previously saved only in a browser are not migrated; students must
register again on the hosted demo.
Contact/feedback reports are still stored only in the visitor's browser.

STAFF / ADMIN ACCESS
Staff sign in at mainpart/staff-login.html with individual Supabase Auth
accounts. Create each account in Supabase Authentication > Users; staff users
do not need student profile metadata. Then grant access in the Supabase SQL
Editor by inserting their Auth user ID into public.staff_members:

    insert into public.staff_members (user_id, role, club)
    values ('AUTH-USER-UUID', 'ADMIN', null);

For a coordinator, use role 'COORDINATOR' and set club to exactly one of:
i-Tech Hub, Stage & Spotlight, Social Impact, Art & Expression,
Voice & Vision, Nature Warrior, or Frame & Focus. Only an administrator
should run these SQL statements. Never put staff passwords or secret keys in
the site or repository.

Run the updated supabase/setup.sql in the SQL Editor before creating staff
accounts. Database row-level security grants admins access to all student
profiles and registrations; coordinators can read only students and
registrations for their assigned club. Student profile deletion is not
available from the demo dashboard.

SECURITY
Supabase row-level security is the security boundary: students read their own
profile and registrations, admins can read all records, and coordinators can
read records for their assigned club only. The publishable key is public by
design. Do not use this demo for sensitive production data.
