import { LoginForm } from "@/features/auth/auth-form";
export const metadata = { title: "Sign in" };
export default function LoginPage() {
  return (
    <>
      <p className="eyebrow mb-3">Your next chapter</p>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
      <p className="mt-3 mb-8 text-sm text-muted-foreground">
        Good to see you. Let’s find something worth watching.
      </p>
      <LoginForm />
    </>
  );
}
