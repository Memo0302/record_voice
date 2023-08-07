let recognition;
let finalTranscript = '';
const textInput = document.getElementById('textInput');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resultDiv = document.getElementById('result');
const saveForm = document.getElementById('saveForm');

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
saveForm.addEventListener('submit', saveText);

function startRecording() {
  finalTranscript = '';
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Display interim and final results
    resultDiv.innerHTML = `<p>${interimTranscript}</p>`;
    resultDiv.innerHTML += `<p><strong>${finalTranscript}</strong></p>`;

    // Set the converted text in the hidden input field
    textInput.value = finalTranscript;
  };

  recognition.onstart = () => {
    startButton.disabled = true;
    stopButton.disabled = false;
    startButton.textContent = 'Recording...';
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopRecording();
  };

  recognition.onend = () => {
    startButton.disabled = false;
    stopButton.disabled = true;
    startButton.textContent = 'Start Recording';
  };

  recognition.start();
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

function saveText(event) {
  event.preventDefault();
  const text = textInput.value.trim();

  if (text === '') {
    alert('Please enter some text to save.');
    return;
  }

  // Send the text to the PHP script
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'save.php', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('Text saved successfully');
        alert('Text saved successfully.');
        clearResult();
      } else {
        console.error('Failed to save the text.');
      }
    }
  };

  xhr.send('text=' + encodeURIComponent(text));
}

function clearResult() {
  resultDiv.innerHTML = '';
  textInput.value = '';
}