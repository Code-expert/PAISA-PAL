import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name, " - ", m.supportedGenerationMethods.join(",")));
  } else {
    console.error("Failed to fetch models:", data);
  }
}

listModels();
