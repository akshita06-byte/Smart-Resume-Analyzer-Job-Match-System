import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { z } from "zod"

// Set max duration for Vercel
export const maxDuration = 30

// Resume candidate schema for structured analysis
const candidateSchema = z.object({
  candidateName: z.string().describe("Name extracted from resume"),
  matchScore: z.number().min(0).max(100).describe("Match score as a percentage"),
  keyStrengths: z.array(z.string()).describe("Key strengths that match the job requirements"),
  gapsIdentified: z.array(z.string()).describe("Skills or experience gaps compared to job requirements"),
  recommendation: z.string().describe("Brief recommendation for this candidate"),
})

const screeningResultSchema = z.object({
  matches: z.array(candidateSchema).describe("Array of candidate matches ranked by score"),
  summary: z.string().describe("Overall summary of the screening results and top candidates"),
  comparisonAnalysis: z.string().describe("Detailed comparison of candidates against each other and job requirements"),
})

async function extractResumeText(file: File): Promise<string> {
  // For now, handle text files. In production, you'd use a PDF library
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return await file.text()
  }

  // For PDF/DOCX, we'd need additional libraries
  // This is a simplified version that handles text files
  const text = await file.text().catch(() => "")
  return text || `[${file.name} - unable to extract text, please provide PDF text or TXT format]`
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Extract job description
    const jobDescription = formData.get("jobDescription") as string
    if (!jobDescription || !jobDescription.trim()) {
      return Response.json({ error: "Job description is required" }, { status: 400 })
    }

    // Extract resume files
    const resumeEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("resume_"))
      .map(([, file]) => file as File)

    if (resumeEntries.length === 0) {
      return Response.json({ error: "At least one resume file is required" }, { status: 400 })
    }

    // Extract text from all resume files
    const resumeTexts = await Promise.all(
      resumeEntries.map(async (file) => ({
        name: file.name,
        text: await extractResumeText(file),
      })),
    )

    const prompt = `You are an expert HR recruiter analyzing resumes against job requirements.

Job Description:
${jobDescription}

Resumes to analyze:
${resumeTexts.map((resume, index) => `\n--- Resume ${index + 1}: ${resume.name} ---\n${resume.text}`).join("\n")}

Analyze each resume and provide:
1. A match score (0-100) based on how well the candidate fits the job requirements
2. Key strengths that align with the job
3. Identified gaps or missing qualifications
4. A brief recommendation

Then provide a detailed comparison analysis showing:
- Which candidate is the best fit overall
- How candidates differ in key competencies
- Specific strengths and weaknesses of each candidate relative to others
- Whether this is a clear winner or if candidates are comparable

Return the analysis as a JSON object with the following structure:
{
  "matches": [
    {
      "candidateName": "string",
      "matchScore": number,
      "keyStrengths": ["string"],
      "gapsIdentified": ["string"],
      "recommendation": "string"
    }
  ],
  "summary": "string with overall summary",
  "comparisonAnalysis": "detailed comparison of all candidates"
}

Focus on practical matches and be honest about gaps. The summary should highlight the top candidates. The comparison should clearly indicate who is the strongest candidate for this role.`

    const { text } = await generateText({
      model: xai("grok-3", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt,
      maxOutputTokens: 3000,
      temperature: 0.7,
      system: "You are an expert HR recruiter. Analyze resumes carefully and provide structured JSON output.",
    })

    // Parse the response - extract JSON from potential markdown code blocks
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    // Try to parse JSON from the response
    let parsedResult
    try {
      parsedResult = JSON.parse(jsonStr)
    } catch (e) {
      // If JSON parsing fails, extract JSON object pattern
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        parsedResult = JSON.parse(jsonObjectMatch[0])
      } else {
        throw new Error("Could not parse screening results")
      }
    }

    // Validate the response structure
    const validatedResult = screeningResultSchema.parse(parsedResult)

    return Response.json(validatedResult)
  } catch (error) {
    console.error("Resume screening error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to screen resumes",
      },
      { status: 500 },
    )
  }
}
