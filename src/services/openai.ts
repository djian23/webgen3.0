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
  } catch (error: any) {
    console.error('Erreur OpenAI:', error);
    
    // Gestion spécifique des erreurs OpenAI
    if (error?.status === 429) {
      throw new Error('Quota API OpenAI dépassé. Veuillez vérifier votre plan et vos détails de facturation sur platform.openai.com. Vous devrez peut-être mettre à jour votre clé API dans les paramètres.');
    } else if (error?.status === 401) {
      throw new Error('Clé API OpenAI invalide. Veuillez vérifier votre clé API dans les paramètres.');
    } else if (error?.status === 403) {
      throw new Error('Accès refusé à l\'API OpenAI. Vérifiez les permissions de votre clé API.');
    } else if (error?.status === 500) {
      throw new Error('Erreur serveur OpenAI. Veuillez réessayer dans quelques instants.');
    } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
    } else {
      throw new Error(`Erreur OpenAI: ${error?.message || 'Erreur inconnue'}. Vérifiez votre clé API et votre connexion.`);
    }
  }
}