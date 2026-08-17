import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversationId = decodeURIComponent(id);
  redirect(`/conversations/telegram/${encodeURIComponent(conversationId)}`);
}
