// The only file that talks to the LLM provider.
// The provider, the model and the key come from .env:
//   process.env.LLM_BASE_URL, process.env.LLM_MODEL, process.env.LLM_API_KEY

// TODO P4: make a constant SYSTEM here: the rules for every answer (tone, length, format).
//          Then send it as the first message, before the user's message, in ask().
const SYSTEM = `당신은 웹 페이지에 짧은 답을 보여 주는 도우미입니다.
항상 존댓말(해요체)로 답하세요.
답의 길이는 한 문단, 세 문장 이내로 쓰세요.
답의 형식은 목록, 제목, 굵은 글씨, 코드 블록 같은 마크다운 기호를 쓰지 마세요.`;

const SYSTEM_JSON = `당신은 상품 후기의 감정을 분석합니다.
JSON 객체 하나로만 답하고, 그 밖의 글은 쓰지 마세요.
키는 정확히 sentiment, score, summary 세 개만 쓰세요.
sentiment는 "positive", "negative", "neutral" 중 하나의 문자열입니다.
score는 1부터 5까지의 정수(숫자)입니다. 5가 가장 긍정적이고 1이 가장 부정적입니다.
summary는 후기를 요약한 한국어 한 문장입니다.`;

async function send(messages, { json = false } = {}) {
  const body = { model: process.env.LLM_MODEL, messages };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
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
  const content = await send(
    [
      { role: "system", content: SYSTEM_JSON },
      { role: "user", content: text },
    ],
    { json: true },
  );

  const { sentiment, score, summary } = JSON.parse(content);

  if (
    !["positive", "negative", "neutral"].includes(sentiment) ||
    !(Number.isInteger(score) && score >= 1 && score <= 5) ||
    typeof summary !== "string"
  ) {
    throw new Error("LLM: the answer has the wrong shape");
  }

  return { sentiment, score, summary };
}
