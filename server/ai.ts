import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Image generation options
interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  backgroundColor?: string;
}

/**
 * Generate an image using OpenAI's DALL-E model
 * 
 * @param options Image generation options
 * @returns URL to the generated image
 */
export async function generateImage({ prompt, style = 'realistic', backgroundColor = 'transparent' }: ImageGenerationOptions): Promise<string> {
  // Enhance the prompt based on style and background settings
  let enhancedPrompt = prompt;
  
  // Add style-specific modifiers
  switch (style) {
    case 'realistic':
      enhancedPrompt += ", photorealistic, high detail, 8k resolution";
      break;
    case 'artistic':
      enhancedPrompt += ", artistic style, vibrant colors, stylized";
      break;
    case 'simple':
      enhancedPrompt += ", simple design, clean lines, minimal style";
      break;
  }
  
  // Add background settings
  switch (backgroundColor) {
    case 'transparent':
      enhancedPrompt += ", isolated on transparent background, studio product photography";
      break;
    case 'white':
      enhancedPrompt += ", on pure white background, studio product photography";
      break;
    case 'gradient':
      enhancedPrompt += ", on soft gradient background, professional product photography";
      break;
  }
  
  // For aquascape assets, ensure we have good lighting
  enhancedPrompt += ", studio lighting, professional photography, high quality render";
  
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });
    
    // Need to use type assertion since TypeScript doesn't know
    // the OpenAI API always returns a URL when successful
    const url = response.data[0].url as string;
    if (!url) {
      throw new Error("No image URL returned from OpenAI API");
    }
    return url;
  } catch (error) {
    console.error("Error generating image with OpenAI:", error);
    throw new Error("Failed to generate image. Please try again with a different prompt.");
  }
}

/**
 * Generate a description for an asset
 * 
 * @param name Asset name
 * @param category Asset category
 * @param userDescription User-provided description or prompt
 * @returns AI-generated description
 */
export async function generateDescription(name: string, category: string, userDescription: string): Promise<string> {
  try {
    // Customize the system message based on the category
    let systemMessage = "You are an expert in aquarium plants and aquascaping.";
    
    switch (category) {
      case "plants":
        systemMessage = "You are an expert in aquarium plants and aquatic botany. Provide detailed, informative descriptions of aquarium plants including their appearance, care requirements, and ideal placement in tanks.";
        break;
      case "hardscape":
        systemMessage = "You are an expert in aquarium hardscape materials. Provide detailed, informative descriptions of aquarium rocks, driftwood, and other decorative elements including their appearance, composition, and uses in aquascaping.";
        break;
      case "fish":
        systemMessage = "You are an expert in aquarium fish species. Provide detailed, informative descriptions of fish including their appearance, behavior, care requirements, and compatibility with other species.";
        break;
      case "substrate":
        systemMessage = "You are an expert in aquarium substrate materials. Provide detailed, informative descriptions of aquarium substrates including their composition, benefits, and ideal use cases.";
        break;
    }
    
    const prompt = `Write a concise but detailed description (100-150 words) of the aquarium ${category} called "${name}". ${userDescription ? `User description: ${userDescription}` : ''}`;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });
    
    // Ensure we always return a string
    const content = response.choices[0].message.content;
    return content !== null && content !== undefined ? content : "No description generated.";
  } catch (error) {
    console.error("Error generating description with OpenAI:", error);
    throw new Error("Failed to generate description. Using placeholder text instead.");
  }
}