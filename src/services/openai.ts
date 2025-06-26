import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function generateCode(prompt: string, context?: string): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI client non initialisé. Veuillez configurer votre clé API.');
  }

  const systemPrompt = `Tu es un assistant expert en développement web qui génère du code HTML, CSS et JavaScript de haute qualité.

Instructions:
- Génère du code propre, moderne et bien structuré
- Utilise les meilleures pratiques de développement web
- Ajoute des commentaires explicatifs quand nécessaire
- Assure-toi que le code est responsive et accessible
- Utilise CSS moderne (Flexbox, Grid, variables CSS)
- Pour JavaScript, utilise ES6+ et les bonnes pratiques

${context ? `Contexte du projet: ${context}` : ''}

Réponds uniquement avec le code demandé, sans explications supplémentaires.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Erreur lors de la génération du code.';
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    throw new Error('Erreur lors de la communication avec OpenAI. Vérifiez votre clé API.');
  }
}