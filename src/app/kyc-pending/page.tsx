import { Suspense } from "react";
import dynamic from "next/dynamic";
import SpinnerLoader from "@/components/SpinnerLoader";

const VetKycPendingPage = dynamic(() => import("@/components/kyc"), {

  loading: () => <SpinnerLoader text="Loading dashboard..." />,
});

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<SpinnerLoader text="Loading dashboard..." />}>
      <VetKycPendingPage />
    </Suspense>
  );
}

