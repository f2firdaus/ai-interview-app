import { HfInference } from "@huggingface/inference";
const hf = new HfInference(process.env.HF_API_KEY!);

export async function generateQuestions(resumeText: string) {
  try {
    const prompt = `
Generate EXACTLY 20 interview questions from this resume.

Return ONLY JSON in this format:

{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}

Resume:
${resumeText}
`;

    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 HF attempt ${attempt + 1}/3...`);
        const response = await hf.chatCompletion({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are a professional interviewer.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 400,
        });

        const raw = response.choices[0].message.content || "";

        // ✅ Robust JSON extraction and parsing
        // Strip markdown code fences if present (```json ... ```)
        let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
        
        // Try to extract JSON object from the text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.questions && Array.isArray(parsed.questions)) {
              // Filter out any non-question strings
              parsed.questions = parsed.questions
                .map((q: any) => typeof q === "string" ? q.trim() : String(q).trim())
                .filter((q: string) => q.length > 5);
              return parsed;
            }
          } catch {}
        }

        // Fallback: extract lines that look like actual questions
        const lines = cleaned
          .split("\n")
          .map((l: string) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•*]\s*/, "").trim())
          .filter((l: string) => {
            // Must be a meaningful sentence (>10 chars), not JSON syntax
            if (l.length < 10) return false;
            if (/^[\{\}\[\],:"]+$/.test(l)) return false;
            if (l.startsWith('"questions"')) return false;
            return true;
          });

        return { questions: lines.length > 0 ? lines : ["AI failed to generate proper questions — try again"] };
      } catch (retryErr: any) {
        lastError = retryErr;
        console.error(`⚠ HF attempt ${attempt + 1} failed:`, retryErr?.message || retryErr);
        if (attempt < 2) {
          console.log("⏳ Waiting 5s before retry...");
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }

    // All retries failed
    console.error("❌ HF ERROR after 3 attempts:", lastError?.message || lastError);
    return {
      questions: ["AI generation failed — try again"],
    };

  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return {
      questions: ["AI generation failed — try again"],
    };
  }
}
export async function evaluateAnswer(
  question: string,
  answer: string
) {
  try {
    const prompt = `
You are a professional interviewer.

Evaluate this candidate answer.

QUESTION:
${question}

ANSWER:
${answer}

Return ONLY JSON in this format:

{
  "score": number_from_1_to_10,
  "strength": "short feedback",
  "improvement": "what to improve",
  "betterAnswer": "example of a strong answer"
}
`;

    const response = await hf.chatCompletion({
      model:"mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: "You are a strict interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
    });

    const raw = response.choices[0].message.content || "";

    // console.log("🧠 Evaluation RAW:", raw);

    // Try robust JSON extraction
    try {
      // Clean up markdown fences
      let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
      
      // Try to find a JSON object in the string
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      
      // Fallback direct parse if regex misses
      return JSON.parse(cleaned);
    } catch {
      return {
        score: 5,
        strength: "Could not parse AI output",
        improvement: "Try answering more clearly",
        betterAnswer: raw,
      };
    }

  } catch (err) {
    console.error("Evaluation error:", err);

    return {
      score: 0,
      strength: "Evaluation failed",
      improvement: "Try again",
      betterAnswer: "",
    };
  }
}
