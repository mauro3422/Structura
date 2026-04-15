/**
 * DataLab Progress Manager
 * Handles local gamification/progress storage (future Supabase sync layer)
 */

export const Progress = {
  getCompletedLessons() {
    try {
      const stored = localStorage.getItem('datalab_completed_lessons');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  markLessonCompleted(lessonId) {
    const completed = this.getCompletedLessons();
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      localStorage.setItem('datalab_completed_lessons', JSON.stringify(completed));
    }
  },

  isLessonCompleted(lessonId) {
    return this.getCompletedLessons().includes(lessonId);
  },

  getModuleProgress(module) {
    if (!module || module.lessons.length === 0) return 0;
    const completed = this.getCompletedLessons();
    const completedInModule = module.lessons.filter(l => completed.includes(l.id)).length;
    return Math.round((completedInModule / module.lessons.length) * 100);
  }
};
