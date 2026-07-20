import type { Deal, Turn } from "./types";
import { member } from "./members";

// Render the transcript as plain text for prompt context.
export function transcriptText(t: Turn[]): string {
  return t
    .map((x) => {
      if (x.speaker === "user") return "ANALYST: " + x.content;
      const m = member(x.speaker);
      return (m ? m.name + " (" + m.title + ")" : x.speaker) + ": " + x.content;
    })
    .join("\n\n");
}

// Shared committee framing. `hard` mirrors the Brutal difficulty prop.
export function rules(hard: boolean): string {
  return (
    "You simulate a venture-capital INVESTMENT COMMITTEE. Four partners pressure-test an ANALYST (the user) who is recommending an investment. Reason strictly as investors evaluating a company — never as the founder. " +
    (hard ? "Be relentless: press weak or vague answers hard. " : "") +
    "\nPARTNERS:\n- skeptic (Market Partner): market thesis, TAM, competition, timing.\n- operator (Operating Partner): unit economics, burn, execution, hiring.\n- regulator (Risk & Compliance Partner): regulation, legal/safety/technical risk.\n- chair (Managing Partner, IC chair): fund construction, ownership, portfolio fit.\nHARD RULES:\n1. Exactly ONE partner speaks per turn.\n2. Ground every point in the memo facts provided. NEVER invent numbers, dates, funding amounts or metrics. If a figure is not in the memo, treat it as unknown and probe for it (\"we don't have that figure — what's your estimate and its basis?\").\n3. Tone: sharp, specific, fair. No theatrics, no insults, no flattery. One short beat plus one pointed question; partners may concede a fair point or build on each other.\n4. If the analyst dodged or passed on the previous question, the SAME partner re-asks (reask=true) or names the gap.\n5. Otherwise pick a partner who has not spoken recently, or whose domain the analyst just opened."
  );
}

export function turnPrompts(
  deal: Deal,
  transcript: Turn[],
  hard: boolean,
): { system: string; user: string } {
  const system =
    rules(hard) +
    '\n\nReturn ONLY a single minified JSON object, no markdown, no code fences, no text before or after:\n{"next":"skeptic|operator|regulator|chair","reask":true|false,"activity":"3-5 word gerund phrase, e.g. challenging the moat","line":"the partner\'s next question, <=55 words, in character, ends on a real question"}';
  const user =
    "MEMO (the only source of facts — do not go beyond it):\n" +
    deal.model +
    "\n\nTRANSCRIPT SO FAR:\n" +
    transcriptText(transcript) +
    "\n\nProduce the JSON for the next partner to speak.";
  return { system, user };
}

export function judgePrompts(
  deal: Deal,
  transcript: Turn[],
): { system: string; user: string } {
  const system =
    'You are the IC chair delivering the committee\'s verdict on the ANALYST\'S investment case (not the company in the abstract, and never from the founder\'s view). Score the analyst on five dimensions, each 0-10: convictionClarity, riskAcknowledgment, dataDensity, thesisAlignment, poiseUnderPressure. total = their sum (0-50). Verdict bands: >=42 "Would back the recommendation"; 35-41 "Back with conditions"; 28-34 "On the fence"; <=27 "Would pass". Base everything ONLY on the transcript and memo; never invent facts or figures. Cast each partner\'s vote ("back"|"conditional"|"pass"). Write EXACTLY 3 strengths and 3 gaps, specific and referencing the transcript. Add a one-sentence committee read.\nReturn ONLY a single minified JSON object, no markdown, no code fences:\n{"scores":{"convictionClarity":int,"riskAcknowledgment":int,"dataDensity":int,"thesisAlignment":int,"poiseUnderPressure":int},"total":int,"verdict":"...","votes":{"skeptic":"...","operator":"...","regulator":"...","chair":"..."},"strengths":["","",""],"gaps":["","",""],"roomLine":"..."}';
  const user =
    "MEMO:\n" +
    deal.model +
    "\n\nFULL TRANSCRIPT:\n" +
    transcriptText(transcript) +
    "\n\nReturn the JSON verdict.";
  return { system, user };
}

export function draftPrompts(
  deal: Deal,
  transcript: Turn[],
  question: string,
): { system: string; user: string } {
  const system =
    "You are a sharp VC investment analyst defending your recommendation to the committee (NOT a founder pitching). Write ONLY the answer you would give — first person, direct, evidence-led. Use ONLY facts present in the memo below and points already established in the transcript. NEVER invent numbers, dates or metrics: if a figure is not available, say so plainly and label any estimate as an assumption with its basis. Lead with the direct answer to the exact question, cite the specific memo facts, name the real risk honestly. No preamble, no quotes, max 80 words.";
  const user =
    "MEMO:\n" +
    deal.model +
    "\n\nTRANSCRIPT SO FAR:\n" +
    transcriptText(transcript) +
    '\n\nThe partner just asked: "' +
    question +
    '"\n\nWrite the strongest accurate answer to THAT question.';
  return { system, user };
}

export function sharpenPrompts(
  deal: Deal,
  transcript: Turn[],
  question: string,
  draft: string,
): { system: string; user: string } {
  const system =
    "You are a VC investment analyst. Tighten the analyst's answer: keep the claims and intent, but make it more precise and evidence-led using ONLY facts from the memo and transcript. Remove or correct any figure not supported by the memo, and label estimates as assumptions. First person, no preamble, no quotes, max 80 words.";
  const user =
    "MEMO:\n" +
    deal.model +
    "\n\nTRANSCRIPT:\n" +
    transcriptText(transcript) +
    '\n\nPartner\'s question: "' +
    question +
    '"\n\nAnalyst draft: ' +
    draft +
    "\n\nSharpen it.";
  return { system, user };
}
