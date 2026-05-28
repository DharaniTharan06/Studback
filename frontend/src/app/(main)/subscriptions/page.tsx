import { SubscriptionsView } from "@/features/subscriptions/subscriptions-view";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Subscriptions" };
export default function SubscriptionsPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <SubscriptionsView />
      </AuthGuard>
    </div>
  );
}
