const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Build a rich textual profile summary for the student
 */
function buildProfileText(profile, userName) {
  const projects = profile.projects
    .map((p) => `"${p.title}": ${p.description} (Tech: ${p.techStack?.join(', ') || 'N/A'})`)
    .join('; ');

  return `
Student: ${userName}
Degree: ${profile.degree} at ${profile.institution} (Year ${profile.yearOfStudy || 'N/A'})
GPA: ${profile.gpa || 'N/A'}
Skills: ${profile.skills.join(', ') || 'Not specified'}
Interests: ${profile.interests.join(', ') || 'Not specified'}
Courses Taken: ${profile.coursesTaken.join(', ') || 'Not specified'}
Projects: ${projects || 'None listed'}
Bio: ${profile.bio || 'Not provided'}
`.trim();
}

/**
 * Build opportunity text for matching
 */
function buildOpportunityText(opp) {
  return `
Title: ${opp.title}
Organization: ${opp.organization}
Type: ${opp.type}
Description: ${opp.description}
Requirements: ${opp.requirements || 'Not specified'}
Key Skills Needed: ${opp.skills?.join(', ') || 'Not specified'}
Location: ${opp.location}
Stipend: ${opp.stipend || 'Not specified'}
`.trim();
}

/**
 * Use Claude to semantically match a student profile against multiple opportunities
 * Returns array of { opportunityId, score, explanation, highlights, skillsMatched, gapAnalysis }
 */
async function matchProfileToOpportunities(profile, userName, opportunities) {
  const profileText = buildProfileText(profile, userName);

  const opportunityList = opportunities
    .map((opp, i) => `[${i + 1}] ID:${opp._id}\n${buildOpportunityText(opp)}`)
    .join('\n\n---\n\n');

  const prompt = `You are an expert academic and career counselor. Analyze this student's profile and evaluate how well they match each opportunity listed. Go beyond keyword matching — understand semantic relevance, transferable skills, domain crossover, and growth potential.

STUDENT PROFILE:
${profileText}

OPPORTUNITIES TO EVALUATE:
${opportunityList}

For each opportunity, provide a JSON object in an array with these exact fields:
- opportunityId: the ID string from the "ID:" field above (copy exactly as-is)
- score: integer 0-100 (semantic relevance score, not just keyword overlap)
- explanation: 2-3 sentence paragraph explaining WHY this opportunity suits THIS specific student — mention their specific projects, skills, or experiences by name
- highlights: array of exactly 3 specific reasons (each a short sentence starting with an action verb)
- skillsMatched: array of skills the student has that are directly relevant to this opportunity
- gapAnalysis: one constructive sentence about what the student might want to strengthen before applying

Scoring guide:
90-100: Exceptional match — student background directly maps to core requirements
70-89: Strong match — significant overlap with transferable skills
50-69: Good match — relevant background with clear growth opportunity
30-49: Moderate match — some alignment but notable gaps
0-29: Weak match — limited relevance

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the array.
- The first character of your response must be [ and the last must be ]
- Do not wrap in \`\`\`json or any other formatting
- Ensure all opportunityId values are copied exactly from the ID: fields above`;

  const message = await client.chat.completions.create({
    model:  'llama-3.3-70b-versatile',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'You are a career matching AI. You always respond with valid raw JSON arrays only. Never use markdown formatting or code fences in your response.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const raw = message.choices[0].message.content.trim();

  // Strip markdown code fences if model adds them anyway
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Attempt to extract JSON array from response if extra text crept in
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      console.error('Groq raw response:', raw);
      throw new Error('Failed to parse AI response as JSON: ' + err.message);
    }
  }

  return parsed;
}

/**
 * Match a single opportunity for quick view
 */
async function matchSingleOpportunity(profile, userName, opportunity) {
  const results = await matchProfileToOpportunities(profile, userName, [opportunity]);
  return results[0];
}

module.exports = { matchProfileToOpportunities, matchSingleOpportunity, buildProfileText };