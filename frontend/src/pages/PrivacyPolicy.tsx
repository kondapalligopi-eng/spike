import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '@/components/LegalLayout';

const LAST_UPDATED = '29 June 2026';

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How HiSpike collects, uses and protects your personal information when you use our services."
      lastUpdated={LAST_UPDATED}
      path="/privacy"
    >
      <p>
        This Privacy Policy explains how HiSpike ("HiSpike", "we", "us") collects, uses, shares and
        protects your personal information when you use our website, directory and Pet Stories pages
        (the "Services"). By using the Services, you agree to the practices described here.
      </p>

      <LegalSection heading="1. Information we collect">
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account information</strong> — your name, email address, optional phone number and
            a securely hashed password when you create an account.
          </li>
          <li>
            <strong>Pet content</strong> — information and photos you add about your pet (name, story,
            highlights and images) when you create a Pet Stories page.
          </li>
          <li>
            <strong>Submissions</strong> — details you send through contact, feedback or "list your
            business" forms.
          </li>
          <li>
            <strong>Usage and device data</strong> — basic, mostly aggregated information about how you
            use the site (such as pages visited), collected via privacy-friendly analytics.
          </li>
          <li>
            <strong>Local storage</strong> — small amounts of data stored in your browser to keep you
            signed in and remember preferences.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>create and manage your account and authenticate you;</li>
          <li>host and display the Pet Stories pages you create;</li>
          <li>respond to your enquiries and provide support;</li>
          <li>operate, maintain, secure and improve the Services;</li>
          <li>process payments for any purchases you make;</li>
          <li>comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Public content">
        <p>
          A Pet Stories page is <strong>public by design</strong>. Any name, photos and text you add to
          it can be viewed by anyone who has the link, and may be indexed by search engines or shown as
          a preview when the link is shared. Please do not include information you want to keep private.
          You can edit or delete your page at any time from your account.
        </p>
      </LegalSection>

      <LegalSection heading="4. How we share information">
        <p>
          We do <strong>not</strong> sell your personal information. We share it only with service
          providers who help us run the Services, and only as needed, including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Hosting &amp; infrastructure</strong> — to run our website and backend;</li>
          <li><strong>Image storage</strong> — to store and serve photos you upload;</li>
          <li><strong>Payment processing</strong> — e.g. Razorpay, to handle payments securely;</li>
          <li><strong>Form delivery</strong> — to deliver messages you submit through our forms;</li>
          <li><strong>Analytics</strong> — to understand site usage in aggregate.</li>
        </ul>
        <p>
          We may also disclose information where required by law, to protect our rights or users, or in
          connection with a business transfer.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cookies and local storage">
        <p>
          We use essential browser storage to keep you signed in and remember your preferences, and
          privacy-friendly analytics to measure site usage. We do not use intrusive advertising
          trackers. You can clear this data through your browser settings, though some features may
          stop working if you do.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data retention">
        <p>
          We keep your information for as long as your account is active or as needed to provide the
          Services, and for any longer period required by law. When you delete your account or a Pet
          Stories page, we remove the associated content within a reasonable time, except where we must
          retain it to meet legal obligations.
        </p>
      </LegalSection>

      <LegalSection heading="7. Data security">
        <p>
          We take reasonable technical and organisational measures to protect your information,
          including hashing passwords and using encrypted connections. No method of transmission or
          storage is completely secure, however, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your rights">
        <p>
          Subject to applicable law (including India's Digital Personal Data Protection Act, 2023), you
          may ask us to access, correct or delete your personal information, or to withdraw consent. To
          make a request, email{' '}
          <a href="mailto:support@hispike.in" className="text-primary-600 hover:underline">support@hispike.in</a>.
          You can also update much of your information directly in your account.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children's privacy">
        <p>
          The Services are intended for users aged 18 and over. We do not knowingly collect personal
          information from children. If you believe a child has provided us information, contact us and
          we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will revise the "Last updated" date
          above, and your continued use of the Services means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact us">
        <p>
          Questions about your privacy? Email{' '}
          <a href="mailto:support@hispike.in" className="text-primary-600 hover:underline">support@hispike.in</a>.
          See also our{' '}
          <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>.
        </p>
        <p className="text-sm text-warm-600">
          <strong className="text-warm-800">HiSpike</strong> is a sole proprietorship registered in India.<br />
          GSTIN: <span className="font-mono">29EHWPS8826R1ZK</span><br />
          Registered address: WeWork Salarpuria Magnificia, Tin Factory, 78 Old Madras Road,
          Mahadevapura, next to KR Puram, Bangalore, Karnataka 560016.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
