import type { QuestionLevel, QuestionType } from "../game/types";

/** Название викторины на стартовом экране. */
export const QUIZ_TITLE = "Литературная викторина";

/** Подзаголовок (например, название произведения). Оставьте пустым, если не нужен. */
export const QUIZ_SUBTITLE = "Адыл Якубов. «Сокровища Улугбека»";

/** Дополнительные баллы за правильный ответ на вопрос «Кот в мешке». */
export const CAT_IN_BAG_BONUS = 50;

/** Колонки игрового поля — порядок слева направо. */
export const CATEGORIES: { type: QuestionType; label: string }[] = [
  { type: "analysis", label: "Анализ и обсуждение" },
  { type: "details", label: "Детали, предметы и слова" },
  { type: "events", label: "Сюжет и события" },
  { type: "characters", label: "Персонажи" },
];

/** Строки игрового поля — порядок сверху вниз. */
export const LEVELS: { level: QuestionLevel; label: string; defaultPoints: number }[] = [
  { level: "easy", label: "Лёгкий", defaultPoints: 200 },
  { level: "middle", label: "Средний", defaultPoints: 300 },
  { level: "intermediate", label: "Повышенный", defaultPoints: 400 },
  { level: "hard", label: "Сложный", defaultPoints: 500 },
];

export function categoryLabel(type: QuestionType): string {
  return CATEGORIES.find((c) => c.type === type)?.label ?? type;
}
