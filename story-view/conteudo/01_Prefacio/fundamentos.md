---
titulo: Fundamentos da Jogabilidade
icone: fa-sparkles
template: simple
---

## Recursos no Jogo

### Vida
Representa o quanto o personagem é capaz de aguentar antes de desmaiar. Os pontos de vida sofrem alteração de acordo com a realidade em que o personagem está.
* É representada por um ícone de coração, onde a área vermelha indica a vida restante.

### Defesa
Resistência à redução de vida ao ser atingido por um golpe inimigo.
* A defesa não impede o personagem de receber dano, apenas reduz o dano recebido.
* Ataques críticos são imunes à armadura, afetando a vida diretamente. No entanto, a defesa reduz a chance de ocorrência de ataques críticos.
* É representada por um ícone de armadura peitoral que muda de aparência conforme os pontos de armadura.
    * A durabilidade da armadura é indicada por rachaduras no ícone.

### Stamina
Indica o quanto o personagem pode correr ou realizar ataques consecutivos sem ter sua movimentação reduzida.
* A quantidade de stamina varia de personagem para personagem.
* Comidas e poções podem aumentar ou diminuir a velocidade de recuperação de stamina.
* A velocidade de degradação da stamina é influenciada pelo peso da armadura e pela quantidade de itens no inventário.
* É representada por uma barra horizontal abaixo do ícone de vida.

### Mana
Indispensável para conjurar magias em Median. Cada magia possui um custo de mana variável.
* Pode ser obtida através de trocas com curandeiras e magos ou comprando em Avalest.
* É um item armazenado no inventário do jogador, onde cada slot armazena 100 unidades.
* É representada visualmente por uma barra vertical azul à esquerda da barra de vida (quando aplicável).

### Barra de amizade (afinidade)
Representa o nível de afinidade momentânea entre os personagens em uma equipe.
* A barra de amizade é exclusiva para cada relação entre dois personagens.
* Os pontos para aumentar a barra são obtidos através de presentes, missões opcionais e ao controlar o personagem ativo seguindo a sugestão de outro personagem.

---

## Teclas e combinações

* CIMA/BAIXO/ESQ/DIR: teclas de movimento, geralmente os botões na tela do usuário, WASD ou setas.

* ATK: tecla para ataque simples, geralmente o botão ATK na tela do usuário ou 'Q'
* DEF: tecla para defesa simples, geralmente o botão DEF na tela do usuário ou 'R'
* MAG: tecla para magia simples, geralmente o botão MAG na tela do usuário ou 'F'

*A combinação de duas ou mais teclas forma os ataques e defesas compostos:*
*NOTA: cada personagem possui suas próprias combinações de teclas para combos, essas combinações estão descritas nas fichas de personagem.*

### Ataque Decisivo:
* CIMA + BAIXO + ATK + ATK + ATK (ou versão simplificada: DEF + ATK ao mesmo tempo): Inicia um Quick Time Event: Ataque Decisivo — ataque de dano extremo com alto custo de stamina e mana, além da barra de amizade de todos os personagens da equipe. 
* O dano de Ataque Decisivo varia de acordo com o nível individual dos personagens, nível de afinidade e a quantidade de acertos no minigame. 
* As teclas do minigame são aleatórias para cada uso de Ataque Decisivo.

---

## Eventos
### Eventos de Pensamento (EdP)
Consiste em uma tomada de decisão do jogador quando um personagem estiver desenvolvendo uma linha de raciocínio. personagens com pensamento descritivo (pensam falando o que estão pensando; Alan é um exemplo) tem a tendência 70% maior de acionarem um EdP.

## Efeitos de Status do Personagem

* **Sonolência:** A velocidade de movimento é reduzida em 25%, os ataques causam 30% menos dano e ataques surpresa contra o personagem são 40% mais efetivos.
* **Disposto:** Concede 10% de velocidade de movimento e de ataque, além de 2 horas de resistência à sonolência.

### Fome
A fome é um status progressivo com 5 níveis de intensidade.

* **Nível 1 – Leve desconforto**
    * *Descrição:* O estômago ronca e o personagem se sente levemente distraído (10% de vulnerabilidade a ataques surpresa).
    * *Efeitos:*
        * -5% de regeneração de stamina.
        * Pequenos tremores ao mirar com armas de precisão ou magias.

* **Nível 2 – Fome moderada**
    * *Descrição:* O personagem sente dificuldades para focar e começa a perder reflexos.
    * *Efeitos:*
        * 10% de redução na velocidade de ataque.
        * Ataques especiais consomem 15% mais stamina ou mana.
        * Opções de diálogo podem ser alteradas ("está com fome demais para pensar direito").

* **Nível 3 – Fome intensa**
    * *Descrição:* O corpo começa a mostrar sinais físicos de fraqueza, tontura e desorientação.
    * *Efeitos:*
        * 15% de redução no dano físico.
        * 10% de chance de errar ataques corpo a corpo simples.
        * Tela levemente tremida e som ambiente abafado.

* **Nível 4 – Quase em colapso**
    * *Descrição:* A fraqueza é visível. O personagem anda encurvado e respira com dificuldade.
    * *Efeitos:*
        * 25% de redução na velocidade de movimento.
        * Custo de stamina para correr, saltar ou esquivar é dobrado.
        * +3 segundos no tempo de conjuração de magias.

* **Nível 5 – Exaustão total**
    * *Descrição:* O corpo não suporta mais. O personagem desmaiará em breve.
    * *Efeitos:*
        * Após 2 horas nesse estado, há risco de desmaio (1/4 de chance para cada hora adicional).
        * Redução geral de 40% em todas as estatísticas (ataque, defesa, velocidade).
        * Se desmaiar, acorda com o efeito de `Sonolência`, fraqueza e metade da vida restante.


### Estados de personagem
Ao passar por alguma situação, seja na narrativa ou durante o gameplay livre, o personagem ativo pode passar a apresentar efeitos colaterais.

#### Traumatizado
Após passar por determinados eventos na narrativa, os personagens podem ficar com efeito "traumatizado". Isso implica em mudanças de comportamento ao longo dos dias (descritas abaixo). 
Para remover o estado traumatizado, o jogador deve resolver ao menos 3 dos subestados abaixo:

* *Reservado/Quieto:* passa a não responder a maioria das perguntas bobas, deixa de fazer piadas (para personagens aplicáveis, ex: Mike e Deni) durante missões longas e tende a responder grosseiramente quando perguntam como ele está. Pode ser resolvido fazendo com que o persogem afetado converse com personagens que não costuma conversar ou com um Melhor Amigo (exemplo: Mike pode falar com Raika (não costuma falar com ela) ou procurar Alan (mesmo quando Alan não compõe a equipe)).

* *Luto:* tendência de permanecer triste em memória ao trauma. Ao perder um amigo, por exemplo, o personagem passa a evitar atividades que antes o deixavam feliz por não achar justo estar sorrindo quando seu amigo não está mais ali. Luto só pode ser resolvido ao fazer o personagem chegar a uma conclusão que justifique o fim do luto; Alan conversa sozinho, uma das formas de acabar com o luto dele é fazendo atividades rotineiras (como cortar árvores e caçar) e responder corretamente aos Eventos de Pensamento do personagem.

* *Negação:* o personagem afetado tende a continuar sua rotina normalmente, como se o fato não tivesse ocorrido. Como consequência, o personagem apresenta sinais de estresse, como maior taxa de erro em ataques e esquivas, stamina reduzida (entre 15 e 40%, a depender do fator de estresse) e eventuais surtos de raiva (o personagem grita e ataca violentamente qualquer inimigo ao seu alcance (sem o controle do jogador)). Negação é resolvida passivamente, em outras palavras, a única forma de resolver é deixando o personagem se estressar e descarregar em algo/alguém.

* *Sensibilidade:* tocar no assunto relacionado ao trauma faz com que o personagem chore (exceto Alan, que apenas choraminga (escorre uma leve lágrima ou fala "mole", mas permanece estável)). Sensibilidade só pode ser resolvida falando com uma pessoa muito próxima, um Melhor Amigo ou alguém também com efeito traumatizado ativo.

Resolver os subestados, mesmo que não os 4, reduz o tempo em que traumatizado permanece ativo. Efeito traumatizado tem duração padrão de 14 dias (ou tempo correspondente em outras realidades fora de Median), tendo redução progressiva de 20 a 35% para cada subestado resolvido (redução progressiva = tempo restante - 20% - 25% - 30% ...). Isso significa que mesmo resolvendo 3 subestados, o personagem ainda permanece com os efeitos de traumatizado, porém severamente reduzidos. Traumatizado tem duração mínima de 3 dias.

---

## Mecânicas de Jogo e Narrativa

A narrativa é construída por capítulos. A cada capítulo, haverá um ponto considerável no avanço da história.

O tempo no jogo funciona baseado em horários: `2,5 minutos` na vida real equivalem a `1 hora` no jogo. A iluminação do cenário varia de acordo com o horário do dia, influenciando a ocorrência de cenas opcionais.

### Sono e Descanso
Todos os personagens precisam dormir, exceto Alan e o Homem Misterioso.
* Dormir concede 18 horas de imunidade à `Sonolência`; cochilar concede 6 horas.
* Após o tempo de imunidade, o personagem tem uma probabilidade de ficar sonolento (1/8 de chance × número de horas sem dormir).
* O mesmo personagem pode ficar até 3 dias sem dormir. Caso passe disso, ele desmaia e fica com o efeito de `Sonolência` por 2 dias.

> #### Ações ao Dormir
> * **Dormir à noite (entre 21h e 23h):** as horas avançam automaticamente até as 8h do dia seguinte.
> * **Dormir de dia (entre 8h e 21h):** o jogador pode escolher entre duas opções:
>     * **Tirar um cochilo:** o tempo avança 4 horas. O personagem pode passar a noite acordado, mas ficará sonolento 6 horas depois.
>     * **Dormir:** o tempo avança 8 horas.
> * Algumas missões são noturnas, exigindo que o jogador se planeje para dormir antes do horário da missão.

