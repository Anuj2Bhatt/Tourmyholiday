import React, { useState } from 'react';
import OurTeam from './OurTeam';
import './Contact.css';
import { FaUserShield, FaQuestionCircle, FaUsers, FaEnvelope } from 'react-icons/fa';

const privacyContent = `
  <p>Your privacy is important to us. We are committed to safeguarding your personal information and ensuring transparency about how we use it. We do not share your data with third parties except as required by law or to provide our services. For more details, please contact us.</p>
  <ul class="privacy-rules">
    <li>We never sell your personal information to third parties.</li>
    <li>Your data is used only to provide and improve our services.</li>
    <li>All payment transactions are encrypted and secure.</li>
    <li>We comply with all applicable data protection laws.</li>
    <li>You can request deletion of your data at any time.</li>
    <li>Cookies are used only for site functionality and analytics.</li>
    <li>We do not store your payment details on our servers.</li>
    <li>Access to your data is restricted to authorized personnel only.</li>
    <li>We may update our privacy policy from time to time; changes will be posted here.</li>
  </ul>
`;

const faqList = [
  {
    question: 'How do I book a holiday package?',
    answer: 'Browse our packages, select your preferred one, and fill out the enquiry form. Our team will contact you to confirm your booking.'
  },
  {
    question: 'Is my payment secure?',
    answer: 'Yes, we use secure payment gateways and do not store your payment details.'
  },
  {
    question: 'Can I customize my itinerary?',
    answer: 'Absolutely! Contact us with your preferences and we will tailor a package for you.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can use the enquiry form below or email us at info@tourmyholiday.in.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy varies by package. Please refer to the package details or contact us for more information.'
  },
  {
    question: 'Do you offer group discounts?',
    answer: 'Yes, we offer special rates for group bookings. Please contact us with your group size and requirements.'
  },
  {
    question: 'Can I get a refund if I cancel my booking?',
    answer: 'Refunds are processed as per our cancellation policy. Please check the terms or contact support.'
  },
  {
    question: 'Are flights included in the packages?',
    answer: 'Some packages include flights, while others do not. Please check the package details.'
  },
  {
    question: 'Do you provide travel insurance?',
    answer: 'Travel insurance is not included by default but can be arranged on request.'
  },
  {
    question: 'How do I make a payment?',
    answer: 'You can pay online through our secure payment gateway or via bank transfer.'
  },
  {
    question: 'Can I book for someone else?',
    answer: 'Yes, you can book a package for someone else. Please provide their details in the enquiry form.'
  },
  {
    question: 'What documents are required for booking?',
    answer: 'Generally, a valid ID proof is required. For international travel, a passport and visa may be needed.'
  },
  {
    question: 'How do I know my booking is confirmed?',
    answer: 'You will receive a confirmation email and a call from our team once your booking is processed.'
  },
  {
    question: 'Can I change my travel dates after booking?',
    answer: 'Date changes are subject to availability and may incur additional charges. Please contact us as soon as possible.'
  },
  {
    question: 'Do you offer packages for solo travelers?',
    answer: 'Yes, we have special packages and pricing for solo travelers. Please check our website or contact us for details.'
  }
];

const Contact = () => {
  // Enquiry form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10,}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Invalid phone';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setStatus('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStatus('');
      return;
    }
    // Here you would send to backend
    setStatus('Thank you for contacting us! We will get back to you soon.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setErrors({});
  };

  return (
    <div className="contact-page">
      {/* Hero Section with Background Image and Overlay Form */}
      <section className="hero-section-contact">
        <div className="hero-overlay-contact" />
        <div className="hero-inner-contact">
          <div className="hero-content-contact">
            <h1>Contact Us</h1>
            <p className="hero-desc">We'd love to hear from you! Whether you have a question, want to book a holiday, or need support, our team is here to help. Fill out the form and we'll get back to you as soon as possible.</p>
          </div>
          <div className="hero-form-wrapper-contact">
            <form className="contact-hero-form" onSubmit={handleSubmit} autoComplete="off">
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder='Name' />
              {errors.name && <span className="error-msg">{errors.name}</span>}
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder='Email' />
              {errors.email && <span className="error-msg">{errors.email}</span>}
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder='Phone Number' />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
              <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder='Message' />
              {errors.message && <span className="error-msg">{errors.message}</span>}
              <button type="submit" className="submit-btn">Send Message</button>
              {status && <div className="form-status">{status}</div>}
            </form>
          </div>
        </div>
      </section>

      {/* Privacy Policy & FAQ Row */}
      <div className="info-row">
        <section className="info-section privacy-section info-col">
          <div className="section-header">
            <FaUserShield className="section-icon" />
            <h1>Privacy Policy</h1>
          </div>
          <div className="section-content" dangerouslySetInnerHTML={{ __html: privacyContent }} />
        </section>

        <section className="info-section faq-section info-col">
          <div className="section-header">
            <FaQuestionCircle className="section-icon" />
            <h1>Frequently Asked Questions</h1>
          </div>
          <div className="faq-list">
            {faqList.map((faq, idx) => (
              <div key={idx} className={`faq-item${openFaq === idx ? ' open' : ''}`}> 
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  {faq.question}
                  <span className="faq-toggle">{openFaq === idx ? '-' : '+'}</span>
                </button>
                <div className="faq-answer" style={{ display: openFaq === idx ? 'block' : 'none' }}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Our Team Section */}
      <section className="info-section team-section">
        <div className="section-header">
          <FaUsers className="section-icon" />
          <h1>Meet Our Team</h1>
        </div>
        <OurTeam />
      </section>
    </div>
  );
};

export default Contact; 