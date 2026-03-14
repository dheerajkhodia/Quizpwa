class AppState {
  constructor() {
    this.rawData = null;
    this.topics = [];
    
    // Active session state
    this.currentTopic = null;
    this.questionsForTopic = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    
    // Tracking for Review & Time
    this.sessionStartTime = 0;
    this.sessionEndTime = 0;
    this.userAnswers = []; // stores { questionStr, userSelected, answerStr, isCorrect }
  }

  init(data) {
    this.rawData = data;
    const topicSet = new Set();
    if (data && data.questions) {
      data.questions.forEach(q => {
        if (q.topic) topicSet.add(q.topic);
      });
    }
    this.topics = Array.from(topicSet);
  }

  getAppMeta() {
    return {
      source: this.rawData?.source || '',
      category: this.rawData?.category || 'Quiz',
      total_topics: this.topics.length,
      total_questions: this.rawData?.questions?.length || 0
    };
  }

  setTopic(topicName) {
    this.currentTopic = topicName;
    this.questionsForTopic = this.rawData.questions.filter(q => q.topic === topicName);
    this.currentQuestionIndex = 0;
    this.score = 0;
    
    this.userAnswers = [];
    this.sessionStartTime = Date.now();
    this.sessionEndTime = 0;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questionsForTopic.length) return null;
    return this.questionsForTopic[this.currentQuestionIndex];
  }

  isLastQuestion() {
    return this.currentQuestionIndex === this.questionsForTopic.length - 1;
  }

  submitAnswer(selectedOptionText) {
    const q = this.getCurrentQuestion();
    const isCorrect = q.answer.trim() === selectedOptionText.trim() || selectedOptionText.includes(q.answer.trim());
    
    if (isCorrect) {
      this.score += 1;
    }
    
    // Record for Review
    this.userAnswers.push({
      questionText: q.question,
      userSelected: selectedOptionText,
      correctAnswer: q.answer,
      isCorrect: isCorrect
    });

    if (this.isLastQuestion()) {
      this.sessionEndTime = Date.now();
    }

    return {
      isCorrect,
      correctAnswer: q.answer
    };
  }

  nextQuestion() {
    this.currentQuestionIndex += 1;
  }

  getTimeTakenMs() {
    let end = this.sessionEndTime || Date.now();
    return end - this.sessionStartTime;
  }
  
  getFormattedTimeTaken() {
    const ms = this.getTimeTakenMs();
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getScoreInfo() {
    return {
      topic: this.currentTopic,
      score: this.score,
      total: this.questionsForTopic.length,
      percentage: this.questionsForTopic.length > 0 
        ? Math.round((this.score / this.questionsForTopic.length) * 100) 
        : 0,
      timeString: this.getFormattedTimeTaken(),
      history: this.userAnswers
    };
  }
}

export const state = new AppState();
