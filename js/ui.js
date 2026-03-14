export const ui = {
  // Elements
  screens: {
    loading: document.getElementById('loading-screen'),
    error: document.getElementById('error-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
  },
  
  errorMsg: document.getElementById('error-message'),
  
  // Dashboard
  appTitle: document.getElementById('app-title'),
  appSource: document.getElementById('app-source'),
  statTopics: document.getElementById('stat-topics'),
  statQuestions: document.getElementById('stat-questions'),
  topicsList: document.getElementById('topics-list'),
  
  // Quiz
  quizTopicTitle: document.getElementById('current-topic-title'),
  quizTimer: document.getElementById('quiz-timer'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressText: document.getElementById('progress-text'),
  progressTextBg: document.getElementById('progress-text-bg'),
  questionText: document.getElementById('question-text'),
  optionsContainer: document.getElementById('options-container'),
  explanationContainer: document.getElementById('explanation-container'),
  explanationText: document.getElementById('explanation-text'),
  examSource: document.getElementById('exam-source'),
  nextBtn: document.getElementById('next-question-btn'),
  
  // Result
  resultTopic: document.getElementById('result-topic'),
  finalPercentage: document.getElementById('final-percentage'),
  finalTime: document.getElementById('final-time'),
  finalCorrect: document.getElementById('final-correct'),
  finalScoreTotal: document.getElementById('final-score-total'),
  reviewList: document.getElementById('review-list'),
  scoreRingPath: document.getElementById('score-ring-path'),

  timerInterval: null,

  // Methods
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active-screen');
      screen.classList.add('hidden');
    });
    
    const target = this.screens[screenName];
    target.classList.remove('hidden');
    setTimeout(() => { target.classList.add('active-screen'); }, 10);
  },

  showError(message) {
    this.errorMsg.textContent = message;
    this.showScreen('error');
  },

  renderDashboard(meta, topics) {
    this.appSource.textContent = "Data: " + meta.source;
    this.statTopics.textContent = meta.total_topics;
    this.statQuestions.textContent = meta.total_questions;
    
    this.topicsList.innerHTML = '';
    topics.forEach(topic => {
      const card = document.createElement('div');
      card.className = 'topic-card text-white group';
      card.dataset.topic = topic;
      card.innerHTML = `
        <span class="topic-title text-lg font-semibold truncate pr-4">${topic}</span>
        <div class="w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white transition-all text-slate-400 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      `;
      this.topicsList.appendChild(card);
    });
  },

  startTimer() {
    this.stopTimer();
    let startTime = Date.now();
    this.quizTimer.textContent = "00:00";
    
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalSeconds = Math.floor(elapsed / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      this.quizTimer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  },

  renderQuestion(topicName, currentIdx, total, question) {
    this.quizTopicTitle.textContent = topicName;
    this.progressText.textContent = `${currentIdx + 1} / ${total}`;
    this.progressTextBg.textContent = (currentIdx + 1).toString().padStart(2, '0');
    
    const percent = ((currentIdx + 1) / total) * 100;
    this.progressBarFill.style.width = `${percent}%`;

    this.questionText.textContent = question.question;
    this.optionsContainer.innerHTML = '';
    
    this.optionsContainer.classList.remove('options-locked');
    this.explanationContainer.classList.add('hidden');
    this.nextBtn.classList.add('hidden');
    this.nextBtn.disabled = true;

    question.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.option = opt;
      
      btn.innerHTML = `
        <span class="option-text font-sans text-[1.05rem] pr-2">${opt}</span>
        <div class="option-status-icon shadow-inner flex-shrink-0"></div>
      `;
      this.optionsContainer.appendChild(btn);
    });
  },

  highlightOptions(selectedOptionText, isCorrect, correctAnswerPart) {
    this.optionsContainer.classList.add('options-locked');
    
    const btns = this.optionsContainer.querySelectorAll('.option-btn');
    
    const correctIconHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    const wrongIconHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    btns.forEach(btn => {
      const optText = btn.dataset.option;
      const iconContainer = btn.querySelector('.option-status-icon');
      
      if (optText === selectedOptionText) {
        btn.classList.add('selected');
        if (isCorrect) {
           btn.classList.add('correct');
           iconContainer.innerHTML = correctIconHTML;
        } else {
           btn.classList.add('incorrect');
           iconContainer.innerHTML = wrongIconHTML;
        }
      }
      
      if (!isCorrect && (optText.trim() === correctAnswerPart.trim() || optText.includes(correctAnswerPart.trim()))) {
        btn.classList.add('correct');
        iconContainer.innerHTML = correctIconHTML;
      }
    });

    this.nextBtn.disabled = false;
    this.nextBtn.classList.remove('hidden');
  },

  showExplanation(explanation, source) {
    this.explanationText.textContent = explanation;
    this.examSource.textContent = source || "General Knowledge";
    this.explanationContainer.classList.remove('hidden');
  },

  renderResult(scoreInfo) {
    this.resultTopic.textContent = scoreInfo.topic;
    this.finalPercentage.innerHTML = `${scoreInfo.percentage}<span class="text-2xl font-bold text-slate-400 opacity-80">%</span>`;
    this.finalTime.textContent = scoreInfo.timeString;
    this.finalCorrect.textContent = scoreInfo.score;
    this.finalScoreTotal.textContent = scoreInfo.total;
    
    // Animate Score Ring
    setTimeout(() => {
        this.scoreRingPath.style.strokeDasharray = `${scoreInfo.percentage}, 100`;
        if (scoreInfo.percentage >= 80) {
            this.scoreRingPath.classList.remove('text-indigo-500');
            this.scoreRingPath.classList.add('text-emerald-400');
        } else if (scoreInfo.percentage < 50) {
           this.scoreRingPath.classList.remove('text-indigo-500');
           this.scoreRingPath.classList.add('text-rose-500');
        } else {
            this.scoreRingPath.className = 'text-indigo-500 stroke-current transition-all duration-[1500ms] ease-out';
        }
    }, 100);

    // Build Review List
    this.reviewList.innerHTML = '';
    scoreInfo.history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex flex-col gap-3';
        
        const isCorrectHTML = item.isCorrect 
            ? `<div class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-space text-[10px] uppercase font-bold tracking-wider">Pass</div>`
            : `<div class="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-space text-[10px] uppercase font-bold tracking-wider">Fail</div>`;

        div.innerHTML = `
            <div class="flex items-start justify-between gap-3">
               <div class="text-slate-200 text-[15px] font-semibold leading-relaxed">Q${index+1}. ${item.questionText}</div>
               <div class="mt-1">${isCorrectHTML}</div>
            </div>
            <div class="flex flex-col gap-1.5 text-[13px] bg-slate-900/60 p-3 rounded-xl border border-white/5 mt-1 shadow-inner">
               <div class="flex items-baseline gap-2">
                 <span class="text-[10px] text-slate-500 font-space uppercase tracking-widest font-bold">Select:</span>
                 <span class="${item.isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-semibold break-words">${item.userSelected}</span>
               </div>
               ${!item.isCorrect ? `
               <div class="flex items-baseline gap-2">
                 <span class="text-[10px] text-slate-500 font-space uppercase tracking-widest font-bold">Actual:</span>
                 <span class="text-emerald-400 font-semibold break-words">${item.correctAnswer}</span>
               </div>` : ''}
            </div>
        `;
        this.reviewList.appendChild(div);
    });

    if (scoreInfo.percentage >= 60) {
        this.fireConfetti();
    }
  },

  fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#6366f1', '#34d399', '#f472b6', '#a78bfa', '#fbbf24'];

    for(let i=0; i<80; i++) {
        pieces.push({
            x: canvas.width / 2,
            y: canvas.height / 2 + 100,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 1) * 20 - 5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20
        });
    }

    let act = true;
    setTimeout(() => {act = false}, 3000);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4; // gravity
            p.rotation += p.rotationSpeed;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });
        if(act) requestAnimationFrame(animate);
        else ctx.clearRect(0,0, canvas.width, canvas.height);
    }
    animate();
  }
};
