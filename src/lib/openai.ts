/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationResult } from "@/types/location";
import OpenAI from "openai";

export async function extractLocationFromTweet(
  tweetText: string,
  userInfo?: any
): Promise<LocationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Extract the specific location mentioned in this Indonesian Twitter text about planned protests/demonstrations ("rencana demo"). Focus on the exact place where the planned protest will happen.

Tweet Text: ${tweetText}
${userInfo?.location ? `User Location: ${userInfo.location}` : ""}

CRITICAL RULES - READ CAREFULLY:
1. NEVER assume Jakarta unless EXPLICITLY mentioned in the text
2. Look for specific Indonesian government buildings, landmarks, or addresses
3. Common protest locations: DPR RI, DPRD [Province], Istana Negara, Polda, KPK, MK, BPK
4. Include province information when available (e.g., "DPRD Jawa Barat", "Polda Bali")
5. If multiple locations are mentioned, choose the most specific one

INDONESIAN LOCATION PATTERNS:
- Government buildings: "DPRD NTB", "Polda Bali", "DPR RI Jakarta"
- Landmarks: "Monas Jakarta", "Bundaran HI", "Gedung Sate Bandung"
- Universities: "UI Depok", "UGM Yogyakarta", "ITB Bandung"
- Streets: "Jl. Sudirman Jakarta", "Jl. Asia Afrika Bandung"

PROVINCE CAPITALS TO REMEMBER:
- NTB (Nusa Tenggara Barat): Mataram
- Bali: Denpasar
- Jawa Barat: Bandung
- Jawa Tengah: Semarang
- Jawa Timur: Surabaya
- Sumatera Utara: Medan
- Sulawesi Selatan: Makassar

Return ONLY the location name in Indonesian, without any additional text. If no specific location is mentioned, return "unknown".

Examples:
- "Rencana demo di DPRD NTB besok" → "DPRD NTB, Mataram"
- "Aksi massa di Gedung DPR Jakarta" → "DPR RI, Jakarta"
- "Demo mahasiswa besok di Polda Bali" → "Polda Bali, Denpasar"
- "Rencana unjuk rasa di Monas" → "Monas, Jakarta"
- "Aksi tolak UU di DPRD Jabar Bandung" → "DPRD Jawa Barat, Bandung"`;

    // Choose a model you have access to:
    // - "gpt-5" if enabled on your account
    // - otherwise "gpt-4o-mini" is a good, cheap extractor
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_LOCATION_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.1,
    });

    const extractedLocation = completion.choices[0]?.message?.content?.trim();

    if (!extractedLocation || extractedLocation.toLowerCase() === "unknown") {
      return {
        success: false,
        error: "No location found in tweet text",
      };
    }

    // Remove leading/trailing quotes if present
    const cleanLocation = extractedLocation.replace(/^["']|["']$/g, "").trim();

    if (cleanLocation.length < 3) {
      return {
        success: false,
        error: "Extracted location too short",
      };
    }

    // Confidence heuristic
    let confidence = 0.5; // base
    const lower = cleanLocation.toLowerCase();

    // Higher confidence for specific government buildings
    if (
      lower.includes("dprd") ||
      lower.includes(" dpr") || // includes 'DPR RI'
      lower.includes("polda") ||
      lower.includes("istana")
    ) {
      confidence += 0.3;
    }

    // Higher confidence if province/city present (comma or known cities)
    if (
      cleanLocation.includes(",") ||
      lower.includes("jakarta") ||
      lower.includes("bandung") ||
      lower.includes("surabaya") ||
      lower.includes("yogyakarta") ||
      lower.includes("denpasar") ||
      lower.includes("medan") ||
      lower.includes("makassar") ||
      lower.includes("semarang")
    ) {
      confidence += 0.2;
    }

    confidence = Math.min(confidence, 1.0);

    return {
      success: true,
      location: cleanLocation,
      confidence,
    };
  } catch (error) {
    console.error("Twitter location extraction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown extraction error",
    };
  }
}
