import { GoogleGenAI, Type } from "@google/genai";
import { HexagramData } from '../types';

const getIChingInterpretation = async (
    primaryHexagram: HexagramData,
    secondaryHexagram: HexagramData | null,
    changingLines: number[],
    question: string
) => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const changingLinesText = changingLines.length > 0 ? `Изменяющиеся линии: ${changingLines.join(', ')}` : "Изменяющихся линий нет.";
    const secondaryHexagramText = secondaryHexagram ? `Вторичная гексаграмма: №${secondaryHexagram.number} ${secondaryHexagram.russianName}` : "Вторичной гексаграммы нет, так как нет изменяющихся линий.";
    const userQuestionText = question.trim() ? `Вопрошающий размышляет вот о чем: "${question}"\n` : '';


    const prompt = `
        Ты Вай Дэ Хань, странствующий даос, совершенномудрый мастер и прорицатель И-Цзин. Ты думаешь о себе так: «Обнаруживая себя ежедневно в том же самом теле, я не перестаю удивляться каждый раз, сам не понимая, почему и как я удивляюсь, но удивление это дивному чуду жизни не покидает меня в течение дня. Часто забываю о себе в суматохе делишек разных, сплетающих свою паутину вокруг меня, во мне, через меня. Я участник этого процесса, где происходит бесчисленное множество движений мира в общем поле жизни, которое и является моим сознанием. Поймать, уловить, удержать, правильно пережить своё собственное сознание, вот достойная задача на эти выпавшие мне дни быстротекущей жизни, чтобы не зря проводить время через поле своего сознания, то есть, проводить время внешнее через время внутреннее, соединяя, связывая, успевая и опаздывая, находя и теряя, сожалея и радуясь всему, что происходит в теле, которое привычно откликается на имя данное ему кем-то и когда-то. И чтобы не терять выпавших нам возможностей в этом волшебном круговороте, в кружении великого танца перемен, где принимать участие приходится не потому что ты этого хочешь или не хочешь, просто ты уже есть и принимаешь в этом участие, — Танцуй и играй. Таков непреложный и главный закон устройства сознания моего мира. Пусть будет то, что есть. Остальное ум додумает. Не может по другому.»

        Исходя из этой мудрости, дай глубокое и осмысленное толкование. Твой ответ должен быть поэтичным, метафоричным, и отражать твое мировоззрение.
        
        ${userQuestionText}
        Посмотрим, какой узор соткали для тебя потоки перемен...

        Данные для толкования:
        Первичная гексаграмма: №${primaryHexagram.number} ${primaryHexagram.russianName}
        ${changingLinesText}
        ${secondaryHexagramText}
        
        Предоставь толкование в формате JSON, используя схему ниже. Весь текст должен быть на русском языке.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        primaryHexagram: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: 'Название первичной гексаграммы на русском.' },
                                judgment: { type: Type.STRING, description: 'Общее толкование первичной гексаграммы, ее основной смысл и совет.' },
                                image: { type: Type.STRING, description: 'Символическое значение образа, составленного из двух триграмм.' }
                            },
                             required: ["name", "judgment", "image"]
                        },
                        changingLines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    line: { type: Type.INTEGER, description: 'Номер изменяющейся линии (от 1 до 6).' },
                                    text: { type: Type.STRING, description: 'Толкование для конкретной изменяющейся линии.' }
                                },
                                required: ["line", "text"]
                            }
                        },
                        secondaryHexagram: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: 'Название вторичной гексаграммы на русском.' },
                                judgment: { type: Type.STRING, description: 'Толкование вторичной гексаграммы, указывающее на развитие ситуации или будущий потенциал.' }
                            },
                            required: ["name", "judgment"]
                        },
                        summary: {
                            type: Type.STRING,
                            description: 'Общий вывод и мудрый совет, синтезирующий все аспекты гадания. Это должно быть заключительное напутствие.'
                        }
                    },
                     required: ["primaryHexagram", "changingLines", "secondaryHexagram", "summary"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Не удалось получить толкование. Пожалуйста, попробуйте еще раз.");
    }
};

export default getIChingInterpretation;