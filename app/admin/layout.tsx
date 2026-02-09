import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/stack";
import { isAdmin, type UserServerMetadata } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const serverMetadata = user.serverMetadata as UserServerMetadata | null;
  if (!isAdmin(serverMetadata)) {
    redirect("/");
  }

  return <>{children}</>;
}
