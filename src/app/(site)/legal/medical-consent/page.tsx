// app/(site)/legal/medical-consent/page.tsx
import LegalLayout from "@/components/legal/LegalLayout";

const UPDATED_YEAR = new Date().getFullYear();

export default function MedicalConsentPage() {
  return (
    <LegalLayout
      title="Medical & AI Data Consent"
      subtitle="How your health information and AI-assisted features are used within Tagiza."
    >
      <div className="space-y-8 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        <section>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Last updated: {UPDATED_YEAR}
          </p>
          <p className="mb-3">
            This Medical &amp; AI Data Consent document explains how your medical and
            dental data may be processed when you use Tagiza or when your clinic or doctor
            uses Tagiza to manage your treatment. It also explains how AI-assisted tools
            work and what you are agreeing to when those tools are used.
          </p>
          <p className="mb-2">
            By creating a patient account on Tagiza, or by being registered as a patient
            by a clinic or doctor, you acknowledge that your health information may be
            processed within the platform for the purposes described below. Where local
            law requires explicit consent, this document is intended to capture that
            consent in a transparent way.
          </p>
        </section>

        {/* 1. Types of health data */}
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Types of health data processed</h2>
          <p className="mb-2">
            Depending on your treatment and the features used, the following information
            may be processed on Tagiza:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>personal details (name, date of birth, contact details);</li>
            <li>medical and dental history, current conditions and allergies;</li>
            <li>diagnoses, treatment plans and clinical progress notes;</li>
            <li>2D and 3D images, radiographs, intra-oral photos and scans;</li>
            <li>digital models, aligner setups and biomechanical parameters;</li>
            <li>appointment history, prescriptions and follow-up information.</li>
          </ul>
          <p>
            Sensitive information such as health status, treatment details and images is
            treated with a high degree of confidentiality and technical protection.
          </p>
        </section>

        {/* 2. Purpose of processing */}
        <section>
          <h2 className="text-lg font-semibold mb-2">2. Purposes of processing your data</h2>
          <p className="mb-2">
            Your health data is processed on Tagiza primarily for the following purposes:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              to enable your clinic and doctor to plan, deliver and monitor your treatment;
            </li>
            <li>to store and organise your records in a secure digital format;</li>
            <li>
              to provide visualisations, measurements and planning tools to your doctor;
            </li>
            <li>to document treatment progress and outcomes over time;</li>
            <li>
              to support communication between you and your clinic (appointments, notes,
              reminders, reports).
            </li>
          </ul>
        </section>

        {/* 3. AI-assisted features */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            3. AI-assisted features and how they are used
          </h2>
          <p className="mb-2">
            Tagiza may use AI-assisted tools to support your clinic and doctor. Examples
            include:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              automated analysis of images or scans to highlight areas of interest or
              measure certain parameters;
            </li>
            <li>
              generation of suggested treatment steps, sequences or aligner staging
              options;
            </li>
            <li>
              prediction or simulation of certain outcomes under different treatment
              scenarios, based on anonymised historical data;
            </li>
            <li>
              automated structuring of notes or records to make your history more
              searchable and consistent.
            </li>
          </ul>
          <p className="mb-2">
            These AI tools are designed as decision-support systems. They provide
            assistance to your doctor or clinic but do <strong>not</strong> replace
            professional judgement. Your doctor remains fully responsible for the final
            decisions about your treatment.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI models may occasionally produce incomplete or inaccurate suggestions.
            Professionals using Tagiza must critically review AI outputs and always verify
            them against the full clinical picture.
          </p>
        </section>

        {/* 4. Use of data for model improvement */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            4. Use of data for analytics and model improvement
          </h2>
          <p className="mb-2">
            To maintain and improve Tagiza&apos;s performance and AI tools, certain data
            may be used for analytics, quality assurance and model training. Where
            possible, this is performed on anonymised or pseudonymised data to reduce the
            risk of re-identification.
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              Direct identifiers such as your full name, email address or contact details
              are not required for algorithm training and are removed or replaced where
              feasible.
            </li>
            <li>
              Clinical data may be aggregated from many patients to identify patterns and
              improve predictive performance.
            </li>
            <li>
              If stricter consent is required by local law, Tagiza or your clinic may ask
              you separately before including your data in such processes.
            </li>
          </ul>
        </section>

        {/* 5. Rights and control */}
        <section>
          <h2 className="text-lg font-semibold mb-2">5. Your rights and control</h2>
          <p className="mb-2">
            You remain at the centre of decisions about your health data. Depending on
            your local laws and your clinical relationship, you may have the right to:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>request access to your medical records stored in Tagiza;</li>
            <li>
              request corrections if you notice inaccuracies in your personal information;
            </li>
            <li>
              request that certain optional AI-based features not be used for your case,
              where this is technically and clinically feasible;
            </li>
            <li>
              withdraw or modify your consent for certain processing activities, subject
              to legal and clinical limitations.
            </li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Some of these requests may need to be handled by your clinic or doctor, who
            act as the primary controller of your clinical data. Tagiza will assist them
            in responding where technically possible.
          </p>
        </section>

        {/* 6. How to withdraw or adjust consent */}
        <section>
          <h2 className="text-lg font-semibold mb-2">
            6. Withdrawing or adjusting your consent
          </h2>
          <p className="mb-2">
            If you wish to withdraw or adjust your consent regarding the use of Tagiza or
            its AI features:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              you should first speak to your clinic or doctor to understand how this may
              affect your ongoing treatment;
            </li>
            <li>
              your clinic may switch off certain optional features for your profile where
              technically feasible;
            </li>
            <li>
              you may request export or transfer of your records, subject to legal
              retention duties and professional guidelines.
            </li>
          </ul>
          <p>
            Completely deleting all clinical data may not always be possible due to legal
            obligations that require healthcare providers to retain records for a
            specified period.
          </p>
        </section>

        {/* 7. Risks and limitations */}
        <section>
          <h2 className="text-lg font-semibold mb-2">7. Risks and limitations</h2>
          <p className="mb-2">
            While Tagiza takes technical and organisational measures to safeguard your
            information, there are inherent risks in any digital system:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              no system can be guaranteed to be fully secure or always available due to
              factors such as network outages or third-party failures;
            </li>
            <li>
              AI models can never be perfect and may occasionally generate suggestions
              that are not clinically appropriate;
            </li>
            <li>
              human error by clinic staff or device misuse could lead to exposure of
              information if local safeguards are not followed.
            </li>
          </ul>
          <p>
            By agreeing to this Medical &amp; AI Data Consent, you acknowledge these risks
            and agree that Tagiza provides tools and infrastructure to your clinic and
            doctor but does not replace their professional duty of care.
          </p>
        </section>

        {/* 8. Summary of your agreement */}
        <section>
          <h2 className="text-lg font-semibold mb-2">8. Summary of your agreement</h2>
          <p className="mb-2">
            By using Tagiza as a patient or by being onboarded by a clinic or doctor, you
            understand and agree that:
          </p>
          <ul className="list-disc ml-5 space-y-1 mb-2">
            <li>
              your medical and dental data will be processed within the Tagiza platform
              for treatment, documentation and related purposes;
            </li>
            <li>
              AI-assisted features may be used to help your clinic or doctor analyse data
              and plan treatment, but they do not replace professional judgement;
            </li>
            <li>
              anonymised or aggregated data may be used to improve the quality and safety
              of Tagiza and its models, under appropriate safeguards;
            </li>
            <li>
              you may contact your clinic or doctor at any time to ask questions, request
              access or discuss the impact of these tools on your care.
            </li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If you do not agree with the use of your data as described, or if you have
            questions, you should discuss this with your clinic or doctor before
            continuing to use the platform for your care.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
