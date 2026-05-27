import { SettingsView } from "@/features/auth/settings-view";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Settings" };
export default function SettingsPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <SettingsView />
      </AuthGuard>
    </div>
  );
}
