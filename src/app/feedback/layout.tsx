import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request an app",
  description:
    "Request a new TinyKit tool or app. Suggest ideas, features, or improvements.",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
