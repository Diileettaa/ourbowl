import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 md:p-16">
      <div className="max-w-3xl mx-auto prose prose-lg prose-orange">
        <Link href="/" className="no-underline inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors">
           <ArrowLeft size={20} /> Back to Home
        </Link>

        <h1>Accessibility Statement</h1>
        <p className="text-sm text-gray-400 font-mono">Last updated: November 19, 2025</p>
        
        <p>At <strong>ourbowl.net</strong>, we are committed to making our website accessible and usable by everyone, regardless of ability or technology. We strive to follow recognized best practices and accessibility standards to ensure a positive and inclusive experience for all users.</p>

        <h3>Our Commitment</h3>
        <p>We aim to make ourbowl.net compliant with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, which define how to make web content more accessible for people with disabilities, including those using assistive technologies such as screen readers, magnifiers, voice recognition software, or switch devices.</p>

        <h3>Accessibility Features</h3>
        <p>We have implemented (or are working to implement) the following accessibility features:</p>
        <ul>
          <li>Semantic HTML and proper heading structure for better screen-reader navigation.</li>
          <li>Text alternatives (alt text) for meaningful images and non-text content.</li>
          <li>Sufficient color contrast between text and background.</li>
          <li>Keyboard-accessible menus, forms, and interactive elements.</li>
          <li>Responsive design for mobile and tablet compatibility.</li>
          <li>Clear, consistent navigation across pages.</li>
          <li>Descriptive link text and form labels.</li>
          <li>Avoidance of flashing or blinking content that could cause discomfort or seizures.</li>
        </ul>

        <h3>Ongoing Improvements</h3>
        <p>We recognize that accessibility is an ongoing process. Our team continually reviews and updates the site to maintain and improve accessibility compliance as standards evolve and new technologies emerge.</p>
        <p>We regularly test our site using:</p>
        <ul>
          <li>Automated accessibility tools</li>
          <li>Manual checks by our design and development team</li>
          <li>Feedback from real users, including those who use assistive technologies</li>
        </ul>

        <h3>Known Limitations</h3>
        <p>Despite our efforts to make all pages and content fully accessible, some sections may not yet meet all accessibility standards. We are working diligently to resolve these issues as soon as possible.</p>
        <p>If you encounter a specific accessibility barrier on ourbowl.net, please let us know using the contact information below.</p>

        <h3>Feedback and Contact Information</h3>
        <p>We welcome your feedback on the accessibility of ourbowl.net. If you experience difficulty accessing any part of our site, or have suggestions for improvement, please contact us:</p>
        <p>Email: <a href="mailto:contact@ourbowl.net">contact@ourbowl.net</a></p>
        <p>We try to respond to accessibility feedback within 2–5 business days.</p>

        <h3>Third-Party Content</h3>
        <p>Some parts of ourbowl.net may link to or integrate content from third-party websites or applications. While we cannot control the accessibility of content provided by others, we encourage those providers to follow similar accessibility standards.</p>

        <h3>Accessibility Standard and Technologies</h3>
        <p>Our website relies on the following technologies to work with assistive tools and browsers:</p>
        <ul>
          <li>HTML 5</li>
          <li>CSS 3</li>
          <li>JavaScript</li>
          <li>WAI-ARIA attributes where appropriate</li>
        </ul>
        <p>We aim to ensure compatibility with current versions of major browsers (Chrome, Firefox, Safari, Edge).</p>

        <hr className="my-8"/>
        <p className="text-sm text-gray-400">This accessibility statement was last reviewed and updated on November 19, 2025.</p>
      </div>
    </div>
  )
}