import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '@/components/LegalLayout';

const LAST_UPDATED = '29 June 2026';

export function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The terms governing your use of HiSpike — our pet-care platform, directory and Pet Stories pages."
      lastUpdated={LAST_UPDATED}
      path="/terms"
    >
      <p>
        Welcome to HiSpike. These Terms of Service ("Terms") are a legal agreement between you and
        HiSpike ("HiSpike", "we", "us") and govern your access to and use of the HiSpike website,
        directory listings, Pet Stories pages and any related services (together, the "Services"). By
        creating an account or using the Services, you agree to these Terms. If you do not agree,
        please do not use the Services.
      </p>

      <LegalSection heading="1. Who can use HiSpike">
        <p>
          You must be at least 18 years old and able to form a binding contract to create an account
          or use the Services. By using HiSpike you confirm that you meet these requirements and that
          the information you provide is accurate and current.
        </p>
      </LegalSection>

      <LegalSection heading="2. Your account">
        <p>
          You are responsible for keeping your login credentials confidential and for all activity
          that happens under your account. Tell us promptly at{' '}
          <a href="mailto:support@hispike.in" className="text-primary-600 hover:underline">support@hispike.in</a>{' '}
          if you believe your account has been used without your permission. We may suspend or close
          accounts that breach these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="3. Directory listings are informational">
        <p>
          HiSpike lists vets, dog parks, grooming salons, swimming and training providers, dog
          walkers and pet-supply brands across Bengaluru and beyond. These listings are provided for
          general information only. We do not own, operate, endorse or guarantee any third-party
          provider, and a listing is not a recommendation. Always verify details (hours, pricing,
          qualifications, availability) directly with the provider before relying on them.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your content and Pet Stories pages">
        <p>
          The Services let you create content — including a pet's name, photos and story on a public
          Pet Stories page at <span className="font-mono text-warm-800">hispike.in/pet/&lt;name&gt;</span>.
          You retain ownership of the content you post. By posting it, you grant HiSpike a
          non-exclusive, worldwide, royalty-free licence to host, store, display and share that
          content as needed to operate and promote the Services.
        </p>
        <p>You confirm that, for any content you post, you:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>own it or have the rights and permissions to share it;</li>
          <li>are not infringing anyone's copyright, privacy or other rights;</li>
          <li>understand a Pet Stories page is <strong>public</strong> — anyone with the link can view it.</li>
        </ul>
        <p>
          We may remove content or pages that breach these Terms or that we reasonably consider
          unlawful, harmful or inappropriate.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>When using HiSpike, you agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>post unlawful, abusive, hateful, deceptive or obscene content;</li>
          <li>impersonate others or misrepresent your affiliation with any person or business;</li>
          <li>upload viruses or attempt to disrupt, scrape or gain unauthorised access to the Services;</li>
          <li>use the Services for spam or any unsolicited commercial messaging;</li>
          <li>infringe the intellectual-property or privacy rights of others.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Purchases and payments">
        <p>
          Where HiSpike offers pet supplies or other paid items, payments are processed by
          third-party payment providers (such as Razorpay). By making a payment you also agree to the
          payment provider's terms. HiSpike is not responsible for the acts or omissions of any
          third-party seller, service provider or payment processor. Prices, availability and offers
          may change without notice.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-party services and links">
        <p>
          The Services may link to or rely on third-party websites and tools. We are not responsible
          for the content, policies or practices of those third parties, and your use of them is at
          your own risk.
        </p>
      </LegalSection>

      <LegalSection heading="8. Intellectual property">
        <p>
          The HiSpike name, logo, design and content (other than user content) are owned by HiSpike
          and protected by applicable laws. You may not copy, modify or use them without our prior
          written permission.
        </p>
      </LegalSection>

      <LegalSection heading="9. No professional advice; emergencies">
        <p>
          HiSpike does not provide veterinary, medical or professional advice. Information on the
          Services is general in nature and is not a substitute for consultation with a qualified
          veterinarian. <strong>In a pet emergency, contact a licensed veterinarian or emergency
          clinic immediately.</strong>
        </p>
      </LegalSection>

      <LegalSection heading="10. Disclaimers">
        <p>
          The Services are provided "as is" and "as available" without warranties of any kind, whether
          express or implied, including fitness for a particular purpose and accuracy of listings or
          content. We do not guarantee that the Services will be uninterrupted, secure or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="11. Limitation of liability">
        <p>
          To the maximum extent permitted by law, HiSpike will not be liable for any indirect,
          incidental, special or consequential damages, or for any loss arising from your use of (or
          inability to use) the Services, any third-party provider, or any user content.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to these Terms">
        <p>
          We may update these Terms from time to time. We will revise the "Last updated" date above,
          and significant changes may be highlighted on the site. Your continued use of the Services
          after changes take effect means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="13. Governing law">
        <p>
          These Terms are governed by the laws of India. Subject to applicable law, the courts at
          Bengaluru, Karnataka will have exclusive jurisdiction over any dispute arising from these
          Terms or the Services.
        </p>
      </LegalSection>

      <LegalSection heading="14. Contact us">
        <p>
          Questions about these Terms? Email{' '}
          <a href="mailto:support@hispike.in" className="text-primary-600 hover:underline">support@hispike.in</a>.
          See also our{' '}
          <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
