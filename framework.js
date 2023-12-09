const propsToEffects = {};
const dirtyEffects = [];

let queued = false;
let currentEffect;

const state = new Proxy(
  {},
  {
    get(obj, prop) {
      onGet(prop);
      return obj[prop];
    },
    set(obj, prop, value) {
      obj[prop] = value;
      onSet(prop, value);
      return true;
    },
  },
);

function onGet(prop) {
  if (currentEffect) {
    const effects = propsToEffects[prop] ?? (propsToEffects[prop] = []);
    effects.push(currentEffect);
  }
}

function flush() {
  while (dirtyEffects.length) {
    dirtyEffects.shift()();
  }
}

function onSet(prop, value) {
  if (propsToEffects[prop]) {
    dirtyEffects.push(...propsToEffects[prop]);
    if (!queued) {
      queued = true;
      queueMicrotask(() => {
        queued = false;
        flush();
      });
    }
  }
}

function createEffect(effect) {
  currentEffect = effect;
  effect();
  currentEffect = undefined;
}

const tokensToTemplate = new WeakMap();

function parseTemplate(htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString;
  return template;
}

function html(tokens, ...expressions) {
  const replaceStubs = (string) =>
    string.replaceAll(/__stub-(\d+)__/g, (_, i) => expressions[i]);

  let template = tokensToTemplate.get(tokens);
  if (!template) {
    const stubs = expressions.map((_, i) => `__stub-${i}__`);
    const allTokens = tokens.map((token, i) => (stubs[i - 1] ?? '') + token);
    const htmlString = allTokens.join('');
    template = parseTemplate(htmlString);
    tokensToTemplate.set(tokens, template);
  }

  const cloned = template.content.cloneNode(true);
  const element = cloned.firstElementChild;
  for (const { name, value } of element.attributes) {
    element.setAttribute(name, replaceStubs(value));
  }
  element.textContent = replaceStubs(element.textContent);
  return element;
}
