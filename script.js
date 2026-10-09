const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    mainNav.classList.remove('is-open');
  }
});

const pyramidLevels = {
  1: {
    kicker: 'NÍVEL 01 · CHÃO DE FÁBRICA',
    title: 'Onde tudo acontece.',
    description: 'Sensores captam presença e posição; atuadores pneumáticos transformam comandos em movimento. É a camada física que nossa bancada demonstra.'
  },
  2: {
    kicker: 'NÍVEL 02 · NOSSO PROJETO',
    title: 'O chão de fábrica.',
    description: 'Sensores identificam as peças e o CLP processa os sinais. A IHM permite acompanhar o ciclo, enquanto válvulas e atuadores executam os movimentos.'
  },
  3: {
    kicker: 'NÍVEL 03 · SUPERVISÃO',
    title: 'Visão do processo.',
    description: 'Sistemas SCADA reúnem dados das células, exibem estados do processo e apoiam a supervisão da operação industrial.'
  },
  4: {
    kicker: 'NÍVEL 04 · GERENCIAMENTO',
    title: 'A produção conectada.',
    description: 'Soluções MES acompanham a execução da produção e conectam o chão de fábrica às metas e aos indicadores operacionais.'
  },
  5: {
    kicker: 'NÍVEL 05 · PLANEJAMENTO',
    title: 'A visão do negócio.',
    description: 'Sistemas ERP apoiam o planejamento de recursos, materiais e ordens de produção em escala empresarial.'
  }
};

document.querySelectorAll('.pyramid-level').forEach((button) => {
  button.addEventListener('click', () => {
    const level = pyramidLevels[button.dataset.level];
    document.querySelectorAll('.pyramid-level').forEach((item) => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    document.querySelector('#level-kicker').textContent = level.kicker;
    document.querySelector('#level-title').textContent = level.title;
    document.querySelector('#level-description').textContent = level.description;
  });
});

const specDetails = {
  axes: {
    title: 'Eixos de movimentação',
    copy: 'O módulo contempla movimentos lineares nos eixos X, Y e Z, além de giro e pega. Confirme o número de eixos efetivamente montados e o curso de cada atuador com a equipe.'
  },
  valves: {
    title: 'Válvulas eletropneumáticas',
    copy: 'As válvulas direcionais recebem sinais elétricos do controle e comutam o fluxo de ar para os atuadores. Registre o modelo, a tensão de bobina e a configuração conforme a etiqueta do manifold instalado.'
  },
  pressure: {
    title: 'Pressão de trabalho',
    copy: 'A pressão de operação ainda precisa ser confirmada na regulagem da unidade FRL e na especificação dos componentes. Não use um valor genérico como ajuste: respeite os limites do fabricante.'
  }
};

const specDialog = document.querySelector('#spec-dialog');
document.querySelectorAll('[data-spec]').forEach((button) => {
  button.addEventListener('click', () => {
    const spec = specDetails[button.dataset.spec];
    document.querySelector('#dialog-title').textContent = spec.title;
    document.querySelector('#dialog-copy').textContent = spec.copy;
    specDialog.showModal();
  });
});

specDialog.querySelector('.dialog-close').addEventListener('click', () => specDialog.close());
specDialog.addEventListener('click', (event) => {
  if (event.target === specDialog) specDialog.close();
});

const tabs = [...document.querySelectorAll('.driver-tab')];
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
    activateTab(nextTab);
    nextTab.focus();
  });
});

function activateTab(selectedTab) {
  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-selected', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = !isSelected;
  });
}

const cycleStart = document.querySelector('#cycle-start');
const cyclePause = document.querySelector('#cycle-pause');
const cycleEmergency = document.querySelector('#cycle-emergency');
const cycleReset = document.querySelector('#cycle-reset');
const hmiShell = document.querySelector('.hmi-shell');
const pieceCount = document.querySelector('#piece-count');
let cycleTimer = null;
let processedPieces = 0;
let isFaulted = false;

function setMachineState({ running = false, fault = false } = {}) {
  const runningState = document.querySelector('#state-running');
  const faultState = document.querySelector('#state-fault');
  const waitingState = document.querySelector('#state-waiting');
  runningState.classList.toggle('is-active', running);
  runningState.querySelector('.state-value').textContent = running ? 'ATIVO' : 'INATIVO';
  faultState.classList.toggle('is-fault', fault);
  faultState.querySelector('.state-value').textContent = fault ? 'FALHA' : 'NORMAL';
  waitingState.classList.toggle('is-active', !running && !fault);
  waitingState.querySelector('.state-value').textContent = !running && !fault ? 'ATIVO' : 'INATIVO';
  hmiShell.classList.toggle('is-running', running);
}

function stopCycle() {
  window.clearInterval(cycleTimer);
  cycleTimer = null;
}

cycleStart.addEventListener('click', () => {
  if (isFaulted || cycleTimer) return;
  cycleStart.disabled = true;
  cyclePause.disabled = false;
  cyclePause.innerHTML = '<span aria-hidden="true">Ⅱ</span> PAUSA';
  setMachineState({ running: true });
  cycleTimer = window.setInterval(() => {
    processedPieces += 1;
    pieceCount.textContent = String(processedPieces).padStart(3, '0');
  }, 2600);
});

cyclePause.addEventListener('click', () => {
  if (!cycleTimer) {
    cycleStart.click();
    return;
  }
  stopCycle();
  cycleStart.disabled = false;
  cyclePause.disabled = true;
  cyclePause.innerHTML = '<span aria-hidden="true">Ⅱ</span> PAUSA';
  setMachineState();
});

cycleEmergency.addEventListener('click', () => {
  stopCycle();
  isFaulted = true;
  cycleStart.disabled = true;
  cyclePause.disabled = true;
  cycleReset.hidden = false;
  setMachineState({ fault: true });
});

cycleReset.addEventListener('click', () => {
  isFaulted = false;
  cycleStart.disabled = false;
  cyclePause.disabled = true;
  cycleReset.hidden = true;
  setMachineState();
});

function updateClock() {
  document.querySelector('#hmi-clock').textContent = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 1000);

const processContent = [
  {
    title: 'Chegada da peça na esteira',
    description: 'A peça entra na célula pela esteira e segue até a área de detecção, onde o processo começa.',
    device: 'ESTEIRA · TRANSPORTE'
  },
  {
    title: 'Identificação e triagem pelos sensores',
    description: 'Sensores detectam a presença ou característica prevista para a peça e enviam o sinal de entrada ao CLP.',
    device: 'SENSORES · AQUISIÇÃO'
  },
  {
    title: 'Manipulação pelo robô pneumático',
    description: 'Após a liberação da lógica de controle, os atuadores posicionam e transferem a peça até a etapa seguinte.',
    device: 'CLP · VÁLVULAS · ATUADORES'
  },
  {
    title: 'Registro e validação na IHM',
    description: 'O operador acompanha o estado do ciclo e valida a etapa na interface homem-máquina.',
    device: 'IHM · OPERAÇÃO'
  },
  {
    title: 'Despacho para a caixa de expedição',
    description: 'Com a sequência concluída, a peça segue para a caixa de destino e encerra o fluxo de expedição.',
    device: 'SAÍDA · EXPEDIÇÃO'
  }
];

const processDetail = document.querySelector('#process-detail');
const processTabs = [...document.querySelectorAll('.process-step')];
processTabs.forEach((button, index) => {
  button.addEventListener('click', () => {
    const stepIndex = Number(button.dataset.step);
    const step = processContent[stepIndex];
    document.querySelectorAll('.process-step').forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });
    processDetail.className = `process-detail step-${stepIndex}`;
    processDetail.setAttribute('aria-labelledby', button.id);
    document.querySelector('#process-index').textContent = `ETAPA ${String(stepIndex + 1).padStart(2, '0')} / 05`;
    document.querySelector('#process-heading').textContent = step.title;
    document.querySelector('#process-description').textContent = step.description;
    document.querySelector('#process-device').textContent = step.device;
  });
  button.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % processTabs.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + processTabs.length) % processTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = processTabs.length - 1;
    processTabs[nextIndex].focus();
    processTabs[nextIndex].click();
  });
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const navLinks = [...mainNav.querySelectorAll('a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.hash === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
        link.classList.toggle('is-current', isCurrent);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => navObserver.observe(section));
}