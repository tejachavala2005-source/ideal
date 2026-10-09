IDEAL COLLEGE CLUBS
Open index.html (or mainpart/main.html) in Chrome/Edge.

Pages
- mainpart/main.html          Home (clubs, competitions, gallery)
- mainpart/logbtn.html        Login (+ forgot password)
- mainpart/registration.html  Student registration
- mainpart/techo/tech.html, stage-spotlight/stage.html, social-impact/soc.html,
  arts-expressions/arts.html, speech/speech.html, nature/nature.html, frame-focus/frame.html

Login/Register is a front-end demo: accounts are stored in the browser (localStorage).
Connect a backend + database for real accounts.
Shared files: mainpart/auth.js, mainpart/auth.css

STAFF LOGIN (Admin / Coordinator)
- mainpart/staff-config.js    <-- THE STAFF TOKEN IS HERE (edit STAFF_TOKEN to change it)
- mainpart/staff-login.html   login (Admin tab: token | Coordinator tab: token + name + club)
- mainpart/admin.html         admin dashboard
- mainpart/coordinator.html   coordinator dashboard (own club only)
One token is shared by admin and coordinators. Front-end demo only - for real security move checks to a server.
