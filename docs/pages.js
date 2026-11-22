import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const form = document.querySelector('#form');
const fileInput = document.querySelector('#file');
const dropzone = document.querySelector('#dropzone');
const error = document.querySelector('#error');
const selected = document.querySelector('#selected');
const status = document.querySelector('#status');
const submit = document.querySelector('#submit');
const result = document.querySelector('#result');
let file = null;

function choose(candidate) {
  error.textContent = '';
  result.hidden = true;
  file = null;
  if (!candidate) return;
  if (candidate.type !== 'application/pdf') error.textContent = 'Please choose a PDF file.';
  else if (candidate.size === 0) error.textContent = 'This PDF is empty.';
  else if (candidate.size > 5 * 1024 * 1024) error.textContent = 'The PDF must be 5 MB or smaller.';
  else file = candidate;
  selected.textContent = file ? `Selected: ${file.name}` : '';
}

fileInput.addEventListener('change', () => choose(fileInput.files?.[0]));
dropzone.addEventListener('dragover', (event) => { event.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', (event) => { event.preventDefault(); dropzone.classList.remove('drag'); choose(event.dataTransfer.files?.[0]); });

function card(title, body) {
  const article = document.createElement('article');
  article.className = 'card';
  const heading = document.createElement('h3');
  heading.textContent = title;
  article.append(heading, body);
  return article;
}

function paragraph(text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function list(items) {
  const ul = document.createElement('ul');
  for (const item of items) { const li = document.createElement('li'); li.textContent = item; ul.append(li); }
  return ul;
}

function feedback(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const metrics = /\b\d+(?:[.,]\d+)?\s*%|\b\d+\s*(?:users|customers|clients|projects|people|hours|days)\b/i.test(text);
  const sections = /\b(experience|education|skills|projects)\b/i.test(text);
  const verbs = /\b(led|built|created|improved|launched|developed|managed|designed)\b/i.test(text);
  const score = Math.min(85, Math.max(35, 52 + (metrics ? 14 : 0) + (sections ? 9 : 0) + (verbs ? 10 : 0) - (words.length < 180 ? 8 : 0)));
  const intro = document.createElement('div');
  intro.className = 'card';
  const label = paragraph('QUICK LOCAL FEEDBACK');
  label.className = 'eyebrow';
  const number = document.createElement('div');
  number.className = 'score';
  number.textContent = `${score}/100`;
  intro.append(label, number, paragraph(metrics ? 'Your resume has some real evidence behind it. Now make every bullet as specific as the strongest one.' : 'Your resume has potential, but the impact is playing hide and seek. Add numbers and outcomes so a recruiter can see what changed because of your work.'));
  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.append(
    card(`Impact · ${metrics ? 8 : 4}/10`, paragraph('For each major role, add one measurable result: time saved, revenue gained, users helped, or a before-and-after comparison.')),
    card(`Clarity · ${verbs ? 7 : 5}/10`, paragraph('Start bullets with a specific action verb, then state what you did and why it mattered.')),
    card(`Structure · ${sections ? 8 : 5}/10`, paragraph('Use clear Experience, Education, Skills, and Projects headings where relevant. Put your strongest evidence first.')),
    card('Strengths', list([sections ? 'Recognizable resume sections' : 'A starting point to organize your experience', verbs ? 'Some action-oriented wording' : 'Experience to build stronger bullets around'])),
    card('Things to improve', list([metrics ? 'Not every claim is backed by a result' : 'Too few measurable outcomes', words.length < 180 ? 'The resume may be too brief to show your impact' : 'Some bullets may be more concise'])),
    card('Next steps', list(['Rewrite your top three bullets as action + measurable result.', 'Move the most relevant achievement into the first half of the page.', 'Read each bullet aloud and cut filler words.']))
  );
  result.replaceChildren(intro, grid);
  result.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!file) { error.textContent = 'Choose a PDF resume first.'; return; }
  submit.disabled = true;
  error.textContent = '';
  status.textContent = 'Reading your resume…';
  try {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const parts = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      parts.push(content.items.map((item) => 'str' in item ? item.str : '').join(' '));
    }
    await pdf.destroy();
    const text = parts.join(' ').trim();
    if (text.length < 80) throw new Error('This PDF has too little selectable text. Please use a text-based PDF rather than a scan or image.');
    feedback(text);
    status.textContent = 'Feedback is ready below.';
  } catch (cause) {
    error.textContent = cause instanceof Error && cause.message.startsWith('This PDF') ? cause.message : 'We could not read this PDF. Please try another text-based PDF.';
    status.textContent = '';
  } finally {
    submit.disabled = false;
  }
});
