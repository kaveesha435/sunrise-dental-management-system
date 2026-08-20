import ComingSoonPage from './ComingSoonPage';

export default function AppointmentsPage() {
  return (
    <ComingSoonPage
      title="Appointments"
      description="The Appointments module will display the clinic schedule, allow booking, cancellation, and status tracking."
      actionLabel="Book Appointment"
      actionPath="/appointments/new"
    />
  );
}
