import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// Using Llama 3.3 70B — much smarter than the old 8B model
const MODEL = "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────────────────────
// HireAI — Realistic Interviewer Prompts
// ─────────────────────────────────────────────────────────────

const INTERVIEWER_SYSTEM_PROMPT = `You are a senior technical interviewer at a product-based company (like Google, Amazon, Flipkart, Razorpay, or a well-funded startup). You are conducting a real 45-minute technical interview round.

YOUR INTERVIEWING STYLE:
- You speak like a real person, not a textbook. Your questions sound natural and conversational.
- You pick specific things from the candidate's resume and dig deep into them.
- You ask ONE clear question at a time — not a paragraph with 5 sub-questions.
- You test whether the candidate actually built what they claim, or just copy-pasted.
- You care about HOW they think, not just WHAT they know.

HOW REAL INTERVIEWERS ACTUALLY ASK QUESTIONS:
- "I see you worked on [X project]. Walk me through the architecture — how does data flow from the frontend to the database?"
- "You used Redis here. What problem were you solving with caching, and how did you handle cache invalidation?"
- "Let's say your API starts getting 10x more traffic tomorrow. What breaks first, and how would you fix it?"
- "Tell me about a bug that took you a long time to find. What made it hard to debug?"
- "If I gave you a new feature to build from scratch — say, a notification system — how would you design it?"

WHAT REAL INTERVIEWERS NEVER ASK:
- "What is React?" or "Define polymorphism" — too basic, sounds like a college exam.
- "What are the advantages of using Node.js?" — too generic, not resume-specific.
- "Explain the SOLID principles" — nobody asks this in a real interview.
- Questions with 4-5 sub-parts crammed together — interviewers ask one thing at a time.`;

const QUESTION_GENERATION_PROMPT = `You are conducting a real technical interview. Read the candidate's resume carefully and generate EXACTLY 5 interview questions.

IMPORTANT RULES FOR REALISTIC QUESTIONS:

1. PICK SPECIFIC THINGS from the resume — project names, tech stack, company experience — and ask about them directly.

2. Questions should sound like a REAL PERSON talking, not a formal document. Use natural language.
   ✅ "I see you built a chat app with Socket.io. How did you handle the case when a user goes offline and comes back — do they see missed messages?"
   ❌ "Describe the architectural considerations and design patterns you employed in your real-time communication application."

3. Mix these question types (one of each):
   - PROJECT DEEP-DIVE: Pick their most interesting project and ask how it actually works under the hood.
   - PROBLEM-SOLVING: Give a realistic scenario related to their tech stack and ask how they'd solve it.
   - DEBUGGING/FAILURE: Ask about a time something went wrong — a bug, a production issue, a wrong technical decision.
   - SYSTEM DESIGN (LITE): Ask them to design or scale something related to what they've already built.
   - TECH FUNDAMENTALS: Ask a practical "why" question about a core technology they use (not "what is X" but "why did you choose X over Y").

4. Keep each question SHORT — 1-2 sentences max. Real interviewers don't write paragraphs.

5. Match the candidate's experience level:
   - Fresher/Junior (0-2 yrs): Ask about projects, basics of their tech stack, simple problem-solving.
   - Mid-level (2-5 yrs): Ask about architecture decisions, debugging complex issues, scaling.
   - Senior (5+ yrs): Ask about system design, tech leadership, trade-offs at scale.

Return ONLY valid JSON:

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
`;

const EVALUATION_SYSTEM_PROMPT = `You are a senior interviewer evaluating a candidate's answer. Be fair, specific, and constructive — like a good interviewer who gives real feedback after a round.

SCORING (1-10):
- 1-3: Poor — Vague, incorrect, or clearly doesn't understand the topic. Would not pass this round.
- 4-5: Below Average — Has some idea but lacks depth. Couldn't answer follow-ups. Borderline reject.
- 6-7: Good — Solid understanding, gave a reasonable answer. Would probably pass this round.
- 8-9: Strong — Clear, detailed, showed real experience. Mentioned trade-offs and edge cases. Would definitely pass.
- 10: Exceptional — Nailed it. The kind of answer that makes an interviewer go "this person really knows their stuff."

FEEDBACK RULES:
- "strength": Be specific about what was good. Don't just say "good answer" — say exactly what impressed you.
- "improvement": Point out exactly what was missing. If they gave a surface-level answer, say what deeper details they should have covered.
- "betterAnswer": Write a concise ideal answer (3-5 sentences) that a strong candidate would give. Include specific technical details, trade-offs, and real-world considerations.

Be honest but encouraging. A score of 5-6 is okay — not everyone needs a 9.

Always respond with ONLY valid JSON.`;

// ─────────────────────────────────────────────────────────────
// Question Generation
// ─────────────────────────────────────────────────────────────

export async function generateQuestions(resumeText: string, category?: string, difficulty?: string) {
  try {
    let categoryHint = "";
    if (category && category !== "general") {
      const categoryMap: Record<string, string> = {
        technical: "\n\nFOCUS: This is a dedicated DSA/coding round. Ask about data structures, algorithms, time complexity, and coding problem-solving. Still reference their resume projects but focus on the technical depth.",
        behavioral: "\n\nFOCUS: This is a behavioral/HR round. Ask about real situations — teamwork conflicts, tight deadlines, disagreements with managers, times they failed and learned. Use the STAR format (Situation, Task, Action, Result). Reference their actual work experience from the resume.",
        "system-design": "\n\nFOCUS: This is a system design round. Ask them to design or scale systems related to their experience. Ask about database choices, caching, message queues, load balancing, and trade-offs. Match complexity to their experience level.",
        hr: "\n\nFOCUS: This is an HR/culture-fit round. Ask about career goals, why they want to switch, what motivates them, how they handle pressure, and what kind of team culture they thrive in. Keep it conversational and warm.",
      };
      categoryHint = categoryMap[category] || "";
    }

    let difficultyHint = "";
    if (difficulty && difficulty !== "medium") {
      const diffMap: Record<string, string> = {
        easy: "\n\nDIFFICULTY: JUNIOR LEVEL — This candidate appears to be early in their career. Ask questions appropriate for someone with 0-2 years of experience. Focus on fundamentals, project walkthroughs, and basic problem-solving. Don't ask about distributed systems or complex architecture.",
        hard: "\n\nDIFFICULTY: SENIOR LEVEL — Treat this as a senior/staff engineer interview. Ask about system design at scale, complex debugging, architectural trade-offs, tech leadership, and mentoring. Challenge them with scenarios involving millions of users.",
      };
      difficultyHint = diffMap[difficulty] || "";
    }

    const userPrompt = `${QUESTION_GENERATION_PROMPT}${categoryHint}${difficultyHint}\n${resumeText}`;

    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 Groq attempt ${attempt + 1}/3...`);

        const response = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        });

        const raw = response.choices[0].message.content || "";
        console.log("🧠 Groq raw response:", raw.substring(0, 300));

        // Parse the JSON response
        let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();

        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.questions && Array.isArray(parsed.questions)) {
              parsed.questions = parsed.questions
                .map((q: any) => typeof q === "string" ? q.trim() : String(q).trim())
                .filter((q: string) => q.length > 5);
              console.log(`✅ Generated ${parsed.questions.length} questions via Groq`);
              return parsed;
            }
          } catch { }
        }

        // Fallback: extract lines that look like actual questions
        const lines = cleaned
          .split("\n")
          .map((l: string) => l.replace(/^\d+[.\)]\]\s*/, "").replace(/^[-•*]\s*/, "").trim())
          .filter((l: string) => {
            if (l.length < 10) return false;
            if (/^[\{\}\[\],:\"]+$/.test(l)) return false;
            if (l.startsWith('"questions"')) return false;
            return true;
          });

        return { questions: lines.length > 0 ? lines : ["AI failed to generate proper questions — try again"] };
      } catch (retryErr: any) {
        lastError = retryErr;
        console.error(`⚠ Groq attempt ${attempt + 1} failed:`, retryErr?.message || retryErr);
        if (attempt < 2) {
          console.log("⏳ Waiting 3s before retry...");
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    console.error("❌ Groq ERROR after 3 attempts:", lastError?.message || lastError);
    return { questions: ["AI generation failed — try again"] };

  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return { questions: ["AI generation failed — try again"] };
  }
}

// ─────────────────────────────────────────────────────────────
// Answer Evaluation
// ─────────────────────────────────────────────────────────────

export async function evaluateAnswer(question: string, answer: string) {
  try {
    const userPrompt = `Evaluate this interview answer:

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Score from 1-10 and give specific, actionable feedback. Be fair — a decent answer should get 5-6, not 2-3.

Return ONLY valid JSON:
{
  "score": number_from_1_to_10,
  "strength": "What specifically was good about the answer",
  "improvement": "What exactly was missing or could be deeper — be specific",
  "betterAnswer": "A concise model answer (3-5 sentences) that a strong candidate would give"
}`;

    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 Evaluation attempt ${attempt + 1}/3...`);

        const response = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: EVALUATION_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        });

        const raw = response.choices[0].message.content || "";
        console.log("🧠 Evaluation RAW:", raw.substring(0, 200));

        let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();

        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          console.log("✅ Evaluation score:", parsed.score);
          return parsed;
        }

        const parsed = JSON.parse(cleaned);
        console.log("✅ Evaluation score:", parsed.score);
        return parsed;
      } catch (retryErr: any) {
        lastError = retryErr;
        console.error(`⚠ Evaluation attempt ${attempt + 1} failed:`, retryErr?.message || retryErr);
        if (attempt < 2) {
          console.log("⏳ Waiting 3s before retry...");
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    console.error("❌ Evaluation failed after 3 attempts:", lastError?.message);
    return {
      score: 5,
      strength: "AI evaluation temporarily unavailable",
      improvement: "Please try again",
      betterAnswer: "",
    };

  } catch (err) {
    console.error("Unexpected evaluation error:", err);
    return {
      score: 5,
      strength: "Evaluation error",
      improvement: "Try again",
      betterAnswer: "",
    };
  }
}
