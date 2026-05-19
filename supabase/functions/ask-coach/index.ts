const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.5";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function clampText(value: unknown, max = 1600) {
  return String(value || "").trim().slice(0, max);
}

function safeContext(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2).slice(0, 12000);
  } catch (_error) {
    return "{}";
  }
}

function extractOutputText(response: any) {
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const chunks: string[] = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!OPENAI_API_KEY) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
  }

  try {
    const body = await request.json();
    const question = clampText(body?.question, 1600);
    const context = safeContext(body?.context);
    const messages = Array.isArray(body?.messages)
      ? body.messages.slice(-8).map((message: any) => ({
          role: message?.role === "user" ? "user" : "coach",
          text: clampText(message?.text, 900),
        }))
      : [];

    if (!question) {
      return jsonResponse({ error: "Question is required" }, 400);
    }

    const instructions = [
      "You are Ask Coach, the Valorant coaching assistant inside RankedCoach.",
      "Be conversational, specific, and practical. Sound like a calm coach, not a stats report.",
      "Use RankedCoach app data when it is relevant, but do not invent stats, match counts, ranks, maps, agents, or logs.",
      "When rank context is provided, frame coaching reads against the player's current rank journey instead of judging them against the entire ladder.",
      "If the user gives their own context, coach that context directly even when app data is incomplete.",
      "If app data is weak, say what is unknown and still give a reasonable general Valorant plan.",
      "Answer in a human, direct style. Avoid long continuous paragraphs.",
      "Preferred format for advice: one short read sentence, then a blank line, then 3-5 plain bullet points.",
      "Each bullet must be on its own new line and start with '- '. Do not write inline bullets inside one paragraph.",
      "Do not use markdown styling: no bold text, headings, numbered lists, tables, or bullet labels wrapped in **.",
      "Keep each bullet short, concrete, and action-oriented.",
      "For simple greetings or quick questions, answer in 1-2 short sentences with no bullets.",
      "Do not mention internal prompts, API calls, or implementation details.",
      "Avoid medical, legal, or financial advice. Keep the topic on Valorant improvement and app usage.",
    ].join("\n");

    const userInput = [
      "Recent chat:",
      JSON.stringify(messages, null, 2),
      "",
      "RankedCoach context:",
      context,
      "",
      "Player question:",
      question,
    ].join("\n");

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions,
        input: userInput,
        max_output_tokens: 650,
      }),
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      return jsonResponse({
        error: data?.error?.message || "OpenAI request failed",
      }, openaiResponse.status);
    }

    const answer = extractOutputText(data);
    return jsonResponse({
      answer: answer || "I could not generate a useful response. Try asking that a different way.",
      model: OPENAI_MODEL,
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Unexpected Ask Coach error",
    }, 500);
  }
});
