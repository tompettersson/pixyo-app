import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

export default async function Handler(props: { params: Promise<{ stack: string[] }> }) {
  const params = await props.params;
  const path = params.stack?.join("/") || "";

  // Block sign-up routes - redirect to sign-in
  if (path === "sign-up" || path.startsWith("sign-up/")) {
    redirect("/handler/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <StackHandler app={stackServerApp} routeProps={props} fullPage={true} />
    </div>
  );
}
