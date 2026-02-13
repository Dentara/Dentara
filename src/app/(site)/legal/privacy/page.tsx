// app/(site)/legal/privacy/page.tsx
import LegalLayout from "@/components/legal/LegalLayout";

const UPDATED_YEAR = new Date().getFullYear();

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="This Policy explains what personal and medical data Tagiza processes and how it is protected."
    >
      <div className="space-y-8 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        <section>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Last updated: {UPDATED_YEAR}
          </p>
          <p className="mb-3">
            Tagiza is committed to protecting the confidentiality, integrity and
            availability of personal and health-related data processed through the
            platform. This Privacy Policy explains what information we collect, why we
            collect it, how we use it and what choices you have.
          </p>
          <p className="mb-2">
            This Policy is written in general terms and is intended to be compatible with
            modern data protection principles (including concepts found in GDPR-like
            regulations). It does not replace mandatory legal requirements in any
            particular country. Where there is a conflict, the applicable local law
            prevails.
          </p>
        </section>

        {/* 1. Data controller / roles */}
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Roles in data processing</h2>
          <p className="mb-2">
            Tagiza typically acts as a platform provider and technology operator. In
            practice, data protection roles may vary:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              <strong>Clinics</strong> and <strong>doctors</strong> are usually
              responsible for the clinical relationship with the patient and may act as
              the primary &quot;data controller&quot; or equivalent concept in their
              jurisdiction.
            </li>
            <li>
              <strong>Tagiza</strong> often acts as a &quot;data processor&quot; or
              service provider, processing data on behalf of clinics and doctors according
              to contractual instructions.
            </li>
            <li>
              In certain features (for example, generic analytics or platform telemetry),
              Tagiza may act as an independent controller for limited technical data, as
              allowed by law.
            </li>
          </ul>
        </section>

        {/* 2. Categories of data */}
        <section>
          <h2 className="text-lg font-semibold mb-2">2. Categories of data we process</h2>
          <h3 className="font-semibold mb-1">2.1 Account and identity data</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>Name, email address and password hash</li>
            <li>Role (patient, doctor, clinic, admin) and related identifiers</li>
            <li>Contact details such as phone, postal address, country and city</li>
            <li>Profile photo or avatar, if provided</li>
          </ul>

          <h3 className="font-semibold mb-1">2.2 Professional and clinic data</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>Clinic name, address, contact information and logo</li>
            <li>Professional qualifications, specialisations and licences</li>
            <li>Uploaded copies of IDs, licences, diplomas and other credentials</li>
            <li>Verification status and related metadata</li>
          </ul>

          <h3 className="font-semibold mb-1">2.3 Medical and dental data</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Patient records: history, diagnoses, treatment plans and progress notes
            </li>
            <li>Images such as intra-oral photos, radiographs and 3D scans</li>
            <li>Aligner plans, surgical simulations and biomechanical parameters</li>
            <li>
              Appointment information, prescriptions and other clinical documentation
            </li>
          </ul>

          <h3 className="font-semibold mb-1">2.4 Technical and usage data</h3>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>Log data (IP address, browser type, device information)</li>
            <li>Audit logs of login events and important actions</li>
            <li>
              Usage metrics (which modules are used, performance indicators, error logs)
            </li>
          </ul>
        </section>

        {/* 3. Sources of data */}
        <section>
          <h2 className="text-lg font-semibold mb-2">3. How we obtain data</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Data provided directly by patients, doctors and clinics during registration
              or profile completion;
            </li>
            <li>
              Data uploaded by clinics or doctors as part of treatment (for example, when
              they register a patient or upload images and scans);
            </li>
            <li>
              Data generated automatically when using the platform (logs, usage
              statistics, AI outputs and derived features);
            </li>
            <li>
              Data imported from integrated systems or devices, where such integrations
              are explicitly enabled.
            </li>
          </ul>
        </section>

        {/* 4. Purposes */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            4. Purposes for which we process data
          </h2>
          <p className="mb-2">Tagiza processes data for the following main purposes:</p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>to provide, maintain and improve the platform and its features;</li>
            <li>to enable clinics and doctors to manage their patients and workflows;</li>
            <li>to support diagnosis and treatment planning with AI tools;</li>
            <li>to maintain security, auditability and access control;</li>
            <li>to provide customer support and respond to technical issues;</li>
            <li>
              to comply with legal obligations, such as record retention or incident
              reporting, where applicable.
            </li>
          </ul>
          <p>
            Data may also be processed in an anonymised or aggregated form for analytics,
            statistics and improvement of models, as long as no individual can be
            reasonably identified.
          </p>
        </section>

        {/* 5. Legal bases (high-level) */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            5. Legal bases and consent (high-level overview)
          </h2>
          <p className="mb-2">
            Depending on the jurisdiction and on the specific use-case, different legal
            bases may be used for data processing. Common bases include:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              performance of a contract (for example, providing access to a paid Tagiza
              subscription to a clinic);
            </li>
            <li>
              compliance with legal obligations (such as retention of certain clinical
              records by clinics);
            </li>
            <li>
              protection of vital interests (for example, emergency access scenarios
              authorised by law);
            </li>
            <li>
              legitimate interests (such as security logging, fraud prevention and
              product improvement, balanced against user privacy);
            </li>
            <li>
              explicit consent for processing sensitive health data or for using any
              optional AI-based features, where required.
            </li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The detailed legal basis may differ between regions and specific clinical
            relationships. Clinics and doctors are responsible for obtaining and
            documenting appropriate consent in their jurisdiction.
          </p>
        </section>

        {/* 6. Sharing and disclosure */}
        <section>
          <h2 className="text-lg font-semibold mb-2">6. Sharing and disclosure of data</h2>
          <p className="mb-2">
            Tagiza does not sell personal or medical data to third parties. Data may be
            shared in these limited circumstances:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              between a patient and the clinics/doctors they are explicitly linked to
              within Tagiza;
            </li>
            <li>
              with technical service providers (hosting, email delivery, storage, security
              tools) under appropriate data protection agreements;
            </li>
            <li>
              with regulators or authorities if required by law and subject to applicable
              safeguards;
            </li>
            <li>
              with other healthcare providers only when authorised and technically enabled
              (for example, referral workflows or multi-clinic collaborations).
            </li>
          </ul>
          <p>
            When possible, Tagiza uses pseudonymisation, aggregation or anonymisation to
            minimise exposure of personal identifiers.
          </p>
        </section>

        {/* 7. International transfers */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            7. International transfers of personal data
          </h2>
          <p className="mb-2">
            Tagiza may use infrastructure located in different countries or regions. This
            means that personal data may be transferred across borders, subject to
            appropriate safeguards.
          </p>
          <p className="mb-2">
            Where required by law, additional measures may be implemented, such as:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              contractual clauses governing data protection between Tagiza and service
              providers;
            </li>
            <li>encryption in transit and at rest, where technically appropriate;</li>
            <li>
              minimisation of personal identifiers, especially in analytics and AI
              training pipelines.
            </li>
          </ul>
        </section>

        {/* 8. Security measures */}
        <section>
          <h2 className="text-lg font-semibold mb-2">8. Security measures</h2>
          <p className="mb-2">
            Tagiza applies a combination of organisational and technical measures to
            protect data, which may include:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>access control, authentication and role-based permissions;</li>
            <li>encryption in transit (HTTPS) and encryption at rest in key systems;</li>
            <li>audit logs for important actions and security events;</li>
            <li>regular backups and disaster recovery planning;</li>
            <li>monitoring for abnormal usage patterns or suspected abuse.</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No system can guarantee absolute security. Clinics and doctors should maintain
            their own local safeguards and policies for devices, networks and staff
            access.
          </p>
        </section>

        {/* 9. Retention */}
        <section>
          <h2 className="text-lg font-semibold mb-2">9. Data retention</h2>
          <p className="mb-2">
            Tagiza retains data for as long as necessary to operate the platform, to
            fulfil contractual obligations and to comply with applicable legal retention
            periods. Retention rules may differ for:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>account information and audit logs;</li>
            <li>clinical records (which may be retained by clinics for many years);</li>
            <li>billing and transactional information.</li>
          </ul>
          <p>
            When data is no longer required, it may be anonymised or securely deleted in
            accordance with internal policies and technical capabilities.
          </p>
        </section>

        {/* 10. Rights and choices */}
        <section>
          <h2 className="text-lg font-semibold mb-2">10. Your rights and choices</h2>
          <p className="mb-2">
            Depending on your location and role, you may have certain rights regarding
            personal data processed via Tagiza. These may include:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>the right to access and view your personal information;</li>
            <li>the right to request correction of inaccurate data;</li>
            <li>
              the right to request deletion of certain data, subject to legal and clinical
              obligations;
            </li>
            <li>
              the right to object to or restrict certain processing activities, such as
              marketing;
            </li>
            <li>the right to request data export in a structured format.</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Some requests must be directed to the clinic or doctor acting as data
            controller, rather than to Tagiza directly. Tagiza will cooperate with
            legitimate requests to the extent technically and legally possible.
          </p>
        </section>

        {/* 11. Cookies & tracking */}
        <section>
          <h2 className="text-lg font-semibold mb-2">11. Cookies and similar technologies</h2>
          <p className="mb-2">
            Tagiza may use cookies and similar technologies to provide core functionality,
            enhance user experience and collect analytics. These may include:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>session cookies for secure login and navigation;</li>
            <li>preference cookies to remember language and display settings;</li>
            <li>analytics cookies for aggregate usage statistics.</li>
          </ul>
          <p>
            Where required by law, you will be informed about cookie usage and given a
            choice to consent to non-essential cookies. Some parts of the platform may not
            function properly if certain cookies are disabled.
          </p>
        </section>

        {/* 12. Contact */}
        <section>
          <h2 className="text-lg font-semibold mb-2">12. Contact and complaints</h2>
          <p className="mb-2">
            If you have questions or concerns regarding this Privacy Policy or how your
            data is processed on Tagiza, you can contact the platform administrators
            through the contact details provided in your dashboard or on the official
            website.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You may also have the right to lodge a complaint with a relevant data
            protection authority in your jurisdiction if you believe your rights have been
            violated.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
