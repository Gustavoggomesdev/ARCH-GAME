export const DEFAULT_CHARACTER = 'trabalhador';
export const CHARACTER_ORDER = ['trabalhador', 'cadeirante', 'def_visual', 'mae_solo'];

export const CHARACTER_PROFILES = {
  trabalhador: {
    id: 'trabalhador',
    fixedName: 'Mateus',
    label: 'Trabalhador(a)',
    icon: '💼',
    intro: 'Acorda cedo e cruza a cidade para manter a rotina de trabalho.',
    difficulty: { startEnergy: 100, totalDist: 500, socialBonus: 0, scoreMultiplier: 1 },
  },
  cadeirante: {
    id: 'cadeirante',
    fixedName: 'Bianca',
    label: 'Pessoa cadeirante',
    icon: '♿',
    intro: 'Cada quarteirao exige planejamento por causa das barreiras urbanas.',
    difficulty: { startEnergy: 92, totalDist: 540, socialBonus: 2, scoreMultiplier: 1.05 },
  },
  def_visual: {
    id: 'def_visual',
    fixedName: 'Rafael',
    label: 'Pessoa com deficiencia visual',
    icon: '🦯',
    intro: 'A cidade sonora ajuda, mas a falta de acessibilidade pesa no caminho.',
    difficulty: { startEnergy: 94, totalDist: 535, socialBonus: 2, scoreMultiplier: 1.06 },
  },
  mae_solo: {
    id: 'mae_solo',
    fixedName: 'Camila',
    label: 'Mae solo',
    icon: '👩‍👦',
    intro: 'Entre cuidado e trabalho, cada minuto da manha faz diferenca.',
    difficulty: { startEnergy: 90, totalDist: 545, socialBonus: 3, scoreMultiplier: 1.08 },
  },
};

const COMMON_EVENTS = [
  {
    id: 'onibus_lotado',
    icon: '🚌',
    title: 'ONIBUS LOTADO',
    desc: 'O onibus chega cheio e voce precisa decidir rapido.',
    dilema: 'Dilema: priorizar o agora ou buscar uma solucao coletiva?',
    duration: 25000,
    choices: [
      { text: 'Entrar mesmo lotado', energy: -12, social: -8, time: 0, score: 5, rideBus: true, msg: 'Voce chegou, mas o desgaste aumentou.', tension: 'Urgencia pessoal vira pressao para todos.' },
      { text: 'Esperar o proximo', energy: -6, social: 8, time: 12, score: 10, msg: 'Atrasou, mas evitou piorar a lotacao.', tension: 'Escolhas eticas nem sempre sao praticas.' },
      { text: 'Registrar reclamacao da linha', energy: -4, social: 12, time: 8, score: 12, msg: 'Voce atrasou pouco e deixou registro oficial.', tension: 'Participacao cidada custa tempo, mas cria mudanca.' },
    ],
    fact: 'Sem aumento de frota, a superlotacao vira rotina.',
  },
  {
    id: 'chuva_alagamento',
    icon: '🌧️',
    title: 'ALAGAMENTO NO CAMINHO',
    desc: 'Choveu forte e uma avenida inteira esta alagada.',
    dilema: 'Dilema: improvisar agora ou cobrar prevencao estrutural?',
    duration: 25000,
    choices: [
      { text: 'Desviar por rota longa', energy: -10, social: 6, time: 15, score: 8, msg: 'Voce evitou risco, mas perdeu tempo.', tension: 'Seguranca e tempo quase nunca andam juntos.' },
      { text: 'Ajudar quem esta preso no trecho', energy: -14, social: 16, time: 12, score: 14, msg: 'Voce atrasou, mas fez diferenca para outros.', tension: 'Solidariedade local resolve o agora, nao a causa.' },
      { text: 'Cobrar drenagem no canal da prefeitura', energy: -5, social: 14, time: 7, score: 13, msg: 'Voce perdeu menos tempo e abriu protocolo.', tension: 'Prevencao exige investimento, mas evita crises recorrentes.' },
    ],
    fact: 'Drenagem insuficiente amplia alagamentos em bairros perifericos.',
  },
  {
    id: 'obra_surpresa',
    icon: '🚧',
    title: 'OBRA SURPRESA',
    desc: 'Uma obra fechou sua rota sem aviso claro.',
    dilema: 'Dilema: acelerar sem dialogo ou planejar melhor a cidade?',
    duration: 25000,
    choices: [
      { text: 'Seguir pelo fluxo improvisado', energy: -9, social: -3, time: 10, score: 5, msg: 'Voce passou, mas em caos e risco.', tension: 'Improviso cobra caro de quem depende da via.' },
      { text: 'Buscar rota oficial sinalizada', energy: -6, social: 8, time: 9, score: 10, msg: 'Voce chegou com menos estresse.', tension: 'Informacao clara reduz dano coletivo.' },
      { text: 'Reportar falta de sinalizacao', energy: -4, social: 12, time: 6, score: 12, msg: 'Voce registrou a falha e seguiu.', tension: 'Transparencia e parte da mobilidade.' },
    ],
    fact: 'Sinalizacao deficiente em obras eleva atraso e risco de acidente.',
  },
  {
    id: 'tarifa_alta',
    icon: '💸',
    title: 'PASSAGEM MAIS CARA',
    desc: 'A tarifa subiu e o orcamento da semana apertou.',
    dilema: 'Dilema: pagar agora ou pressionar por modelo mais justo?',
    duration: 25000,
    choices: [
      { text: 'Pagar e seguir', energy: -4, social: -5, time: 2, score: 4, msg: 'Voce manteve o trajeto, mas sobrou menos dinheiro.', tension: 'Custos de mobilidade ampliam desigualdade.' },
      { text: 'Integrar parte do trajeto a pe', energy: -11, social: 2, time: 8, score: 7, msg: 'Economizou dinheiro e gastou energia.', tension: 'Economia imediata pode virar desgaste cronico.' },
      { text: 'Apoiar pauta por tarifa social', energy: -5, social: 14, time: 7, score: 13, msg: 'Voce nao resolveu hoje, mas fortaleceu a pauta.', tension: 'Mudanca estrutural depende de pressao continua.' },
    ],
    fact: 'Transporte pesa mais no bolso de familias de baixa renda.',
  },
  {
    id: 'calor_extremo',
    icon: '🌡️',
    title: 'ONDA DE CALOR',
    desc: 'O trajeto esta sob calor extremo e falta sombra em varios pontos.',
    dilema: 'Dilema: aguentar o dia ou cobrar adaptacao urbana?',
    duration: 25000,
    choices: [
      { text: 'Forcar o ritmo para chegar logo', energy: -15, social: -2, time: 6, score: 4, msg: 'Chegou mais cedo, mas com exaustao.', tension: 'A pressa cobra do corpo.' },
      { text: 'Parar para hidratar e descansar', energy: -6, social: 6, time: 8, score: 9, msg: 'Voce perdeu minutos e preservou saude.', tension: 'Descanso tambem e estrategia.' },
      { text: 'Cobrar pontos de sombra e agua', energy: -5, social: 13, time: 7, score: 12, msg: 'Voce fez registro e seguiu com mais seguranca.', tension: 'A cidade precisa responder ao clima real.' },
    ],
    fact: 'Ondas de calor afetam mais quem depende de deslocamento diario.',
  },
  {
    id: 'seguranca_noturna',
    icon: '🚶',
    title: 'TRECHO MAL ILUMINADO',
    desc: 'Um trecho escuro no retorno aumenta o medo e a incerteza.',
    dilema: 'Dilema: desviar individualmente ou tratar como tema publico?',
    duration: 25000,
    choices: [
      { text: 'Desviar por rota mais longa', energy: -8, social: 2, time: 10, score: 7, msg: 'Voce se protegeu e atrasou.', tension: 'Solucao individual nao corrige a origem.' },
      { text: 'Seguir em grupo com outros pedestres', energy: -5, social: 8, time: 6, score: 10, msg: 'Voce ganhou seguranca coletiva no momento.', tension: 'Rede local ajuda, mas nao substitui politica publica.' },
      { text: 'Protocolar pedido de iluminacao', energy: -4, social: 15, time: 7, score: 13, msg: 'Voce abriu demanda oficial e seguiu o trajeto.', tension: 'Infraestrutura basica transforma a experiencia urbana.' },
    ],
    fact: 'Iluminacao publica adequada reduz risco e aumenta uso do espaco urbano.',
  },
];

const CHARACTER_EVENTS = {
  trabalhador: [
    {
      id: 'trab_ponto_fechado',
      icon: '💼',
      title: 'PONTO DESATIVADO',
      desc: 'Seu ponto habitual foi desativado sem aviso util.',
      dilema: 'Dilema: aceitar o prejuizo diario ou cobrar ajuste da rota?',
      duration: 25000,
      choices: [
        { text: 'Aceitar o novo percurso', energy: -8, social: -4, time: 10, score: 5, msg: 'Voce seguiu, mas o desgaste cresceu.', tension: 'A rotina absorve o custo da falha.' },
        { text: 'Reclamar com a operadora', energy: -5, social: 10, time: 7, score: 11, msg: 'Houve registro e chance de ajuste.', tension: 'Quem precisa do sistema ainda precisa lutar por ele.' },
        { text: 'Organizar queixa coletiva', energy: -6, social: 15, time: 9, score: 14, msg: 'Mais pessoas apoiaram a demanda.', tension: 'Coletivo aumenta a forca da voz.' },
      ],
      fact: 'Mudancas sem aviso atingem mais quem depende de integracao.',
    },
    {
      id: 'trab_hora_extra',
      icon: '🕘',
      title: 'HORA EXTRA IMPREVISTA',
      desc: 'A chefia pediu hora extra e isso quebra sua volta para casa.',
      dilema: 'Dilema: proteger renda imediata ou preservar seu limite?',
      duration: 25000,
      choices: [
        { text: 'Aceitar a hora extra', energy: -14, social: 1, time: 8, score: 8, msg: 'A renda subiu, o cansaco tambem.', tension: 'Estabilidade de hoje pode custar saude amanha.' },
        { text: 'Negociar meio termo', energy: -7, social: 7, time: 6, score: 11, msg: 'Voce cedeu um pouco e preservou parte da rotina.', tension: 'Negociar tambem e habilidade de sobrevivencia.' },
        { text: 'Recusar e sair no horario', energy: 4, social: -8, time: 3, score: 6, msg: 'Voce ganhou descanso e viveu tensao com a chefia.', tension: 'Limite pessoal pode ter custo institucional.' },
      ],
      fact: 'Deslocamento longo somado a jornada extensa aumenta risco de adoecimento.',
    },
  ],
  cadeirante: [
    {
      id: 'cad_calcada',
      icon: '♿',
      title: 'CALCADA BLOQUEADA',
      desc: 'Entulho e obra sem rampa interromperam a passagem da calcada.',
      dilema: 'Dilema: arriscar a rua ou perder tempo voltando quadras?',
      duration: 25000,
      choices: [
        { text: 'Voltar por rota segura', energy: -12, social: 6, time: 14, score: 9, msg: 'Voce manteve seguranca, mas perdeu tempo.', tension: 'Inacessibilidade transfere custo para voce.' },
        { text: 'Arriscar o fluxo da rua', energy: -18, social: -6, time: 5, score: 3, msg: 'Passou mais rapido, com alto risco.', tension: 'Sem acessibilidade, risco vira rotina.' },
        { text: 'Acionar fiscalizacao', energy: -8, social: 16, time: 10, score: 14, msg: 'A passagem provisoria foi liberada.', tension: 'Direito so existe quando e cobrado.' },
      ],
      fact: 'Calcada inacessivel limita autonomia e acesso a servicos basicos.',
    },
    {
      id: 'cad_elevador',
      icon: '♿',
      title: 'ELEVADOR DA ESTACAO PARADO',
      desc: 'O elevador da estacao falhou e nao ha previsao de reparo.',
      dilema: 'Dilema: insistir no protocolo ou abandonar a integracao?',
      duration: 25000,
      choices: [
        { text: 'Exigir protocolo de acessibilidade', energy: -8, social: 15, time: 11, score: 13, msg: 'Voce embarcou com demora e registro formal.', tension: 'Sem manutencao, direito vira favor.' },
        { text: 'Pagar rota alternativa', energy: -5, social: -4, time: 7, score: 6, msg: 'Voce seguiu viagem com custo maior.', tension: 'Falha publica vira gasto privado.' },
        { text: 'Cancelar o trajeto', energy: -3, social: -11, time: 15, score: 1, msg: 'Seu dia foi interrompido pela barreira urbana.', tension: 'Infrastrutura falha exclui oportunidades.' },
      ],
      fact: 'Falhas em elevador e plataforma limitam acesso a trabalho e estudo.',
    },
    {
      id: 'cad_rampa_onibus',
      icon: '♿',
      title: 'RAMPA DO ONIBUS FALHOU',
      desc: 'O onibus chegou, mas a rampa nao funcionou no embarque.',
      dilema: 'Dilema: insistir agora ou esperar o proximo?',
      duration: 25000,
      choices: [
        { text: 'Pedir acionamento manual', energy: -10, social: 14, time: 9, score: 13, rideBus: true, msg: 'Voce embarcou e a falha foi reportada.', tension: 'Acessibilidade nao deveria depender de insistencia.' },
        { text: 'Esperar o proximo onibus', energy: -6, social: 4, time: 12, score: 7, msg: 'Voce evitou confronto e perdeu mais tempo.', tension: 'Evitar desgaste tambem tem custo.' },
        { text: 'Desistir do deslocamento', energy: -2, social: -12, time: 16, score: 1, msg: 'O compromisso ficou para outro dia.', tension: 'Falha sistemica vira exclusao concreta.' },
      ],
      fact: 'Frota acessivel sem manutencao continua nao garante mobilidade real.',
    },
  ],
  def_visual: [
    {
      id: 'vis_piso_tatil',
      icon: '🦯',
      title: 'PISO TATIL INTERROMPIDO',
      desc: 'O piso tatil some no meio da calcada e termina em obstaculos.',
      dilema: 'Dilema: depender de ajuda externa ou arriscar autonomia sem referencia?',
      duration: 25000,
      choices: [
        { text: 'Pedir orientacao no local', energy: -5, social: 11, time: 8, score: 11, msg: 'Voce seguiu com apoio e seguranca maior.', tension: 'Apoio ajuda, mas nao substitui acessibilidade.' },
        { text: 'Seguir com memoria do trajeto', energy: -11, social: -2, time: 9, score: 5, msg: 'Voce conseguiu avancar, com muito estresse.', tension: 'Autonomia sem estrutura vira desgaste constante.' },
        { text: 'Registrar denuncia', energy: -6, social: 16, time: 10, score: 14, msg: 'A irregularidade entrou em vistoria.', tension: 'Problema privado precisa virar dado publico.' },
      ],
      fact: 'Piso tatil continuo e fundamental para orientacao segura.',
    },
    {
      id: 'vis_semaforo',
      icon: '🦯',
      title: 'SEMAFORO SONORO DESLIGADO',
      desc: 'O cruzamento esta intenso e o sinal sonoro nao funciona.',
      dilema: 'Dilema: atravessar no risco ou esperar suporte?',
      duration: 25000,
      choices: [
        { text: 'Esperar ajuda para travessia', energy: -4, social: 10, time: 8, score: 10, msg: 'Travessia segura, com perda de ritmo.', tension: 'Seguranca imediata pode aumentar dependencia.' },
        { text: 'Atravessar pelo som do trafego', energy: -13, social: -6, time: 4, score: 3, msg: 'Voce cruzou rapido, sob alto risco.', tension: 'Sem recurso acessivel, o risco e desigual.' },
        { text: 'Acionar equipe de transito', energy: -7, social: 14, time: 10, score: 13, msg: 'A falha foi registrada no sistema.', tension: 'Cobrar manutencao fortalece direito coletivo.' },
      ],
      fact: 'Sinal sonoro e recurso basico para travessia autonoma.',
    },
    {
      id: 'vis_painel_audio',
      icon: '🦯',
      title: 'PAINEL DE VOZ FORA DO AR',
      desc: 'No terminal, o painel sonoro nao informa plataformas.',
      dilema: 'Dilema: confiar em informacao informal ou esperar confirmacao?',
      duration: 25000,
      choices: [
        { text: 'Confirmar com funcionario', energy: -6, social: 10, time: 7, score: 10, msg: 'Voce embarcou certo com apoio humano.', tension: 'Atendimento e importante, mas nao pode ser unico caminho.' },
        { text: 'Seguir orientacao de passageiros', energy: -9, social: 3, time: 8, score: 6, msg: 'Quase entrou na linha errada.', tension: 'Informacao informal pode gerar inseguranca.' },
        { text: 'Aguardar sistema voltar', energy: -4, social: 13, time: 10, score: 12, msg: 'Com sistema ativo, o embarque foi mais seguro.', tension: 'Esperar acessibilidade custa tempo de vida.' },
      ],
      fact: 'Informacao acessivel em tempo real reduz erro de trajeto.',
    },
  ],
  mae_solo: [
    {
      id: 'mae_creche',
      icon: '👩‍👦',
      title: 'CRECHE FECHOU MAIS CEDO',
      desc: 'A escola avisou que vai fechar antes do horario normal.',
      dilema: 'Dilema: sair do trabalho agora ou acionar rede de apoio?',
      duration: 25000,
      choices: [
        { text: 'Sair agora para buscar', energy: -10, social: 12, time: 12, score: 12, msg: 'Voce garantiu cuidado, com impacto no trabalho.', tension: 'Cuidado e prioridade, mas o sistema nao acompanha.' },
        { text: 'Pedir ajuda de uma vizinha', energy: -5, social: 14, time: 7, score: 13, msg: 'A rede funcionou e voce ganhou folego.', tension: 'Rede local cobre lacunas que deveriam ser publicas.' },
        { text: 'Esperar fim do expediente', energy: -13, social: -10, time: 6, score: 2, msg: 'Voce chegou tarde e com culpa acumulada.', tension: 'Nem sempre ha escolha boa quando tudo depende de voce.' },
      ],
      fact: 'Instabilidade no cuidado infantil afeta renda e saude mental.',
    },
    {
      id: 'mae_remedio',
      icon: '👩‍👦',
      title: 'REMEDIO EM FALTA',
      desc: 'O remedio da crianca acabou e o posto do bairro nao tem reposicao.',
      dilema: 'Dilema: gastar alem do orcamento ou adiar o tratamento?',
      duration: 25000,
      choices: [
        { text: 'Comprar na farmacia privada', energy: -6, social: -4, time: 8, score: 7, msg: 'Tratamento seguiu, mas o bolso apertou.', tension: 'Solucao imediata pode virar divida.' },
        { text: 'Buscar em outro posto publico', energy: -11, social: 14, time: 13, score: 13, msg: 'Voce conseguiu, com grande desgaste.', tension: 'Persistir no direito custa energia de um dia inteiro.' },
        { text: 'Adiar para amanha', energy: -3, social: -12, time: 4, score: 1, msg: 'Ganhou tempo hoje e perdeu paz para a noite.', tension: 'Adiar cuidado aumenta risco para quem ja esta vulneravel.' },
      ],
      fact: 'Falta de medicamento atinge com mais forca familias de baixa renda.',
    },
    {
      id: 'mae_dupla_jornada',
      icon: '👩‍👦',
      title: 'DUPLA JORNADA',
      desc: 'Depois do trabalho ainda ha casa, mercado e tarefa escolar.',
      dilema: 'Dilema: descansar um pouco ou tentar dar conta de tudo?',
      duration: 25000,
      choices: [
        { text: 'Dividir tarefas com rede de apoio', energy: 8, social: 12, time: 9, score: 14, msg: 'Voce ganhou folego e preservou o essencial.', tension: 'Dividir cuidado reduz sobrecarga.' },
        { text: 'Fazer tudo sozinha hoje', energy: -16, social: 3, time: 10, score: 8, msg: 'Tudo foi feito, com exaustao maxima.', tension: 'Produtividade sem pausa pode adoecer.' },
        { text: 'Cortar tarefas nao urgentes', energy: -4, social: 7, time: 6, score: 10, msg: 'A casa nao ficou perfeita, mas voce seguiu.', tension: 'Priorizar tambem e estrategia de cuidado.' },
      ],
      fact: 'Sobrecarga da dupla jornada impacta saude e renda no longo prazo.',
    },
  ],
};

export function getEventsForCharacter(characterId = DEFAULT_CHARACTER) {
  const profileEvents = CHARACTER_EVENTS[characterId] || [];
  const pool = profileEvents.length > 0
    ? [profileEvents[0], ...COMMON_EVENTS, ...profileEvents.slice(1)]
    : [...COMMON_EVENTS];

  return pool.map((event) => ({
    ...event,
    choices: event.choices.map((choice) => ({ ...choice })),
  }));
}
