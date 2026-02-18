import { redirect } from "next/navigation";

export default function OnboardingCompletePage() {
  redirect("/sell?step=3");
}
