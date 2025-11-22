import { useState, useEffect, useRef } from "react";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
import { FaPaperPlane, FaUserCircle, FaRobot } from "react-icons/fa";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loadingAI]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.warning("Please enter a message before sending!");
      return;
    }

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
      toast.error("AI service is currently unavailable!");
      setChat([
        ...newChat,
        {
          sender: "ai",
          text: "⚠️ AI service not available. Please try later.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[85vh]">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
        <FaRobot /> Smart Inventory Assistant
      </h1>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-100 p-4 rounded-lg overflow-y-auto shadow-inner border">
        {chat.map((c, i) => (
          <div key={i} className={`flex mb-4 gap-2 ${c.sender === "user" ? "justify-end" : "justify-start"}`}>
            {/* Avatar */}
            {c.sender === "ai" && <FaRobot className="text-2xl text-gray-500" />}
            {c.sender === "user" && <FaUserCircle className="text-2xl text-blue-600" />}

            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md break-words
              ${
                c.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border"
              }`}
            >
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
              <p className="text-[10px] mt-1 opacity-70 text-right">{c.time}</p>
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {loadingAI && (
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <FaRobot className="text-xl" />
            <div className="bg-white text-gray-600 px-4 py-2 rounded-lg shadow border animate-pulse">
              AI is typing...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-grow border p-3 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-sm text-sm md:text-base"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about stock levels, generate reports, or get inventory insights..."
        />
        <button
          disabled={loadingAI}
          className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow text-sm md:text-base transition ${
            loadingAI && "opacity-60 cursor-not-allowed"
          }`}
          onClick={handleSend}
        >
          <FaPaperPlane /> Send
        </button>
      </div>
    </div>
  );
}
