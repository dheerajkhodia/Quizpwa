import { state } from './state.js';
import { ui } from './ui.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered:', registration.scope);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

// App Initialization
async function initApp() {
  ui.showScreen('loading');
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    if (!data || !data.questions) {
      throw new Error('Invalid Data Structure');
    }

    state.init(data);
    ui.renderDashboard(state.getAppMeta(), state.topics);
    ui.showScreen('dashboard');
    
  } catch (error) {
    console.error('Data Fetch Error:', error);
    ui.showError("Unable to connect. Check your network or offline status.");
  }
}

// Load Question Helper
function loadCurrentQuestion() {
  const currentQ = state.getCurrentQuestion();
  if (currentQ) {
    ui.renderQuestion(state.currentTopic, state.currentQuestionIndex, state.questionsForTopic.length, currentQ);
  } else {
    ui.showError('No questions found for this topic.');
  }
}

// Event Listeners setup
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  document.getElementById('retry-btn').addEventListener('click', initApp);

  // Topic Selection
  ui.topicsList.addEventListener('click', (e) => {
    const card = e.target.closest('.topic-card');
    if (!card) return;
    
    const topicName = card.dataset.topic;
    state.setTopic(topicName);
    loadCurrentQuestion();
    ui.startTimer();
    ui.showScreen('quiz');
  });

  // Options Selection
  ui.optionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn || ui.optionsContainer.classList.contains('options-locked')) return;
    
    const selectedText = btn.dataset.option;
    const { isCorrect, correctAnswer } = state.submitAnswer(selectedText);
    
    ui.highlightOptions(selectedText, isCorrect, correctAnswer);
    
    const currentQ = state.getCurrentQuestion();
    ui.showExplanation(currentQ.explanation, currentQ.exam_source);
  });

  // Next Question Button
  ui.nextBtn.addEventListener('click', () => {
    if (state.isLastQuestion()) {
      ui.stopTimer();
      ui.renderResult(state.getScoreInfo());
      ui.showScreen('result');
    } else {
      state.nextQuestion();
      loadCurrentQuestion();
    }
  });

  // Back to Dashboard
  document.getElementById('back-to-dash-btn').addEventListener('click', () => {
    if (confirm('Leave this session? Progress will be lost.')) {
      ui.stopTimer();
      ui.showScreen('dashboard');
    }
  });

  // Retake Topic
  document.getElementById('retake-btn').addEventListener('click', () => {
    state.setTopic(state.currentTopic);
    loadCurrentQuestion();
    ui.startTimer();
    ui.showScreen('quiz');
  });

  // Return Dashboard from Results
  document.getElementById('dashboard-return-btn').addEventListener('click', () => {
    ui.showScreen('dashboard');
  });

  // Share Score natively (Web Share API)
  document.getElementById('share-score-btn').addEventListener('click', async () => {
    const scoreInfo = state.getScoreInfo();
    const shareText = `I scored ${scoreInfo.percentage}% (${scoreInfo.score}/${scoreInfo.total}) in Rajasthan GK - ${scoreInfo.topic} module, taking ${scoreInfo.timeString}! Can you beat me?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rajasthan GK Quiz Pro Result',
          text: shareText,
          url: window.location.href, // Optional, shares current PWA URL if hosted
        });
      } catch (err) {
        console.log('User cancelled share or API error', err);
      }
    } else {
      // Fallback copying to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      } catch (err) {
        alert('Sharing is not supported on this browser.');
      }
    }
  });
});
