state.a = 1;
state.b = 2;
state.color = 'blue';

function render(state) {
  return html`
    <p style="color: ${state.color}">${state.a} + ${state.b} = ${state.sum}</p>
  `;
}

const container = document.querySelector('.result');

createEffect(() => {
  const dom = render(state);
  if (container.firstElementChild) {
    container.firstElementChild.replaceWith(dom);
  } else {
    container.appendChild(dom);
  }
});

createEffect(() => {
  state.sum = state.a + state.b;
});

document.querySelector('.buttonA').addEventListener('click', () => {
  state.a++;
});

document.querySelector('.buttonB').addEventListener('click', () => {
  state.b++;
});

document.querySelector('.color').addEventListener('input', (e) => {
  state.color = e.target.value;
});
