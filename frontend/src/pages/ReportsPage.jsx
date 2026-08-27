import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { reportService } from '../services/reportService';
import { dentistService } from '../services/dentistService';
import { treatmentService } from '../services/treatmentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import './ReportsPage.css';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    dentistId: '',
    treatmentId: '',
    status: ''
  });

  useEffect(() => {
    loadFilterOptions();
    fetchReport();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [dentistsRes, treatmentsRes] = await Promise.all([
        dentistService.getAllDentists(1, 100, ''),
        treatmentService.getAllTreatments(1, 100, '')
      ]);
      setDentists(dentistsRes.content || []);
      setTreatments(treatmentsRes.content || []);
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getSummary(filters);
      setReportData(data.data);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    fetchReport();
  };

  const handleExportCsv = () => {
    window.location.href = reportService.getExportUrl(filters);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const treatmentColumns = [
    { key: 'treatmentName', label: 'Treatment' },
    { key: 'appointmentCount', label: 'Appointments' },
    { key: 'revenue', label: 'Revenue (LKR)', render: (item) => formatCurrency(item.revenue) },
    { key: 'percentage', label: 'Percentage (%)', render: (item) => `${item.percentage.toFixed(2)}%` }
  ];

  if (error) return <ErrorState message={error} onRetry={fetchReport} />;

  return (
    <div className="reports-page">
      <div className="reports-header-section no-print">
        <PageHeader 
          title="Reports & Analytics" 
          description="View clinic performance and generate reports"
        />
        <div className="reports-actions">
          <Button variant="secondary" onClick={handlePrint} icon="print">Print Report</Button>
          <Button variant="primary" onClick={handleExportCsv} icon="download">Export CSV</Button>
        </div>
      </div>

      <div className="reports-filters no-print">
        <Input 
          type="date" 
          label="Start Date" 
          name="startDate" 
          value={filters.startDate} 
          onChange={handleFilterChange} 
        />
        <Input 
          type="date" 
          label="End Date" 
          name="endDate" 
          value={filters.endDate} 
          onChange={handleFilterChange} 
        />
        <Select 
          label="Dentist" 
          name="dentistId" 
          value={filters.dentistId} 
          onChange={handleFilterChange}
          options={[
            { value: '', label: 'All Dentists' },
            ...dentists.map(d => ({ value: d.id, label: d.name }))
          ]}
        />
        <Select 
          label="Treatment" 
          name="treatmentId" 
          value={filters.treatmentId} 
          onChange={handleFilterChange}
          options={[
            { value: '', label: 'All Treatments' },
            ...treatments.map(t => ({ value: t.id, label: t.name }))
          ]}
        />
        <Select 
          label="Status" 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ]}
        />
        <div className="filter-actions">
          <Button variant="primary" onClick={handleGenerate}>Apply Filters</Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Generating report..." />
      ) : !reportData ? (
        <EmptyState title="No Data" message="Adjust filters to generate a report." />
      ) : (
        <div className="report-content">
          <div className="print-header">
            <h2>Sunrise Dental Report</h2>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div className="stats-grid">
            <StatCard 
              title="Total Appointments" 
              value={reportData.totalAppointments} 
              icon="calendar" 
            />
            <StatCard 
              title="Completed" 
              value={reportData.completedAppointments} 
              icon="check-circle" 
              trend="success"
            />
            <StatCard 
              title="Cancelled" 
              value={reportData.cancelledAppointments} 
              icon="x-circle" 
              trend="danger"
            />
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(reportData.totalRevenue)} 
              icon="dollar-sign" 
              trend="success"
            />
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Weekly Appointment Volume</h3>
              {reportData.weeklyAppointmentVolume?.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.weeklyAppointmentVolume}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No Data" message="No appointment data available for this period." />
              )}
            </div>

            <div className="chart-card">
              <h3>Revenue Trend (LKR)</h3>
              {reportData.revenueTrend?.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis tickFormatter={(val) => `Rs ${val}`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No Data" message="No revenue data available for this period." />
              )}
            </div>
          </div>

          <div className="table-card">
            <h3>Treatment Summary</h3>
            {reportData.treatmentSummary?.length > 0 ? (
              <DataTable 
                columns={treatmentColumns} 
                data={reportData.treatmentSummary} 
                keyExtractor={(item) => item.treatmentName}
              />
            ) : (
              <EmptyState title="No Data" message="No treatment data available for this period." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
