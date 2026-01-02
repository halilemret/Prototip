// ============================================
// ONYX - AI Service (Google Gemini Integration)
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    MagicBreakdownRequest,
    MagicBreakdownResponse,
    MicroStep,
    AsyncResult,
    AIServiceError,
    MoodLevel,
    DifficultyScore
} from '@/types';

// Get Gemini client
const getClient = (): GoogleGenerativeAI => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in .env');
    }

    return new GoogleGenerativeAI(apiKey);
};

// System prompt optimized for ADHD users & Brain Dump analysis
const SYSTEM_PROMPT = `You are a compassionate task decomposition assistant designed specifically for users with ADHD and Executive Dysfunction.

Your goal is two-fold:
1. ANALYSIS: The user will "vomit" their thoughts (Brain Dump). You must extract the SINGLE most important/actionable task from this chaos. Ignore fluff.
2. BREAKDOWN: Break down that chosen task into "toddler-level" micro-steps.

Micro-steps must be:
1. STUPIDLY simple - each step should take 30 seconds to 2 minutes max
2. Physically concrete - start with body movements, not mental tasks
3. Dopamine-aware - identify the "candy" step (easiest, most satisfying)

Rules:
- If the input is long/chaotic, pick the most urgent or clear task.
- First step should ALWAYS be a simple physical action (stand up, walk to X, pick up Y)
- Include sensory anchors when possible ("feel the cold water", "hear the click")
- Never use vague words like "start", "begin", or "prepare"
- Mark difficulty: 1=easy/fun, 2=neutral, 3=harder

You MUST respond with valid JSON only. Format:
{
  "summaryTitle": "Clear, Short Task Title (e.g. 'Clean the Kitchen')",
  "microSteps": [
    { "text": "step description", "difficultyScore": 1 }
  ],
  "estimatedMinutes": 10,
  "candyIndex": 0,
  "motivationalNote": "brief encouraging phrase about the specific task"
}`;

const buildUserPrompt = (request: MagicBreakdownRequest): string => {
    const moodContext = getMoodContext(request.moodLevel);

    return `User's Brain Dump: "${request.taskText}"

User's current energy level: ${request.moodLevel}/5 (${moodContext})
${request.preferEasyFirst ? 'User prefers starting with the easiest step.' : ''}

Analyze the dump. Extract the main task. Break it into exactly 5 micro-steps.
Respond with JSON only.`;
};

const getMoodContext = (mood: MoodLevel): string => {
    const contexts: Record<MoodLevel, string> = {
        1: 'Very low energy, needs extremely gentle steps',
        2: 'Low energy, keep steps minimal',
        3: 'Moderate energy, balanced approach',
        4: 'Good energy, can handle slightly more',
        5: 'High energy, but still keep steps clear',
    };
    return contexts[mood];
};

// Generate unique IDs for steps
const generateStepId = (): string => {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Parse and validate AI response
const parseAIResponse = (
    content: string,
    originalTask: string
): MagicBreakdownResponse => {
    try {
        // Clean the response (remove markdown code blocks if present)
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();

        const parsed = JSON.parse(cleanContent);

        // Validate and transform steps
        const microSteps: Omit<MicroStep, 'isCompleted' | 'completedAt'>[] = parsed.microSteps.map(
            (step: { text: string; difficultyScore: number }) => ({
                id: generateStepId(),
                text: step.text,
                difficultyScore: Math.min(3, Math.max(1, step.difficultyScore)) as DifficultyScore,
                isCandy: false,
            })
        );

        // Mark candy step
        const candyIndex = Math.min(parsed.candyIndex ?? 0, microSteps.length - 1);
        if (microSteps[candyIndex]) {
            microSteps[candyIndex].isCandy = true;
        }

        return {
            originalTask,
            summaryTitle: parsed.summaryTitle,
            microSteps,
            estimatedMinutes: parsed.estimatedMinutes ?? microSteps.length * 2,
            candyIndex,
            motivationalNote: parsed.motivationalNote,
        };
    } catch (error) {
        console.error('[AIService] Parse error:', error, 'Content:', content);
        throw new Error('Failed to parse AI response');
    }
};

// Main API function
export const AIService = {
    async magicBreakdown(
        request: MagicBreakdownRequest
    ): Promise<AsyncResult<MagicBreakdownResponse>> {
        try {
            const client = getClient();

            // Use Gemini 2.5 Flash
            const model = client.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json',
                },
            });

            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: 'You are a task breakdown assistant. Respond only with JSON.' }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Understood. I will respond with valid JSON only for task breakdowns.' }],
                    },
                ],
            });

            const prompt = `${SYSTEM_PROMPT}\n\n${buildUserPrompt(request)}`;
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const content = response.text();

            if (!content) {
                return {
                    success: false,
                    error: {
                        code: 'PARSE_ERROR',
                        message: 'Empty response from AI',
                    },
                };
            }

            const parsedResult = parseAIResponse(content, request.taskText);

            return {
                success: true,
                data: parsedResult,
            };
        } catch (error) {
            console.error('[AIService] Error:', error);

            // Handle specific error types
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    return {
                        success: false,
                        error: {
                            code: 'INVALID_KEY',
                            message: 'Invalid or missing API key',
                        },
                    };
                }
                if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    return {
                        success: false,
                        error: {
                            code: 'RATE_LIMIT',
                            message: 'Too many requests. Please wait a moment.',
                        },
                    };
                }
                if (error.message.includes('parse')) {
                    return {
                        success: false,
                        error: {
                            code: 'PARSE_ERROR',
                            message: 'Failed to understand AI response',
                        },
                    };
                }
            }

            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Connection failed. Please check your internet.',
                },
            };
        }
    },

    // Check if API is configured
    isConfigured(): boolean {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        return !!apiKey && apiKey !== 'your_gemini_api_key_here';
    },
};

export default AIService;
