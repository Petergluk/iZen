import { DivinationResult, HexagramData } from '../types';

// FIX: Hardcode API_URL to '/api' to resolve TypeScript error and rely on Vite proxy.
const API_URL = '/api';

const getIChingInterpretation = async (
    primaryHexagram: HexagramData,
    secondaryHexagram: HexagramData | null,
    changingLines: number[],
    question: string
): Promise<DivinationResult> => {

    try {
        const response = await fetch(`${API_URL}/interpret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                primaryHexagram,
                secondaryHexagram,
                changingLines,
                question
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `Ошибка сервера: ${response.statusText}`);
        }

        const data: DivinationResult = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching interpretation:", error);
        if (error instanceof Error) {
            throw new Error(`Не удалось получить толкование: ${error.message}`);
        }
        throw new Error("Не удалось получить толкование. Пожалуйста, попробуйте еще раз.");
    }
};

export default getIChingInterpretation;
