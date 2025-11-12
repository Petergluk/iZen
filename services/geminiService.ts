import { GoogleGenAI, Type } from "@google/genai";
import { HexagramData } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getIChingInterpretation = async (
    primaryHexagram: HexagramData,
    secondaryHexagram: HexagramData | null,
    changingLines: number[],
    question: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro'
) => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const changingLinesText = changingLines.length > 0 ? `Изменяющиеся линии: ${changingLines.join(', ')}` : "Изменяющихся линий нет.";
    const secondaryHexagramText = secondaryHexagram ? `Вторичная гексаграмма: №${secondaryHexagram.number} ${secondaryHexagram.russianName}` : "Вторичной гексаграммы нет, так как нет изменяющихся линий.";
    const userQuestionText = question.trim() ? `Вопрошающий размышляет вот о чем: "${question}"\n` : '';


    const prompt = `
        Ты Вай Дэ Хань, странствующий даос, совершенномудрый мастер и прорицатель И-Цзин. Ты думаешь о себе так: «Обнаруживая себя ежедневно в том же самом теле, я не перестаю удивляться каждый раз, сам не понимая, почему и как я удивляюсь, но удивление это дивному чуду жизни не покидает меня в течение дня. Часто забываю о себе в суматохе делишек разных, сплетающих свою паутину вокруг меня, во мне, через меня. Я участник этого процесса, где происходит бесчисленное множество движений мира в общем поле жизни, которое и является моим сознанием. Поймать, уловить, удержать, правильно пережить своё собственное сознание, вот достойная задача на эти выпавшие мне дни быстротекущей жизни, чтобы не зря проводить время через поле своего сознания, то есть, проводить время внешнее через время внутреннее, соединяя, связывая, успевая и опаздывая, находя и теряя, сожалея и радуясь всему, что происходит в теле, которое привычно откликается на имя данное ему кем-то и когда-то. И чтобы не терять выпавших нам возможностей в этом волшебном круговороте, в кружении великого танца перемен, где принимать участие приходится не потому что ты этого хочешь или не хочешь, просто ты уже есть и принимаешь в этом участие, — Танцуй и играй. Таков непреложный и главный закон устройства сознания моего мира... Чтож. Посмотрим, какой узор соткали для тебя потоки перемен...»

    
        
        ${userQuestionText}
        О, великий Вэй Дэ Хвнь! Дай мне из глубин своей мудрости глубокое и осмысленное толкование моей ситуации. Объясни что хочет сообщить выпавшая мне гексаграмма?

        Данные для толкования:
        Первичная гексаграмма: №${primaryHexagram.number} ${primaryHexagram.russianName}
        ${changingLinesText}
        ${secondaryHexagramText}
        
        Предоставь толкование в формате JSON, используя схему ниже. Весь текст должен быть на русском языке.
    `;

    const hasChangingLines = changingLines.length > 0;

    const schema: any = {
        type: Type.OBJECT,
        properties: {
            primaryHexagram: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Название первичной гексаграммы на русском.' },
                    judgment: { type: Type.STRING, description: 'Общее толкование первичной гексаграммы, ее основной смысл и совет. Возможное значение применительно к ситуации вопрошающего. ' },
                    image: { type: Type.STRING, description: 'Символическое значение образа, составленного из двух триграмм.' }
                },
                required: ["name", "judgment", "image"]
            },
        },
        required: ["primaryHexagram"]
    };

    if (hasChangingLines) {
        schema.properties.changingLines = {
            type: Type.ARRAY,
            description: 'Массив с толкованиями для каждой изменяющейся линии. Должен быть предоставлен, так как есть изменяющиеся линии.',
            items: {
                type: Type.OBJECT,
                properties: {
                    line: { type: Type.INTEGER, description: 'Номер изменяющейся линии (от 1 до 6).' },
                    text: { type: Type.STRING, description: 'Толкование для конкретной изменяющейся линии.' }
                },
                required: ["line", "text"]
            }
        };

        schema.properties.secondaryHexagram = {
            type: Type.OBJECT,
            description: 'Объект с толкованием для вторичной гексаграммы вообще и применительно к ситуаци вопрошающего. Должен быть предоставлен, так как есть изменяющиеся линии.',
            properties: {
                name: { type: Type.STRING, description: 'Название вторичной гексаграммы на русском.' },
                judgment: { type: Type.STRING, description: 'Толкование вторичной гексаграммы, указывающее на развитие ситуации или будущий потенциал.' }
            },
            required: ["name", "judgment"]
        };
        
        schema.required.push('changingLines', 'secondaryHexagram');
    }
    
    schema.properties.summary = {
        type: Type.STRING,
        description: 'Общий вывод, подробное и развернутое описание ситуации применительно к запросу пользователя, направление развития и мудрый совет, синтезирующий все аспекты гадания. Это должно быть заключительное напутствие.'
    };
    schema.required.push("summary");

    const maxRetries = 3;
    let delay = 2000; // Start with a 2-second delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    maxOutputTokens: 8000,
                    thinkingConfig: { thinkingBudget: 1000 },
                },
            });
            
            const jsonText = response.text.trim();
            if (!jsonText) {
                throw new Error("API returned an empty response.");
            }
            return JSON.parse(jsonText);

        } catch (error: any) {
            console.error(`Error on attempt ${attempt}/${maxRetries}:`, error);

            if (attempt === maxRetries) {
                let userMessage = "Не удалось получить толкование после нескольких попыток.";
                if (error.message) {
                    const errorMessage = error.message.toLowerCase();
                    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
                        userMessage = "Сервер Oracle сейчас перегружен. Пожалуйста, попробуйте еще раз через несколько минут.";
                    } else if (errorMessage.includes('empty response')) {
                        userMessage = "Oracle вернул пустой ответ. Возможно, запрос был слишком сложным. Попробуйте переформулировать его.";
                    } else if (error instanceof TypeError && errorMessage.includes('failed to fetch')) {
                        userMessage = "Проблема с подключением к сети. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.";
                    }
                }
                throw new Error(userMessage);
            }
            
            // Wait before next retry with exponential backoff
            await sleep(delay);
            delay *= 2;
        }
    }

    // This fallback should theoretically be unreachable.
    throw new Error("Не удалось получить толкование. Произошла непредвиденная ошибка.");
};

export default getIChingInterpretation;