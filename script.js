//read the html fragment and use this as the suffix for questions-.txt
const url = new URL(window.location.href);
let fragment = url.hash.substring(1);

//default to actions if no fragment is provided
if (fragment === '') {
    fragment = 'GitHub Actions';
}

//set the topic
const topic = document.getElementById('topic');
topic.textContent = fragment;

const questionsFile = `questions-${fragment.replace(' ', '-')}.txt`;

const flashcardContainer = document.getElementById('flashcard-container');

// Read questions from a file using JavaScript
fetch(questionsFile)
    .then(response => {
        if (!response.ok) {
            flashcardContainer.innerText = `Could not find file: ${questionsFile}`;
            return;
        }
        return response.text();
    })
    .then(data => {
        const lines = data.split('\n');

        // update the score
        const total = document.getElementById('total');

        // update the total to be the number of questions
        total.textContent = lines.length;

        // Create flashcards for each question
        lines.forEach(line => {
            const parts = line.split(',');
            const question = parts[0];
            const answers = parts.slice(1);
            const correctAnswer = answers[0]; // Assume first answer is correct

            // Shuffle the answers
            shuffleArray(answers);

            //add a question-container div
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container');
            flashcardContainer.appendChild(questionContainer);

            // Create a flashcard for the question
            const questionCard = document.createElement('h2');
            questionCard.classList.add('question');
            questionCard.textContent = question;
            questionContainer.appendChild(questionCard);

            // Create a container for the answer cards
            const answerContainer = document.createElement('div');
            answerContainer.classList.add('answer-container');
            questionContainer.appendChild(answerContainer);

            // Create a flashcard for each answer
            answers.forEach(answer => {
                const answerCard = document.createElement('div');
                answerCard.classList.add('flashcard', 'answer');
                answerCard.textContent = answer;
                answerContainer.appendChild(answerCard);

                // Add click event listener to answer card
                answerCard.addEventListener('click', function() {
                    // Reset the background color of all answer cards for this question
                    const allAnswerCards = answerContainer.querySelectorAll('.answer');
                    allAnswerCards.forEach(card => {
                        card.style.backgroundColor = '';
                    });

                    setTimeout(() => {
                        // Assuming each question is in a container with class 'question-container'
                        const nextQuestion = answerCard.closest('.question-container').nextElementSibling;
                        if (nextQuestion) {
                            const header = document.querySelector('header');
                            let headerHeight = 0;
                            const headerStyle = getComputedStyle(header);
                            if (headerStyle.position === 'fixed') {
                                headerHeight = header.offsetHeight;
                            }
                            const scrollPosition = nextQuestion.offsetTop - headerHeight;
                            window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
                        }
                    }, 2000); // 2000 milliseconds = 2 seconds

                    // Set the background color of the clicked answer card
                    if (answer === correctAnswer) {
                        answerCard.classList.add('correct-answer');
                    } else {
                        answerCard.classList.add('incorrect-answer');
                    }


                    // Update all other answer cards to default color
                    allAnswerCards.forEach(card => {
                        if (card !== answerCard) {
                            card.style.backgroundColor = '';
                            // remove correct-answer class from element
                            card.classList.remove('correct-answer');
                            card.classList.remove('incorrect-answer');
                        }
                    });

                    recalculateScore();
                });
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

function recalculateScore() {
    const answerCards = document.querySelectorAll('.answer');
    let correctCount = 0;

    // count the number of cards with the correct-answer class
    answerCards.forEach(card => {
        if (card.classList.contains('correct-answer')) {
            correctCount++;
        }
    });

    const score = document.getElementById('score');
    score.textContent = correctCount;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

window.addEventListener('hashchange', function() {
    // reload the url
    location.reload();
});