import { RegisterForm } from "@/features/auth/auth-form";
export const metadata = { title: "Create an account" };
export default function RegisterPage() {
  return (
    <>
      <p className="eyebrow mb-3">There’s room for you here</p>
      <h1 className="text-3xl font-semibold tracking-tight">Make it yours.</h1>
      <p className="mt-3 mb-8 text-sm text-muted-foreground">
        Your videos. Your voice. Your community.
      </p>
      <RegisterForm />
    </>
  );
}
