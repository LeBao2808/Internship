import { useState, useRef, useEffect } from "react";
import { BsRobot, BsSend } from "react-icons/bs";
export default function BlogChatbot() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { type: string; content: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleAsk = async () => {
    console.log("Question:", chatHistory);
    if (!question.trim()) return;
    setLoading(true);

    const newMessage = { type: "user", content: question };
    setChatHistory((prev) => [...prev, newMessage]);
    setQuestion("");

    const context = chatHistory
      .map(
        (msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newMessage.content, context }),
      });
      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        { type: "assistant", content: data.answer },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { type: "assistant", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };
  console.log("Chat History:", chatHistory);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-18 w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BsRobot className="w-6 h-6 animate-pulse" />
                <h2 className="font-bold text-lg">DevBlog Assistant</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="flex flex-col h-96">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <BsRobot className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <p>Good day! Is there anything I can help with ?</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in-50 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {msg.type === "assistant" && (
                        <div className="flex items-center gap-2 mb-1">
                          <BsRobot className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-500">Assistant</span>
                        </div>
                      )}
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: msg.content.replace(
                            /\[([^\]]+)\]\(([^)]+)\)/g,
                            '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank">$1</a>'
                          ),
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start animate-in fade-in-50 duration-300">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <BsRobot className="w-4 h-4 text-blue-500 animate-spin" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-20"
                  rows={1}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Please enter your question..."
                  disabled={loading}
                />
                <button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                >
                  <BsSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 flex items-center justify-center transition-all duration-300 border-4 border-white dark:border-gray-800 cursor-pointer animate-pulse hover:animate-none  overflow-hidden group absolute bottom-1.5 right-2  translate-x-1/2 mr-[20px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <BsRobot className="w-8 h-8 relative z-10 group-hover:animate-bounce" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        )}
      </button>
    </div>
  );
}
