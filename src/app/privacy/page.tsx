import Link from "next/link";
import "../auth.css";

export default function PrivacyPage() {
  return (
    <div className="auth-body" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <div className="auth-card" style={{ maxWidth: 720 }}>
        <div className="auth-brand">
          <div className="auth-brand-icon">✦</div>
          <h1>SECM</h1>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 8, color: "#111" }}>Privacy Policy</h2>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: 13, marginBottom: 24 }}>
          Last updated: July 20, 2026
        </p>

        <div style={{ color: "rgba(0,0,0,0.7)", fontSize: 14, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 20 }}>
            SECM (Student Event and Challenge Management) is a web-based platform built as an academic project (CACS256 – Project Work I, Tribhuvan University) to help students discover, participate in, and organize hackathons, coding contests, design challenges, and similar student competitions. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data. We are committed to protecting your privacy and handling your data transparently.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            1. Information We Collect
          </h3>
          <p style={{ marginBottom: 10 }}>
            We collect different types of information depending on how you interact with the platform. All data is provided voluntarily by you during registration, profile setup, or participation in challenges.
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Account Data:</strong> When you sign up, we collect your full name, email address, and a securely hashed password. Your role (Student, Organizer, or Admin) is also recorded to determine which features you can access.</li>
            <li><strong>Student Profile:</strong> If you register as a student, you may optionally provide your educational background (college, major, year of study), skills (programming languages, tools, etc.), and interests (e.g., AI, web development, design) to help us recommend relevant challenges.</li>
            <li><strong>Organizer Profile:</strong> If you register as an organizer, we collect your organization name, a brief description of your organization, and your account verification status (approved by an Admin).</li>
            <li><strong>Challenge Participation Data:</strong> When you join a challenge, we record your participation (individual or as part of a team). If you create or join a team, we store team names, member lists, and roles within the team.</li>
            <li><strong>Submissions:</strong> When you submit work for a challenge, we collect the files you upload (or external links you provide) along with any description you include. This includes project source code, design files, presentations, or any other material relevant to the challenge.</li>
            <li><strong>Evaluation Data:</strong> Organizers may provide scores and feedback on your submissions. These are stored to determine winners and for historical reference.</li>
            <li><strong>Winner Announcements:</strong> If you are placed among the top entries, your name, team name, and the position you secured are stored and displayed on the challenge page.</li>
            <li><strong>Automatically Collected Data:</strong> Like most web applications, we automatically collect certain technical information when you visit the platform, such as your IP address, browser type, device type, and pages visited. This data is anonymized and used solely for analytics and performance optimization.</li>
          </ul>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            2. How We Use Your Information
          </h3>
          <p style={{ marginBottom: 10 }}>
            Your information is used to provide, maintain, and improve the SECM platform. Specifically, we use it for:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Account Management:</strong> To create and manage your user account, authenticate your identity, and personalize your experience (e.g., showing relevant challenges).</li>
            <li><strong>Challenge Operations:</strong> To allow organizers to create and manage challenges, let students browse and join challenges, form teams, submit work, and receive scores and feedback.</li>
            <li><strong>Results Publication:</strong> To announce winners and display challenge results publicly within the platform.</li>
            <li><strong>Communication:</strong> To send you important notifications about challenge deadlines, team invitations, submission status, or platform updates (via email or in-app alerts).</li>
            <li><strong>Analytics & Improvement:</strong> To understand how the platform is used, identify issues, and enhance user experience. All analytics data is aggregated and anonymized.</li>
            <li><strong>Academic Research:</strong> As this is a university project, aggregated, anonymized data may be used in project reports or presentations to demonstrate system capabilities – but never in a way that identifies individual users.</li>
          </ul>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            3. Legal Basis for Processing (GDPR & General Principles)
          </h3>
          <p style={{ marginBottom: 10 }}>
            Although SECM is an academic project, we respect privacy principles. We process your personal data on the following bases:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Consent:</strong> By creating an account and using the platform, you consent to the collection and use of your data as described here.</li>
            <li><strong>Contractual Necessity:</strong> To fulfil our agreement with you (e.g., managing your participation in a challenge).</li>
            <li><strong>Legitimate Interests:</strong> To operate the platform, ensure security, and improve our services, provided these interests do not override your rights.</li>
          </ul>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            4. Data Sharing and Third-Party Services
          </h3>
          <p style={{ marginBottom: 10 }}>
            We do not sell, rent, or trade your personal data with third parties for marketing purposes. However, we rely on a few trusted service providers to host and operate the platform:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Neon (PostgreSQL):</strong> All structured data (user accounts, profiles, challenges, submissions, scores, etc.) is stored on Neon's serverless PostgreSQL database. Neon encrypts data at rest and in transit.</li>
            <li><strong>Cloudinary:</strong> Any files you upload (images, documents, source code archives) are stored via Cloudinary's media management service. They provide secure storage and content delivery.</li>
            <li><strong>Vercel:</strong> The frontend and backend of the application are hosted on Vercel. They may collect usage logs for performance monitoring, but these logs are anonymized and not used for marketing.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            These providers are bound by data processing agreements and comply with applicable data protection regulations. We do not share your data with any other third parties unless required by law.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            5. Data Security
          </h3>
          <p style={{ marginBottom: 10 }}>
            We take data security seriously. The following measures are in place:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Password Hashing:</strong> Passwords are hashed using a strong one-way hashing algorithm (via Better Auth) before they are stored. We never have access to your plain-text password.</li>
            <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using HTTPS. Data stored in databases is encrypted at rest.</li>
            <li><strong>Access Controls:</strong> Role-based access control ensures that only authorized users (e.g., organizers or admins) can view or modify certain data (like submissions or scores).</li>
            <li><strong>Regular Audits:</strong> As an academic project, we periodically review security practices to identify potential vulnerabilities.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            Despite these measures, no system is 100% secure. If you suspect any unauthorized access to your account, please contact us immediately.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            6. Data Retention
          </h3>
          <p style={{ marginBottom: 10 }}>
            We retain your data for as long as your account is active and for a reasonable period thereafter to fulfil the purposes for which it was collected, including for academic record-keeping and project demonstration. Specifically:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Account Data:</strong> Retained until you request account deletion. After deletion, we may retain anonymized data for analysis.</li>
            <li><strong>Challenge & Submission Data:</strong> Retained for the lifetime of the project (at least until the academic year concludes) and may be archived for future reference or to serve as a portfolio for students.</li>
            <li><strong>Analytics Logs:</strong> Retained in aggregated, anonymized form for up to 12 months.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            If you wish to delete your account and associated data, please contact the platform administrator. We will respond within a reasonable timeframe.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            7. Your Rights
          </h3>
          <p style={{ marginBottom: 10 }}>
            Depending on your jurisdiction, you may have certain rights regarding your personal data. We strive to accommodate these rights:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> You can update or correct your profile information at any time through the platform.</li>
            <li><strong>Deletion:</strong> You can request that we delete your account and associated data (subject to legal or academic retention obligations).</li>
            <li><strong>Objection/Restriction:</strong> You can object to certain processing activities, such as direct marketing (which we do not engage in) or request restriction of processing.</li>
            <li><strong>Data Portability:</strong> You can request a machine-readable copy of your data in a commonly used format.</li>
          </ul>
          <p style={{ marginBottom: 16 }}>
            To exercise any of these rights, please contact us via the details in Section 10. We will handle your request without undue delay.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            8. Cookies and Tracking Technologies
          </h3>
          <p style={{ marginBottom: 10 }}>
            SECM uses essential cookies to maintain your session, remember your login status, and provide a seamless experience. These cookies are strictly necessary for the functioning of the platform. We do not use tracking cookies for advertising or third-party analytics. For performance monitoring, we may collect anonymized usage statistics via Vercel Analytics, which do not identify individual users. You can manage your cookie preferences through your browser settings, but disabling essential cookies may affect your ability to use the platform.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            9. Children's Privacy
          </h3>
          <p style={{ marginBottom: 16 }}>
            SECM is not intended for children under the age of 13. We do not knowingly collect personal data from children. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            10. Changes to This Privacy Policy
          </h3>
          <p style={{ marginBottom: 16 }}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated "Last updated" date. We encourage you to review this policy periodically. Your continued use of the platform after any changes constitutes your acceptance of the updated policy.
          </p>

          <h3 style={{ fontSize: 17, color: "#111", margin: "24px 0 10px" }}>
            11. Contact Information
          </h3>
          <p style={{ marginBottom: 10 }}>
            This project is an academic initiative under the BCA program at Tribhuvan University. For any questions, concerns, or requests regarding this Privacy Policy or your data, please reach out to the project developer:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Name:</strong> [Pradip Mishra & Anish Subedi]</li>
            <li><strong>Email:</strong> [help.secm@gmail.com]</li>
            <li><strong>Institution:</strong> Tribhuvan University, Kathmandu, Nepal</li>
          </ul>
          <p style={{ marginBottom: 24 }}>
            We will respond to your inquiry as soon as possible.
          </p>
        </div>

        <Link href="/register" className="auth-switch-link" style={{ display: "block", marginTop: 8 }}>
          ← Back to Sign up
        </Link>
      </div>
    </div>
  );
}