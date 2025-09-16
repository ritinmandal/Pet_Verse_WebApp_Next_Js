import { Suspense } from "react";
import SpinnerLoader from "@/components/SpinnerLoader";
import CartPage from "@/components/carts";

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<SpinnerLoader text="Loading dashboard..." />}>
      <CartPage/>
    </Suspense>
  );
}

