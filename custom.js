// custom.js
import { qizes } from './data.js';

window.startQuiz = startQuiz;
window.submitQuiz = submitQuiz;
window.resetQuiz = resetQuiz;

let allSelectedQuestions = [];
let timer;
let timerInterval;

function startQuiz() {
  const selectorArea = document.getElementById('selectorArea');
  const selectedTopics = Array.from(document.querySelectorAll('input[name="topic"]:checked')).map(i => i.value);
  const totalQuestion = parseInt(document.querySelector('input[name="qnum"]:checked')?.value || 0);
  const useTimer = document.getElementById('enableTimer').checked;
  const form = document.getElementById('quizForm');
  const scoreDiv = document.getElementById('scoreResult');
  form.innerHTML = '';
  scoreDiv.innerHTML = '';
  allSelectedQuestions = [];

  if (selectedTopics.length === 0 || totalQuestion === 0) {
    form.innerHTML = '<p style="color:red;text-align: center;">Please select topic(s) and question number.</p>';
    return;
  }

  const perTopic = Math.floor(totalQuestion / selectedTopics.length);
  let remainder = totalQuestion % selectedTopics.length;

  selectedTopics.forEach(topic => {
    let questions = shuffleArray(qizes[topic]);
    allSelectedQuestions = allSelectedQuestions.concat(questions.slice(0, perTopic));
  });

  if (remainder > 0) {
    let extraPool = selectedTopics.flatMap(topic => qizes[topic]);
    let remaining = shuffleArray(extraPool).filter(q => !allSelectedQuestions.includes(q)).slice(0, remainder);
    allSelectedQuestions = allSelectedQuestions.concat(remaining);
  }

  allSelectedQuestions.forEach((q, i) => {
    const [question, op1, op2, op3, op4] = q;
    form.innerHTML += `
      <div>
        <p><strong>Q${i + 1}:</strong> ${question}</p>
        <label><input type='radio' name='q${i}' value='${op1}'> <span id='opt${i}0'>${op1}</span></label>
        <label><input type='radio' name='q${i}' value='${op2}'> <span id='opt${i}1'>${op2}</span></label>
        <label><input type='radio' name='q${i}' value='${op3}'> <span id='opt${i}2'>${op3}</span></label>
        <label><input type='radio' name='q${i}' value='${op4}'> <span id='opt${i}3'>${op4}</span></label>
      </div>
    `;
  });

  form.innerHTML += `
    <p id="button_box">
      <button type="button" onclick="submitQuiz()">Submit</button>
      <button type="button" onclick="resetQuiz()">Start Again</button>
    </p>
  `;

  selectorArea.style.display = 'none';

  if (useTimer) {
    timer = totalQuestion * 1;
    document.getElementById('timerDisplay').textContent = `Time Left: ${timer} sec`;
    timerInterval = setInterval(() => {
      timer--;
      document.getElementById('timerDisplay').textContent = `Time Left: ${timer} sec`;
      if (timer <= 0) {
        clearInterval(timerInterval);
        alert("Time's up! Answers are now being checked.");
        submitQuiz(true); // force submit
      }
    }, 1000);
  } else {
    document.getElementById('timerDisplay').textContent = '';
  }
}

function submitQuiz(forceSubmit = false) {
  clearInterval(timerInterval);
  const unansweredIndex = allSelectedQuestions.findIndex((q, i) => !document.querySelector(`input[name="q${i}"]:checked`));
  if (unansweredIndex !== -1 && !forceSubmit) {
    alert('Answer all the questions.');
    return;
  }

  let score = 0;
  let unansweredCount = 0;

  const allRadios = document.querySelectorAll('#quizForm input[type="radio"]');
  allRadios.forEach(r => r.disabled = true);

  allSelectedQuestions.forEach((q, i) => {
    const correct = q[5];
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const options = [q[1], q[2], q[3], q[4]];

    if (!selected) {
      unansweredCount++;
    }

    options.forEach((opt, idx) => {
      const span = document.getElementById(`opt${i}${idx}`);
      if (opt === correct) {
        span.style.color = 'green';
      }
      if (selected && selected.value === opt && opt !== correct) {
        span.style.color = 'red';
      }
      if (!selected) {
        let sabbir=span.parentElement;
        sabbir.parentElement.style.background = '#0081ff';
        
      }
      
      span.style.padding = '2px 5px';
    });

    if (selected && selected.value === correct) score++;
  });

  const total = allSelectedQuestions.length;
  const percentage = (score / total) * 100;
  let message = '';

  if (percentage >= 90) message = "Congratulations! You did an amazing job! Keep believing in yourself and never stop trying. Your hard work and dedication truly paid off!";
  else if (percentage >= 70) message = "Well done! With more effort, you'll improve even more! Keep moving forward and don’t give up. Every small step brings you closer to success!";
  else if (percentage >= 50) message = "Keep up the effort! You can do even better! Stay focused and keep pushing your limits. Success comes to those who never quit!";
  else message = "Don’t lose your enthusiasm! Try again, you can do it! Every failure is a step closer to success. Believe in yourself and keep moving forward!";

  document.querySelector("body").style.overflow = "hidden";
  document.querySelector(".overlay").style.display = "block";
  document.getElementById('scoreResult').style.display = 'block';
  document.getElementById('scoreResult').innerHTML = `
    <h2>Your Score: ${score} out of ${total}</h2>
    <p>${message}</p>
    <p style="color:#f00; margin:3rem">${unansweredCount} question was not answered</p>
    <i class="fa fa-times"></i>
  `;

  document.querySelector('.fa').onclick = function () {
    document.querySelector("#scoreResult").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
    document.querySelector("body").style.overflow = "auto";
  };
}

function resetQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quizForm').innerHTML = '';
  document.getElementById('scoreResult').innerHTML = '';
  document.getElementById('timerDisplay').textContent = '';
  document.getElementById('selectorArea').style.display = 'block';
  allSelectedQuestions = [];
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}