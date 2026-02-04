import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/stack";
import { hasToolAccess, type UserServerMetadata } from "@/lib/permissions";

export default async function ProductScenesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const serverMetadata = user.serverMetadata as UserServerMetadata | null;
  if (!hasToolAccess(serverMetadata, "product-scenes")) {
    redirect("/");
  }

  return <>{children}</>;
}
