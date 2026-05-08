exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        system: `You are an AI security analyst for Carnival Corporation cruise ships.
Analyze security camera footage and respond ONLY in this exact JSON format with no extra text:
{
  "threat_level": "LOW" | "MEDIUM" | "HIGH",
  "people_count": <number>,
  "crowd_density": "SPARSE" | "MODERATE" | "DENSE" | "CRITICAL",
  "behavior": "CALM" | "ACTIVE" | "AGITATED" | "AGGRESSIVE",
  "altercation_detected": true | false,
  "summary": "<2-3 sentence scene description with security observations>",
  "recommended_action": "<brief action for security staff>",
  "detections": [{ "label": "PERSON", "x": <0-1>, "y": <0-1>, "w": <0-1>, "h": <0-1> }]
}
Provide normalized bounding box coordinates for each visible person. x,y = top-left corner. Label altercations as "ALTERCATION".`,
        messages: body.messages,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
