import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: { params: Promise<{ stack: string[] }> }) {
  return <StackHandler app={stackServerApp} routeProps={props} />;
}
