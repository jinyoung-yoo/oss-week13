// The only file that talks to the LLM provider.
// The provider, the model and the key come from .env:
//   process.env.LLM_BASE_URL, process.env.LLM_MODEL, process.env.LLM_API_KEY

// TODO P4: make a constant SYSTEM here: the rules for every answer (tone, length, format).
//          Then send it as the first message, before the user's message, in ask().
const SYSTEM = `당신은 웹 페이지에 짧은 답을 보여 주는 도우미입니다.
항상 존댓말(해요체)로 답하세요.
답의 길이는 한 문단, 세 문장 이내로 쓰세요.
답의 형식은 목록, 제목, 굵은 글씨, 코드 블록 같은 마크다운 기호를 쓰지 마세요.`;

// ask("a question")  ->  the model's answer, as a string
async function send(messages) {
  // TODO P3: write this function (see problems/P3_ask.md). Delete the throw line below.
  const res = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ask -> the model's answer, as a string
export async function ask(question) {
  return send([
    { role: "system", content: SYSTEM },
    { role: "user", content: question },
  ]);
}

// chat([{ role: "user", content: "..." }, { role: "assistant", content: "..." }, ...])
//   ->  the model's next answer, as a string
export async function chat(history) {
  // TODO P5: write this function (see problems/P5_chat.md). Delete the throw line below.
  return send([
    { role: "system", content: SYSTEM },
    ...history,
  ]);
}

// analyze("a review")  ->  an object, not a sentence:
//   { sentiment: "positive" | "negative" | "neutral", score: 1..5, summary: "one short sentence" }
export async function analyze(text) {
  // TODO P6: write this function (see problems/P6_json.md). Delete the throw line below.
  throw new Error("analyze() is not written yet");
}
