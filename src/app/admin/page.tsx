import { Suspense } from "react";
import SpinnerLoader from "@/components/SpinnerLoader";
import AdminAnalyticsPage from "@/components/adminanalytics";

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<SpinnerLoader text="Loading dashboard..." />}>
      <AdminAnalyticsPage />
    </Suspense>
  );
}

