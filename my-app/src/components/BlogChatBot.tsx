import { useState } from "react";
import { BsRobot } from "react-icons/bs";
export default function BlogChatbot() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { type: string; content: string }[]
  >([]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);

    const newMessage = { type: "user", content: question };
    setChatHistory((prev) => [...prev, newMessage]);

    const context = chatHistory
      .map(
        (msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context }),
    });
    const data = await res.json();

    setChatHistory((prev) => [
      ...prev,
      { type: "assistant", content: data.answer },
    ]);
    setQuestion("");
    setLoading(false);
  };
  console.log("Chat History:", chatHistory);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-16 w-96 mr-12 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white p-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">DevBlog Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4">
            {chatHistory.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      msg.type === "user"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-4"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 mr-4 border-l-4 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.type === "assistant" && (
                        <span className="text-blue-600 dark:text-blue-300 font-bold">
                          <BsRobot className="inline-block mr-1" />
                        </span>
                      )}
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: msg.content.replace(
                            /\[([^\]]+)\]\(([^)]+)\)/g,
                            '<a href="$2" class="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 underline" target="_blank">$1</a>'
                          ),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <textarea
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-3 mb-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 mt-4"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about our blog..."
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white px-6 py-3 rounded-lg w-full font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-200 disabled:opacity-50"
              onClick={handleAsk}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send Message"}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700  text-amber-50 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center transition-all duration-300 border-4 border-white  cursor-pointer absolute bottom-1.5 right-2  translate-x-1/2 mr-[20px]"
      >
        {/* <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg> */}
        < BsRobot className="w-8 h-8" />
      </button>
    </div>
  );
}
