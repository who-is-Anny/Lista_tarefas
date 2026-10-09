const form = document.getElementById("formTarefa");
const input = document.getElementById("inputTarefa");
const lista = document.getElementById("listaTarefas");
const estadoVazio = document.getElementById("estadoVazio");

const totalEl = document.getElementById("total");
const pendentesEl = document.getElementById("pendentes");
const concluidasEl = document.getElementById("concluidas");
const percentualEl = document.getElementById("percentual");
const progressoEl = document.getElementById("progresso");
const mensagemEl = document.getElementById("mensagem");

const filtro = document.getElementById("filtroTarefas");
const limparConcluidas = document.getElementById("limparConcluidas");
const dataAtual = document.getElementById("dataAtual");

let proximoId = 1;
const tarefas = [];

// Exibe a data atual em português.
dataAtual.textContent = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
}).format(new Date());

// Adiciona uma nova tarefa.
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const texto = input.value.trim();

    if (!texto) {
        input.focus();
        return;
    }

    tarefas.push({
        id: proximoId++,
        texto: texto,
        concluida: false
    });

    input.value = "";
    filtro.value = "todas";

    renderizarTarefas();
    input.focus();
});

// Alterna conclusão ou remove uma tarefa.
// A delegação de eventos funciona também para itens novos.
lista.addEventListener("click", function (event) {
    const botao = event.target.closest("button");

    if (!botao) return;

    const item = botao.closest(".tarefa");

    if (!item) return;

    const id = Number(item.dataset.id);
    const indice = tarefas.findIndex(tarefa => tarefa.id === id);

    if (indice === -1) return;

    if (botao.classList.contains("checkbox-tarefa")) {
        tarefas[indice].concluida = !tarefas[indice].concluida;
        renderizarTarefas();
    }

    if (botao.classList.contains("botao-remover")) {
        tarefas.splice(indice, 1);
        renderizarTarefas();
    }
});

// Filtra as tarefas exibidas.
filtro.addEventListener("change", renderizarTarefas);

// Remove todas as tarefas concluídas.
limparConcluidas.addEventListener("click", function () {
    for (let i = tarefas.length - 1; i >= 0; i--) {
        if (tarefas[i].concluida) {
            tarefas.splice(i, 1);
        }
    }

    renderizarTarefas();
});

// Cria um elemento HTML com uma tarefa.
function criarElementoTarefa(tarefa) {
    const li = document.createElement("li");
    li.className = "tarefa";
    li.dataset.id = tarefa.id;

    // Classe CSS adicionada quando a tarefa é concluída.
    if (tarefa.concluida) {
        li.classList.add("concluida");
    }

    const botaoCheck = document.createElement("button");
    botaoCheck.type = "button";
    botaoCheck.className = "checkbox-tarefa";
    botaoCheck.textContent = "✓";
    botaoCheck.setAttribute(
        "aria-label",
        tarefa.concluida
            ? "Marcar como pendente"
            : "Marcar como concluída"
    );
    botaoCheck.setAttribute(
        "aria-pressed",
        String(tarefa.concluida)
    );

    const texto = document.createElement("span");
    texto.className = "texto-tarefa";
    texto.textContent = tarefa.texto;

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.className = "botao-remover";
    botaoRemover.textContent = "×";
    botaoRemover.setAttribute(
        "aria-label",
        `Remover tarefa: ${tarefa.texto}`
    );
    botaoRemover.title = "Remover tarefa";

    li.append(botaoCheck, texto, botaoRemover);

    return li;
}

// Atualiza a lista, os filtros, os contadores e o progresso.
function renderizarTarefas() {
    const tipoFiltro = filtro.value;

    const tarefasVisiveis = tarefas.filter(tarefa => {
        if (tipoFiltro === "pendentes") {
            return !tarefa.concluida;
        }

        if (tipoFiltro === "concluidas") {
            return tarefa.concluida;
        }

        return true;
    });

    const fragmento = document.createDocumentFragment();

    tarefasVisiveis.forEach(tarefa => {
        fragmento.appendChild(criarElementoTarefa(tarefa));
    });

    lista.replaceChildren(fragmento);

    const total = tarefas.length;
    const concluidas = tarefas.filter(
        tarefa => tarefa.concluida
    ).length;
    const pendentes = total - concluidas;

    totalEl.textContent = total;
    pendentesEl.textContent = pendentes;
    concluidasEl.textContent = concluidas;

    const percentual = total === 0
        ? 0
        : Math.round((concluidas / total) * 100);

    percentualEl.textContent = `${percentual}%`;
    progressoEl.style.setProperty(
        "--progresso",
        `${percentual}%`
    );

    estadoVazio.hidden = tarefasVisiveis.length > 0;
    lista.hidden = tarefasVisiveis.length === 0;

    if (total === 0) {
        mensagemEl.textContent = "Vamos fazer acontecer?";
    } else if (pendentes === 0) {
        mensagemEl.textContent = "Parabéns! Tudo concluído.";
    } else {
        mensagemEl.textContent =
            `${pendentes} tarefa(s) esperando por você.`;
    }

    limparConcluidas.disabled = concluidas === 0;
    limparConcluidas.style.opacity =
        concluidas === 0 ? "0.45" : "1";
}

// Estado inicial da aplicação.
renderizarTarefas();