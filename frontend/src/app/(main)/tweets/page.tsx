import { Community } from "@/features/tweets/tweets";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Community" };
export default function TweetsPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <Community />
      </AuthGuard>
    </div>
  );
}
