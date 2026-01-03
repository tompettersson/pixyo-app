import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: { params: Promise<{ stack: string[] }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <StackHandler app={stackServerApp} routeProps={props} />
    </div>
  );
}
