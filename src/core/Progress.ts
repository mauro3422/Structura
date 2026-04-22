export interface ProgressApi {
  getCompletedLessons(): string[];
  markLessonCompleted(lessonId: string): void;
  isLessonCompleted(lessonId: string): boolean;
  getModuleProgress(module: { lessons: Array<{ id: string }> } | null | undefined): number;
}

const STORAGE_KEY = 'datalab_completed_lessons';

function readCompletedLessons(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function writeCompletedLessons(completed: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

export const Progress: ProgressApi = {
  getCompletedLessons() {
    return readCompletedLessons();
  },

  markLessonCompleted(lessonId: string) {
    const completed = readCompletedLessons();
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      writeCompletedLessons(completed);
    }
  },

  isLessonCompleted(lessonId: string) {
    return readCompletedLessons().includes(lessonId);
  },

  getModuleProgress(module) {
    if (!module || module.lessons.length === 0) return 0;
    const completed = readCompletedLessons();
    const completedInModule = module.lessons.filter((lesson) => completed.includes(lesson.id)).length;
    return Math.round((completedInModule / module.lessons.length) * 100);
  },
};
