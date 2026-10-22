const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "JARVIS" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) return res.status(400).json({ error: "Scrivi un messaggio prima di inviare." });
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "Il server non è ancora configurato con la chiave API." });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: MODEL,
      instructions: "Ti chiami JARVIS. Rispondi in italiano, con tono cortese, chiaro e conciso. Rivolgiti all'utente come 'Signore' quando naturale. Non affermare di poter controllare dispositivi o account se non hai davvero gli strumenti per farlo.",
      input: message
    });
    res.json({ reply: response.output_text || "Mi dispiace, non ho una risposta disponibile." });
  } catch (error) {
    console.error("Errore /api/chat:", error?.message || error);
    res.status(500).json({ error: "Si è verificato un errore del server. Riprova tra poco." });
  }
});

// Serve index.html from the repository root, preserving the current file location.
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => console.log(`JARVIS server in ascolto sulla porta ${PORT}`));
