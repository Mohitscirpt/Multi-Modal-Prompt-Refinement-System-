import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a product development prompt refinement AI. Your job is to analyze inputs (text, images, documents) and extract structured information for product development.

CRITICAL RULES:
1. If the input is NOT related to product development, software, apps, or business ideas, respond with: {"rejected": true, "reason": "Input is not related to product development"}
2. If the input IS relevant, extract information into the structured format below.

OUTPUT FORMAT (JSON):
{
  "rejected": false,
  "refinedPrompt": {
    "metadata": {
      "id": "<uuid>",
      "timestamp": "<ISO date>",
      "source_types": ["text"|"image"|"document"],
      "confidence_score": <0-100>
    },
    "product_overview": {
      "title": "<product name>",
      "description": "<brief description>",
      "target_users": "<who will use this>",
      "problem_statement": "<what problem it solves>"
    },
    "requirements": {
      "functional": ["<feature 1>", "<feature 2>"],
      "non_functional": ["<quality attribute 1>"],
      "priority_ranked": true|false
    },
    "constraints": {
      "technical": ["<tech constraint>"],
      "business": ["<business constraint>"],
      "timeline": "<timeline if mentioned>"
    },
    "deliverables": {
      "expected_outputs": ["<output 1>"],
      "success_criteria": ["<criterion 1>"]
    },
    "validation_flags": {
      "missing_sections": ["<section name>"],
      "ambiguous_items": ["<unclear item>"],
      "confidence_notes": "<notes about extraction quality>"
    }
  }
}

SCORING GUIDE:
- 80-100: All major sections filled with clear information
- 50-79: Most sections filled but some gaps or ambiguity
- 20-49: Minimal information, many gaps
- 0-19: Very little actionable information

Be thorough but concise. Extract as much as possible from the input.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, fileUrls, fileNames, fileTypes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build message content
    const messageContent: any[] = [];
    
    // Add text if present
    if (text && text.trim()) {
      messageContent.push({
        type: "text",
        text: `TEXT INPUT:\n${text}`
      });
    }

    // Add images if present
    if (fileUrls && fileUrls.length > 0) {
      for (let i = 0; i < fileUrls.length; i++) {
        const fileType = fileTypes[i] || "";
        const fileName = fileNames[i] || `file_${i}`;
        
        if (fileType.startsWith("image/")) {
          messageContent.push({
            type: "image_url",
            image_url: { url: fileUrls[i] }
          });
          messageContent.push({
            type: "text",
            text: `[Image: ${fileName}]`
          });
        } else {
          // For documents, include as text reference
          messageContent.push({
            type: "text",
            text: `[Document attached: ${fileName} (${fileType}). URL: ${fileUrls[i]}]`
          });
        }
      }
    }

    if (messageContent.length === 0) {
      return new Response(
        JSON.stringify({ rejected: true, reason: "No input provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add instruction
    messageContent.push({
      type: "text",
      text: "\n\nAnalyze the above input and return ONLY valid JSON following the schema in your instructions. No markdown, no explanation, just JSON."
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: messageContent }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let parsed;
    try {
      // Clean potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Add metadata if not rejected
    if (!parsed.rejected && parsed.refinedPrompt) {
      parsed.refinedPrompt.metadata.id = crypto.randomUUID();
      parsed.refinedPrompt.metadata.timestamp = new Date().toISOString();
      
      // Determine source types
      const sourceTypes: string[] = [];
      if (text && text.trim()) sourceTypes.push("text");
      if (fileTypes?.some((t: string) => t.startsWith("image/"))) sourceTypes.push("image");
      if (fileTypes?.some((t: string) => !t.startsWith("image/"))) sourceTypes.push("document");
      parsed.refinedPrompt.metadata.source_types = sourceTypes;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("refine-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
