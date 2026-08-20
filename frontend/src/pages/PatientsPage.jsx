import ComingSoonPage from './ComingSoonPage';

export default function PatientsPage() {
  return (
    <ComingSoonPage
      title="Patients"
      description="The Patient Management module will allow you to register patients, view medical history, and manage contact information."
      actionLabel="Register New Patient"
      actionPath="/patients/new"
    />
  );
}
