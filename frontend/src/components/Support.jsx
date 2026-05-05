import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import './Support.css';

export const Support = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const faqTopics = [
    {
      id: 'orders',
      title: 'Orders & Purchases',
      articles: [
        { title: 'How do I place an order?', content: 'You can browse our catalog and add items to your cart...' },
        { title: 'Can I change or cancel my order?', content: 'Orders can be modified within 30 minutes of purchase...' },
        { title: 'What payment methods do you accept?', content: 'We accept all major credit cards and digital payment methods...' },
      ]
    },
    {
      id: 'keys',
      title: 'Product Keys & Redemption',
      articles: [
        { title: 'How do I redeem my product key?', content: 'Navigate to your product library and click "View Keys"...' },
        { title: 'What if my key doesn\'t work?', content: 'Contact our support team immediately with your order number...' },
        { title: 'Can I gift a product key?', content: 'Yes, you can generate a gift link from your product library...' },
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      articles: [
        { title: 'How do I reset my password?', content: 'Click "Forgot Password" on the login page...' },
        { title: 'How do I update my profile information?', content: 'Visit Account Overview and click "Edit Profile"...' },
        { title: 'How do I enable 2FA?', content: 'Go to Login & Security settings and enable Two-Factor Authentication...' },
      ]
    },
    {
      id: 'refunds',
      title: 'Refunds & Returns',
      articles: [
        { title: 'What is your refund policy?', content: 'We offer refunds within 14 days of purchase if the product is unused...' },
        { title: 'How do I request a refund?', content: 'Visit your Order History and click "Request Refund" on the relevant order...' },
      ]
    },
  ];

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => navigate('/orders') },
    { id: 'library', label: 'Product Library', icon: LibraryIcon, action: () => navigate('/product-library') },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => {} },
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Support ticket submitted:', message);
      setMessage('');
      alert('Your support ticket has been submitted. We\'ll respond within 24 hours.');
    }
  };

  return (
    <div className="support-container">
      <div className="support-layout">
        <aside className="support-sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${item.id === 'support' ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''}`}
              onClick={item.action}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="support-main">
          <h1>Support Center</h1>

          <div className="support-hero">
            <input
              type="text"
              placeholder="Search for answers..."
              className="support-search"
            />
          </div>

          <div className="support-faq-layout">
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          {faqTopics.map(topic => (
            <div key={topic.id} className="faq-topic">
              <button
                className="topic-header"
                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
              >
                {topic.title}
                <span className="arrow">{selectedTopic === topic.id ? '▼' : '▶'}</span>
              </button>
              {selectedTopic === topic.id && (
                <div className="topic-content">
                  {topic.articles.map((article, idx) => (
                    <div key={idx} className="faq-item">
                      <h4>{article.title}</h4>
                      <p>{article.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="contact-section">
          <h3>Still need help?</h3>
          <p>Can't find what you're looking for? Submit a support ticket and our team will help you.</p>

          <form onSubmit={handleSubmitTicket} className="support-form">
            <div className="form-group">
              <label>Subject</label>
              <input type="text" placeholder="Brief description of your issue" className="form-input" />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows="6"
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn-submit">
              SUBMIT TICKET
            </button>
          </form>

            <div className="contact-info">
              <h4>Response Time</h4>
              <p>We typically respond to support tickets within 24 hours during business days.</p>
            </div>
          </aside>
        </div>
        </main>
      </div>
    </div>
  );
};
