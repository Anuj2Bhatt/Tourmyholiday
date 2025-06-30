import React, { useState } from 'react';
import OurTeam from './OurTeam';
import './Contact.css';
import { FaUserShield, FaQuestionCircle, FaUsers, FaEnvelope } from 'react-icons/fa';

const privacyContent = `
  <h2>Privacy Policy</h2>
  <p>Your privacy is important to us. We are committed to safeguarding your personal information and ensuring transparency about how we use it. We do not share your data with third parties except as required by law or to provide our services. For more details, please contact us.</p>
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
  }
];

const Info = () => {
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
    <div className="page-container info-page">
      {/* Privacy Policy Section */}
      <section className="info-section privacy-section">
        <div className="section-header">
          <FaUserShield className="section-icon" />
          <h1>Privacy Policy</h1>
        </div>
        <div className="section-content" dangerouslySetInnerHTML={{ __html: privacyContent }} />
      </section>

      {/* FAQ Section */}
      <section className="info-section faq-section">
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

      {/* Our Team Section */}
      <section className="info-section team-section">
        <div className="section-header">
          <FaUsers className="section-icon" />
          <h1>Meet Our Team</h1>
        </div>
        <OurTeam />
      </section>

      {/* Enquiry Form Section */}
      <section className="info-section enquiry-section">
        <div className="section-header">
          <FaEnvelope className="section-icon" />
          <h1>Enquiry Form</h1>
        </div>
        <div className="enquiry-form-wrapper">
          <form className="contact-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={5} />
              {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
            {status && <div className="form-status">{status}</div>}
          </form>
        </div>
      </section>
    </div>
  );
};

export default Info; 