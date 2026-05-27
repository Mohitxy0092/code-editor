import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `
You are a professional AI coding assistant.

You help developers with:
- Debugging
- Code explanations
- Refactoring
- Architecture advice
- Best practices
- Performance optimization
- Error fixing

RULES:
- Be concise but accurate
- Use proper code formatting
- Prefer modern best practices
- Return practical solutions
`;

  const fullMessages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "deepseek-coder:1.3b",
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1000,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Ollama API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    console.log("OLLAMA RESPONSE:", data);

    if (!data.response) {
      throw new Error("No response from AI model");
    }

    return cleanAIResponse(data.response);
  } catch (error: any) {
    console.error("AI generation error:", error?.message || error);

    throw new Error(error?.message || "Failed to generate AI response");
  } finally {
    clearTimeout(timeout);
  }
}

function cleanAIResponse(response: string): string {
  if (!response) {
    return "No response generated.";
  }

  return response.trim();
}

function validateHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter(
    (msg): msg is ChatMessage =>
      !!msg &&
      typeof msg === "object" &&
      typeof msg.role === "string" &&
      typeof msg.content === "string" &&
      ["system", "user", "assistant"].includes(msg.role),
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    const { message, history = [] } = body;

    // Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        {
          status: 400,
        },
      );
    }

    // Validate history
    const validHistory = validateHistory(history);

    // Limit conversation memory
    const recentHistory = validHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      {
        role: "user",
        content: message.trim(),
      },
    ];

    // Generate AI response
    const aiResponse = await generateAIResponse(messages);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API Error:", error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response",
        details: error?.message || "Unknown internal server error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      },
    );
  }
}
