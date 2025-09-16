import { Suspense } from "react";
import SpinnerLoader from "@/components/SpinnerLoader";
import DeleteProfilePage from "@/components/deletepg";

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<SpinnerLoader text="Loading dashboard..." />}>
      <DeleteProfilePage />
    </Suspense>
  );
}

