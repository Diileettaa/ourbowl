import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 md:p-16">
      <div className="max-w-3xl mx-auto prose prose-lg prose-indigo">
        <Link href="/" className="no-underline inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors">
           <ArrowLeft size={20} /> Back to Home
        </Link>

        <h1>Terms and Conditions</h1>
        <p className="text-sm text-gray-400 font-mono">Last updated: November 19, 2025</p>
        
        <p>Welcome to <strong>ourbowl.net</strong> (“we,” “our,” or “us”). By accessing or using our website, you (“user,” “you,” or “your”) agree to comply with and be bound by the following Terms and Conditions (“Terms”). If you do not agree with these Terms, please do not use our website.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing ourbowl.net, you confirm that you are at least 16 years old (or the age of legal majority in your jurisdiction) and that you have read, understood, and agreed to these Terms. If you are using this site on behalf of a company or organization, you represent that you have authority to bind that entity to these Terms.</p>

        <h3>2. Changes to Terms</h3>
        <p>We may update or revise these Terms from time to time without prior notice. The “Last updated” date at the top of this page indicates the latest version. By continuing to use the website after changes are posted, you accept those changes.</p>

        <h3>3. Use of the Website</h3>
        <p>You agree to use ourbowl.net only for lawful purposes and in accordance with these Terms. You must not:</p>
        <ul>
          <li>Violate any applicable laws or regulations.</li>
          <li>Attempt to gain unauthorized access to the website or related systems.</li>
          <li>Interfere with or disrupt the functionality of the website.</li>
          <li>Use the site to distribute spam, malware, or other harmful materials.</li>
          <li>Copy, reproduce, or distribute website content without permission.</li>
          <li>Impersonate another person or misrepresent your affiliation.</li>
        </ul>
        <p>We reserve the right to suspend or terminate access to the site for users who violate these Terms.</p>

        <h3>4. User Accounts</h3>
        <p>If you create an account on ourbowl.net, you are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your login credentials.</li>
          <li>Restricting access to your account.</li>
          <li>All activities that occur under your account.</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts at our discretion, particularly if we detect misuse, fraud, or violation of these Terms.</p>

        <h3>5. Intellectual Property Rights</h3>
        <p>All content, design, logos, graphics, text, code, software, and other materials on ourbowl.net are owned by or licensed to us and are protected by copyright, trademark, and other intellectual property laws.</p>
        <ul>
          <li>You may view or download content for personal, non-commercial use only.</li>
          <li>You may not reproduce, distribute, modify, or publicly display any content without our prior written permission.</li>
        </ul>

        <h3>6. User-Generated Content</h3>
        <p>If you submit, post, or upload content to ourbowl.net, you grant us a non-exclusive, royalty-free, worldwide, perpetual license to use, display, distribute, and modify that content for the purpose of operating and improving the site. You are solely responsible for the content you provide and agree not to submit any material that is unlawful, defamatory, infringing, or otherwise objectionable. We may remove or edit any user content at our discretion.</p>

        <h3>7. Third-Party Links and Services</h3>
        <p>ourbowl.net may contain links to third-party websites or services. We do not control or endorse these third-party sites and are not responsible for their content, accuracy, or privacy practices. Use them at your own risk.</p>

        <h3>8. Disclaimer of Warranties</h3>
        <p>Our website and all content are provided “as is” and “as available.” We make no warranties, express or implied, about the accuracy, reliability, or availability of the website or its content. We do not guarantee that the site will be free from errors, viruses, or interruptions.</p>
        <p>To the fullest extent permitted by law, we disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

        <h3>9. Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, ourbowl.net, its owners, affiliates, and employees shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, the website — including but not limited to:</p>
        <ul>
          <li>Loss of data, revenue, or profits</li>
          <li>Business interruption</li>
          <li>Unauthorized access to data</li>
          <li>Any other damages resulting from the use of the website</li>
        </ul>
        <p>Your sole remedy for dissatisfaction with the website is to stop using it.</p>

        <h3>10. Indemnification</h3>
        <p>You agree to indemnify, defend, and hold harmless ourbowl.net, its affiliates, officers, employees, and agents from and against any claims, damages, losses, or expenses (including legal fees) arising out of your violation of these Terms or misuse of the website.</p>

        <h3>11. Privacy</h3>
        <p>Your use of ourbowl.net is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. Please review it carefully before using the site.</p>

        <h3>12. Termination</h3>
        <p>We reserve the right to suspend or terminate access to our website, without notice or liability, if you breach these Terms or engage in conduct that we believe is harmful or unlawful.</p>

        <h3>13. Governing Law and Jurisdiction</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of [Insert Country or State], without regard to its conflict of law principles. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in [Insert City and Country/State].</p>

        <h3>14. Severability</h3>
        <p>If any provision of these Terms is found to be invalid or unenforceable, that provision will be modified or removed to the minimum extent necessary, and the remaining provisions will remain in full force and effect.</p>
      </div>
    </div>
  )
}