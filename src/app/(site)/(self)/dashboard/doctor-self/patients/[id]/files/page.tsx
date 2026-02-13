import PatientFilesViewer from "@/components/patient/PatientFilesViewer";

export default function DoctorPatientFilesPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <PatientFilesViewer patientId={params.id} apiBase="doctor" />
    </div>
  );
}
