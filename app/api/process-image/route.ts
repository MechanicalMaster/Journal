import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get the image data from the request
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Create a system prompt for extracting text from the journal page
    const systemPrompt = `
      You are an AI assistant specialized in extracting text from images of handwritten or typed journal pages.
      Please extract all the text from the image accurately.
      Format the text in a natural way, preserving paragraphs, bullet points, and line breaks as they appear in the original.
      Indicate uncertain words or phrases with [brackets].
      If the text is completely unreadable, please indicate that.
    `;

    // Call the OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all text from this journal page:" },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Extract the result from the API response
    const extractedText = response.choices[0]?.message.content || "No text could be extracted.";

    // Identify potentially uncertain words (marked with brackets)
    const errorRanges: { start: number; end: number }[] = [];
    const regex = /\[(.*?)\]/g;
    let match;
    
    while ((match = regex.exec(extractedText)) !== null) {
      errorRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      errorRanges,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Determine if it's an OpenAI API error or other error
    let errorMessage = "Failed to process image";
    let errorDetails = "";
    
    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message;
      errorDetails = JSON.stringify({
        type: error.type,
        code: error.code,
        status: error.status
      });
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage, 
        details: errorDetails 
      },
      { status: 500 }
    );
  }
} 