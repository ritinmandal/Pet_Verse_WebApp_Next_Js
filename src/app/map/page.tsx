import { Suspense } from "react";
import SpinnerLoader from "@/components/SpinnerLoader";
import LocationsPage from "@/components/maps";

export const dynamic = "force-dynamic"; 

export default function MapPage() {
  return (
    <Suspense fallback={<SpinnerLoader text="Loading map..." />}>
      <LocationsPage />
    </Suspense>
  );
}

