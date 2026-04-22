# Revisão do Sistema do Colega

Aluna avaliado: Nathalia Fernanda (https://github.com/nathaliafab/proftest2)

---

## A Revisão

### 1. O sistema está funcionando com as funcionalidades solicitadas?

O sistema está em grande parte funcional. A interface é visualmente bem construída, intuitiva e as funcionalidades principais de cadastro e visualização operam corretamente. Há dois pontos que merecem atenção: o sistema requer um arquivo `.env` configurado para rodar, e a ausência de documentação ou fallback sobre isso pode dificultar a execução por quem clona o repositório pela primeira vez. Além disso, a funcionalidade de envio de notificação por email apresentou um comportamento inesperado: mesmo após registrar uma avaliação ainda não enviada, o sistema exibiu a mensagem "Não há alterações pendentes para envio hoje", o que sugere uma inconsistência na lógica de detecção de pendências.

---

### 2. Quais os problemas de qualidade do código e dos testes?

O código é bem estruturado e segue boas práticas de arquitetura em TypeScript, com separação clara entre camadas. Seria beneficiado pela adição de documentação nas funções mais complexas e de testes unitários para a camada de serviços, o que aumentaria a confiança na manutenção futura.

Em relação aos testes, a suíte utiliza BDD com Cucumber em português, o que facilita bastante a leitura e compreensão dos cenários. Os passos estão bem organizados por funcionalidade e há cobertura de casos de sucesso e de validações negativas. Alguns pontos que poderiam ser melhorados:

- A ausência de cleanup entre testes pode ocasionar efeitos colaterais caso os dados não estejam devidamente isolados.
- A dependência de identificadores criados em steps anteriores torna alguns cenários sensíveis à ordem de execução.
- Comportamentos críticos como o agendamento automático de notificações ainda não possuem cobertura de teste.
- Não há validação de persistência real, ou seja, não se verifica se os dados JSON são efetivamente gravados e recuperados.

Os testes cobrem a camada de API (Cucumber com Axios), mas não há cobertura de interface. Testes que validem fluxos de usuário no navegador, como preenchimento de formulários e exibição de dados em tela, complementariam bem o que já existe.

---

### 3. Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?

Ambos os sistemas implementam a mesma proposta: gerenciamento de alunos, avaliações e turmas com notificações por email. Cada um apresenta pontos fortes em áreas distintas.

Em arquitetura, o sistema da colega demonstra uma organização mais escalável: os tipos são separados por domínio em arquivos distintos e a validação é feita com Zod, incluindo mensagens personalizadas. No meu sistema, os tipos estão centralizados em um único arquivo e as validações são manuais, o que pode aumentar o esforço de manutenção conforme o projeto cresce.

Em cobertura de testes, o meu sistema vai além dos testes de API, incluindo testes de UI com Selenium WebDriver e scripts granulares que permitem validar o comportamento da interface React. Esse nível de cobertura complementa bem o que o sistema da colega já oferece na camada de API.

Na funcionalidade de email, o sistema da colega implementa um agendador automático diário que envia um email consolidado com todas as avaliações alteradas, atendendo diretamente ao requisito especificado. No meu sistema, o envio é acionado manualmente pelo professor, o que atende de forma diferente ao mesmo requisito.

No geral, os dois sistemas se complementam bem: o sistema da colega entrega a funcionalidade de email de forma automatizada e conta com uma arquitetura bem organizada; o meu sistema contribui com uma cobertura de testes mais ampla. A combinação das duas abordagens representaria um sistema mais completo.

---

## Revisão do Histórico do Desenvolvimento

### 1. Estratégias de interação utilizadas

A colega adotou uma abordagem iterativa e incremental. Antes de começar a codificar, criou instruções permanentes de comportamento para o agente, o que demonstra planejamento inicial. O desenvolvimento foi decomposto em ciclos curtos por funcionalidade (alunos, avaliações, turmas, email), com iterações de refinamento visual após cada entrega, como adição de toasts e legendas de cores. Os testes foram incorporados ao final do processo. Quando algo não funcionava como esperado, a estratégia foi emitir prompts curtos e direcionados solicitando ajustes específicos.

---

### 2. Situações em que o agente funcionou melhor ou pior

O agente se mostrou bastante eficaz na criação do scaffolding inicial do projeto, na implementação de operações CRUD, nas melhorias visuais incrementais e em correções pontuais com contexto bem definido.

Em contrapartida, os testes de aceitação demandaram mais ciclos de ajuste do que o esperado. O requisito de email consolidado foi interpretado de forma incompleta pelo agente na primeira tentativa. Houve também dificuldades na integração entre módulos e no isolamento de dados de teste em relação aos arquivos de produção.

O padrão geral observado é que o agente tende a entregar bons resultados em tarefas bem delimitadas, mas requer mais orientação quando os requisitos envolvem integração entre múltiplos módulos ou regras de negócio mais abrangentes.

---

### 3. Tipos de problemas observados

Os problemas identificados ao longo do desenvolvimento se distribuem em algumas categorias:

Problemas de lógica: o envio de email foi inicialmente implementado apenas como log, sem envio real; os dados de avaliações estavam desconectados das turmas; alunos sem turma eram ocultados de forma não intencional; o corpo do email era enviado vazio.

Problemas de isolamento: os testes utilizavam os mesmos arquivos JSON do ambiente de produção, o que gerava interferência entre os ambientes.

Problemas de comunicação com o agente: prompts mais genéricos resultaram em entregas também genéricas; um prompt sobre feedback visual gerou uma interface considerada poluída; prompts sem contexto suficiente sobre os requisitos da atividade não produziram os resultados esperados.

Problemas de completude: os cenários Cucumber não foram gerados completamente na primeira tentativa; a funcionalidade de email foi entregue incompleta sem que o agente indicasse isso.

---

### 4. Avaliação geral da utilidade do agente no desenvolvimento

A colega avaliou positivamente o agente em aproximadamente 80% das interações registradas, com as avaliações menos favoráveis concentradas nas interações envolvendo email. Isso indica que o agente foi um recurso valioso para a maior parte do desenvolvimento, especialmente em scaffolding, CRUD e interface. Para requisitos que envolviam maior complexidade de integração, o agente exigiu mais iterações e acompanhamento. No geral, o agente se mostrou um bom acelerador de desenvolvimento, sendo mais eficaz quando combinado com supervisão técnica nas etapas mais críticas.

---

### 5. Comparação com minha experiência de uso do agente

Ambas as experiências apontam para conclusões semelhantes: o agente produz melhores resultados em tarefas pequenas e bem definidas, e a iteração é parte natural do processo de uso.

A principal diferença está no momento em que os testes foram incorporados. A colega optou por implementá-los ao final, o que levou à descoberta mais tardia de alguns problemas de integração e isolamento. Na minha abordagem, os testes foram incluídos desde o início com Cucumber para API e Selenium para UI, o que ajudou a identificar inconsistências mais cedo no ciclo de desenvolvimento.

Em relação ao estilo de interação com o agente, a abordagem da colega foi predominantemente reativa, com prompts de ajuste após identificar problemas. Priorizei instruções mais estruturadas antes de iniciar cada funcionalidade, o que reduziu o número de ciclos de correção por interpretação incorreta.

A conclusão compartilhada por ambas as experiências é que o agente é um recurso genuinamente útil no desenvolvimento, desde que o desenvolvedor mantenha clareza sobre os requisitos e valide os resultados de forma consistente, especialmente nas funcionalidades mais sensíveis.
