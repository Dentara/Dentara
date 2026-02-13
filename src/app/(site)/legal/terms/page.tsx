// app/(site)/legal/terms/page.tsx
import LegalLayout from "@/components/legal/LegalLayout";

const UPDATED_YEAR = new Date().getFullYear();

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="These Terms describe how you may use the Tagiza platform as a patient, doctor or clinic."
    >
      <div className="space-y-8 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        {/* Intro */}
        <section>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Last updated: {UPDATED_YEAR}
          </p>
          <p className="mb-3">
            Tagiza is a digital platform designed for dental and medical workflows. It
            connects patients, clinics and licensed healthcare professionals and may use
            AI-assisted tools to support clinical decision making. By creating an account
            or using the platform in any way, you agree to these Terms of Service.
          </p>
          <p className="mb-2">
            These Terms are written in clear language to help you understand how Tagiza
            works. They do not replace any mandatory legal obligations that apply in your
            country or region. If you are unsure about your legal position, you should seek
            independent legal advice.
          </p>
        </section>

        {/* 1. Definitions */}
        <section id="definitions">
          <h2 className="text-lg font-semibold mb-2">1. Definitions</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <strong>“Tagiza”</strong> means the platform, software and related services
              provided under the Tagiza brand.
            </li>
            <li>
              <strong>“User”</strong> means any person or organisation that creates an
              account or accesses Tagiza (including patients, doctors, clinics and admin
              users).
            </li>
            <li>
              <strong>“Patient”</strong> means an individual whose medical or dental data
              is uploaded, stored or processed on Tagiza.
            </li>
            <li>
              <strong>“Doctor”</strong> means a licensed healthcare professional (such as
              dentist, orthodontist, surgeon or similar) who uses Tagiza for professional
              purposes.
            </li>
            <li>
              <strong>“Clinic”</strong> means a legal entity providing healthcare services
              and using Tagiza to manage patients, staff or treatment workflows.
            </li>
            <li>
              <strong>“Content”</strong> includes any information, images, scans, 3D
              models, notes, treatment plans or other data uploaded or created through the
              platform.
            </li>
            <li>
              <strong>“AI Tools”</strong> means any Tagiza feature that uses machine
              learning, artificial intelligence or algorithmic decision support.
            </li>
          </ul>
        </section>

        {/* 2. Scope and changes */}
        <section id="scope">
          <h2 className="text-lg font-semibold mb-2">2. Scope of the Terms</h2>
          <p className="mb-2">
            These Terms apply to all access to and use of Tagiza, including:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>creating and managing accounts;</li>
            <li>uploading and viewing medical or dental records;</li>
            <li>using AI-assisted planning, analysis or automation;</li>
            <li>using communication, booking, reporting or analytics features;</li>
            <li>using public profile pages and search features.</li>
          </ul>
          <p>
            Tagiza may update these Terms to reflect improvements to the platform, new
            legal requirements or security needs. When changes are material, we will
            notify you through the platform or by email. Continued use of Tagiza after the
            updated Terms become effective constitutes acceptance of those changes.
          </p>
        </section>

        {/* 3. Accounts and eligibility */}
        <section id="accounts">
          <h2 className="text-lg font-semibold mb-2">3. Accounts and eligibility</h2>
          <h3 className="font-semibold mb-1">3.1 Patients</h3>
          <p className="mb-2">
            To create a patient account you must be able to enter into a binding agreement
            with Tagiza under the laws that apply to you. In some regions, this may
            require parental or guardian consent for minors. Clinics and doctors may also
            register patients on their behalf when legally permitted.
          </p>

          <h3 className="font-semibold mb-1">3.2 Doctors</h3>
          <p className="mb-2">
            To register as a doctor on Tagiza, you must hold a valid professional licence
            or registration in your jurisdiction and use the platform only within the
            scope of your licence. Tagiza may request documents (such as ID, licence,
            diplomas) and may verify them using manual checks and AI-based tools.
          </p>

          <h3 className="font-semibold mb-1">3.3 Clinics</h3>
          <p className="mb-2">
            To register a clinic, you must be legally authorised to represent the clinic
            or organisation. You are responsible for ensuring that staff members with
            access to Tagiza are appropriately trained and authorised.
          </p>

          <h3 className="font-semibold mb-1">3.4 Account security</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>You must keep your login credentials confidential.</li>
            <li>
              You are responsible for all activity that occurs under your account unless
              you promptly report suspected abuse or unauthorised access.
            </li>
            <li>
              You must not share your account with other people or allow unlicensed
              persons to use a professional account.
            </li>
          </ul>
        </section>

        {/* 4. Acceptable use */}
        <section id="acceptable-use">
          <h2 className="text-lg font-semibold mb-2">4. Acceptable use of Tagiza</h2>
          <p className="mb-2">
            You agree not to use Tagiza in any way that is unlawful, harmful, or
            inconsistent with the intended purpose of the platform. In particular, you
            agree to:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              comply with applicable healthcare, privacy and data protection laws in your
              region;
            </li>
            <li>only upload content that you have the legal right to share;</li>
            <li>
              not use Tagiza to harass, discriminate against or harm any other user or
              patient;
            </li>
            <li>
              not attempt to gain unauthorised access to other accounts or to any part of
              the infrastructure;
            </li>
            <li>
              not reverse engineer, copy or exploit Tagiza&apos;s code, models or
              infrastructure beyond what is allowed by these Terms.
            </li>
          </ul>
          <p>
            Tagiza reserves the right to suspend or terminate accounts that violate these
            rules or that pose a security or legal risk.
          </p>
        </section>

        {/* 5. Roles and responsibilities */}
        <section id="roles">
          <h2 className="text-lg font-semibold mb-2">5. Roles and responsibilities</h2>
          <h3 className="font-semibold mb-1">5.1 Clinics and doctors</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Clinics and doctors remain fully responsible for clinical decisions,
              diagnoses and treatments provided to patients.
            </li>
            <li>
              Tagiza does not practise medicine and does not create a doctor–patient
              relationship. It is a digital tool used by licensed professionals.
            </li>
            <li>
              Clinics are responsible for assigning appropriate roles and permissions to
              their staff within the platform.
            </li>
            <li>
              Clinics and doctors are responsible for obtaining any required patient
              consents and for complying with local retention rules for medical records.
            </li>
          </ul>

          <h3 className="font-semibold mb-1">5.2 Patients</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Patients may use Tagiza to view their data, communicate with clinics and
              doctors, and track their treatment.
            </li>
            <li>
              Patients are responsible for keeping their contact details and emergency
              information up to date.
            </li>
            <li>
              Patients must not misuse access to clinician or clinic profiles, including
              for harassment, abuse or misleading reviews.
            </li>
          </ul>
        </section>

        {/* 6. AI tools */}
        <section id="ai-tools">
          <h2 className="text-lg font-semibold mb-2">6. AI tools and decision support</h2>
          <p className="mb-2">
            Tagiza may provide AI-assisted features such as image analysis, treatment
            suggestions, automated reports or risk scoring. These tools are designed to
            support, not replace, clinical judgement.
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              AI outputs may be incomplete, uncertain or incorrect and must always be
              reviewed by a qualified professional.
            </li>
            <li>
              Doctors and clinics are responsible for verifying AI suggestions against the
              patient&apos;s full clinical picture.
            </li>
            <li>
              Patients should never rely solely on automated messages or AI outputs
              without consulting their doctor.
            </li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI tools may use anonymised or pseudonymised data to improve models and
            performance. Further details are described in the Privacy Policy and Medical
            &amp; AI Consent.
          </p>
        </section>

        {/* 7. Data ownership & IP */}
        <section id="data-ip">
          <h2 className="text-lg font-semibold mb-2">7. Data ownership and intellectual property</h2>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Patients remain the primary owners of their personal and medical data, in
              accordance with applicable law.
            </li>
            <li>
              Clinics and doctors may be legally required to maintain copies of medical
              records as part of the clinical file.
            </li>
            <li>
              Tagiza is granted a limited licence to store, process and back up data in
              order to operate the platform and provide services.
            </li>
            <li>
              Tagiza retains all intellectual property rights in its software, user
              interface, AI models, branding and documentation.
            </li>
          </ul>
        </section>

        {/* 8. Security & availability */}
        <section id="security">
          <h2 className="text-lg font-semibold mb-2">8. Security and availability</h2>
          <p className="mb-2">
            Tagiza applies technical and organisational measures intended to protect data
            from unauthorised access, loss or misuse. These measures may include encryption,
            access controls, logging and regular security reviews.
          </p>
          <p className="mb-2">
            However, no system can be completely secure or always available. You accept
            that:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              the platform may be temporarily unavailable for maintenance, upgrades or
              unexpected outages;
            </li>
            <li>
              despite reasonable safeguards, security incidents may still occur due to
              factors beyond Tagiza&apos;s control;
            </li>
            <li>
              clinics and doctors must maintain appropriate local backups or export data
              where legally required.
            </li>
          </ul>
        </section>

        {/* 9. Fees (placeholder) */}
        <section id="fees">
          <h2 className="text-lg font-semibold mb-2">9. Fees and payment (if applicable)</h2>
          <p className="mb-2">
            Some features of Tagiza may be offered as paid plans or may involve
            transaction fees. If and when such fees apply, they will be described in a
            separate pricing page or agreement. In such cases:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>you will be informed about applicable prices and billing cycles;</li>
            <li>
              you are responsible for all charges incurred under your account unless you
              promptly report abuse;
            </li>
            <li>
              failure to pay may result in suspension or downgrade of your account,
              without affecting legal obligations to retain or export medical data.
            </li>
          </ul>
        </section>

        {/* 10. Liability */}
        <section id="liability">
          <h2 className="text-lg font-semibold mb-2">10. Disclaimers and limitation of liability</h2>
          <p className="mb-2">
            To the maximum extent permitted by applicable law, Tagiza is provided “as is”
            and “as available”, without any guarantees of uninterrupted operation, absence
            of errors or suitability for a specific medical purpose.
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Tagiza is not responsible for clinical decisions or outcomes resulting from
              the use of the platform or AI tools.
            </li>
            <li>
              Tagiza is not liable for indirect, incidental, consequential or punitive
              damages, such as loss of profits, loss of data or reputational harm.
            </li>
            <li>
              Direct liability (if any) may be limited to the amount paid for the
              applicable services over a defined period, where permitted by law.
            </li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Some jurisdictions do not allow limitations on certain types of liability. In
            those cases, the above limitations apply only to the extent allowed by local
            law.
          </p>
        </section>

        {/* 11. Termination */}
        <section id="termination">
          <h2 className="text-lg font-semibold mb-2">11. Suspension and termination</h2>
          <p className="mb-2">
            Tagiza may suspend or terminate access to the platform if there is:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>suspected or confirmed abuse, fraud or security incident;</li>
            <li>
              material breach of these Terms, privacy obligations or professional
              regulations;
            </li>
            <li>legal requirement to restrict access in a particular jurisdiction.</li>
          </ul>
          <p>
            Users may request account closure and data export in accordance with the
            Privacy Policy and applicable law. Certain records may need to be retained for
            legal, clinical or audit purposes.
          </p>
        </section>

        {/* 12. Contact */}
        <section id="contact">
          <h2 className="text-lg font-semibold mb-2">12. Contact and questions</h2>
          <p className="mb-2">
            If you have questions about these Terms or about how Tagiza operates, you can
            contact the platform administrators through the official website or support
            channels described in your dashboard.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This document is a general framework and may be adapted to specific legal
            requirements and jurisdictions in future revisions.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
