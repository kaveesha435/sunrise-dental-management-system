import { useState, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import './HelpPage.css';

const helpTopics = [
  {
    id: 'getting-started',
    category: 'Getting Started',
    title: 'How to navigate the Sunrise Dental dashboard',
    content: `
      1. Log in using your credentials.
      2. The main dashboard provides a quick overview of today's appointments and revenue.
      3. Use the left sidebar to navigate between Patients, Appointments, Dentists, Treatments, Billing, and Reports.
      4. Click on any widget to drill down into specific details.
    `
  },
  {
    id: 'patient-management',
    category: 'Patient Management',
    title: 'Adding a new patient',
    content: `
      1. Navigate to the "Patients" page from the sidebar.
      2. Click the "Add Patient" button in the top right corner.
      3. Fill in the required details including Name, Contact Info, and Medical History.
      4. Click "Save" to register the patient in the system.
    `
  },
  {
    id: 'appointments-booking',
    category: 'Appointments',
    title: 'Booking a new appointment',
    content: `
      1. Navigate to the "Appointments" page.
      2. Click "New Appointment".
      3. Select the Patient, Dentist, and Treatment from the dropdowns.
      4. Choose an available Date and Time.
      5. Add any relevant notes and click "Schedule".
    `
  },
  {
    id: 'appointments-cancelling',
    category: 'Appointments',
    title: 'Cancelling or rescheduling an appointment',
    content: `
      1. Locate the appointment in the "Appointments" list.
      2. Click on the "View" or "Edit" button next to it.
      3. To cancel, update the status to "Cancelled".
      4. To reschedule, change the Date and Time fields and save.
    `
  },
  {
    id: 'billing-invoice',
    category: 'Billing',
    title: 'Generating an invoice',
    content: `
      1. When an appointment is completed, navigate to the "Billing" section.
      2. Find the completed appointment in the pending bills list.
      3. Click "Generate Bill".
      4. Review the Consultation Fee and Treatment Cost.
      5. Add any discounts if applicable and process the payment.
    `
  },
  {
    id: 'reports-export',
    category: 'Reports',
    title: 'Exporting reports to CSV',
    content: `
      1. Navigate to the "Reports" page.
      2. Use the filters at the top to select the desired date range, dentist, or treatment.
      3. Click "Apply Filters" to view the data on screen.
      4. Click the "Export CSV" button to download the data for Excel or other spreadsheet software.
    `
  },
  {
    id: 'account-security',
    category: 'Account & Security',
    title: 'Updating your password',
    content: `
      1. Click on your profile icon in the top right corner.
      2. Select "Settings" or "Profile".
      3. Navigate to the "Security" tab.
      4. Enter your current password and your new password.
      5. Click "Update Password".
    `
  }
];

const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={onClick}>
        <span className="accordion-title">{title}</span>
        <span className="accordion-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      <div className="accordion-content">
        <div className="accordion-content-inner">
          {content.split('\n').map((line, i) => (
            <p key={i}>{line.trim()}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return helpTopics;
    
    const query = searchQuery.toLowerCase();
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(query) || 
      topic.content.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by category
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {});

  return (
    <div className="help-page">
      <PageHeader 
        title="Help & Support" 
        description="Documentation, FAQs, and step-by-step guides."
      />

      <div className="help-search-container">
        <Input
          type="text"
          placeholder="Search for help topics, e.g. 'Billing' or 'Cancel appointment'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="help-search-input"
          icon="search"
        />
      </div>

      <div className="help-content">
        {Object.keys(groupedTopics).length === 0 ? (
          <div className="no-results">
            <p>No help topics found matching "{searchQuery}"</p>
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>Clear Search</button>
          </div>
        ) : (
          Object.entries(groupedTopics).map(([category, topics]) => (
            <div key={category} className="help-category-section">
              <h2 className="help-category-title">{category}</h2>
              <div className="accordion-list">
                {topics.map(topic => (
                  <AccordionItem
                    key={topic.id}
                    title={topic.title}
                    content={topic.content}
                    isOpen={!!openItems[topic.id]}
                    onClick={() => toggleItem(topic.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
