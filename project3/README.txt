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

STAFF / ADMIN PAGES
Staff login and dashboards are disabled for the public demo. The previous
client-side token was not secure and has been removed. Do not re-enable staff
access until it uses server-side role checks and database policies.

SECURITY
Supabase row-level security lets each student read their own profile and
registrations only. The publishable key is public by design; database policies
are the security boundary. Do not use this demo for sensitive production data.
