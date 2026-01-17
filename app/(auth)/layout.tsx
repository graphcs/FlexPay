import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Link href="/" className="mb-8">
        <span className="text-3xl font-bold text-primary">FlexPay</span>
      </Link>
      {children}
      <p className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} FlexPay. All rights reserved.
      </p>
    </div>
  );
}
