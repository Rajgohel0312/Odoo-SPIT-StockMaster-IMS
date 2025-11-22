import { useState, useEffect, useRef } from "react";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loadingAI]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const newChat = [
      ...chat,
      { sender: "user", text: message, time: new Date().toLocaleTimeString() },
    ];
    setChat(newChat);
    setMessage("");
    setLoadingAI(true);

    try {
      const res = await api.post("/ai/chat", { message });
      const aiReply = res.data.reply;

      setChat([
        ...newChat,
        { sender: "ai", text: aiReply, time: new Date().toLocaleTimeString() },
      ]);
    } catch (err) {
      setChat([
        ...newChat,
        {
          sender: "ai",
          text: "⚠️ AI service not available.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[85vh]">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-left">
        🤖 Smart Inventory Assistant
      </h1>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-100 p-3 md:p-4 rounded-lg overflow-y-auto shadow-inner">
        {chat.map((c, i) => (
          <div
            key={i}
            className={`flex mb-3 ${
              c.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] px-4 py-2 rounded-lg shadow-md break-words
              ${
                c.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
              }`}
            >
              <div className="prose prose-sm max-w-full overflow-x-auto ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <table
                        className="table-auto border-collapse border border-gray-400 w-full text-sm mb-3"
                        {...props}
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border px-3 py-2 bg-gray-100 font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border px-3 py-2" {...props} />
                    ),
                  }}
                >
                  {c.text}
                </ReactMarkdown>
              </div>
              <p className="text-[10px] mt-1 opacity-70 text-right">{c.time}</p>
            </div>
          </div>
        ))}

        {loadingAI && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg shadow">
              ⏳ AI is thinking...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-grow border p-2 md:p-3 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-sm text-sm md:text-base"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask: 'Stock of Steel Rods', 'Generate delivery report', 'Show low-stock items'..."
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow text-sm md:text-base transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
