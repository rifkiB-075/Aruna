import { ChatForm } from "@/components/features/ChatForm";
import { ScopeNotice } from "@/components/features/ScopeNotice";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-bold">Tanya asisten</h1>
      <ScopeNotice compact />
      <ChatForm />
    </div>
  );
}
