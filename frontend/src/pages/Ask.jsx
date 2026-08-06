import { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../api";

function QueryConsole({ debug }) {
  const [open, setOpen] = useState(false);
  if (!debug || !debug.cypher) return null;

  return (
    <div>
      <button className="query-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "hide query" : "view query"}
      </button>
      {open && (
        <div className="query-console">
          <span className="qc-label">// cypher</span>
          <pre>{debug.cypher}</pre>
          <span className="qc-label">// params</span>
          <pre>{JSON.stringify(debug.params, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function Ask() {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me anything about the network — who follows who, popular tags, mutual connections, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await api.chat(question, currentUser?.user_id);
      setMessages((m) => [...m, { role: "assistant", text: res.response, debug: res.debug }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Something went wrong reaching the graph. Is the backend running?" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Ask</p>
      <h1 className="page-title" style={{ marginBottom: 18 }}>
        Query the graph in plain English
      </h1>

      <div className="panel">
        <div className="chat-thread">
          {messages.map((m, i) => (
            <div className={"chat-msg " + m.role} key={i}>
              <div className="chat-bubble">{m.text}</div>
              {m.role === "assistant" && <QueryConsole debug={m.debug} />}
            </div>
          ))}
          {busy && (
            <div className="chat-msg assistant">
              <div className="chat-bubble">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            placeholder="e.g. who has the most followers?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-accent" type="submit" disabled={busy || !input.trim()}>
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
