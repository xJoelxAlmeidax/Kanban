// Função para salvar o estado do Kanban
function saveBoardState() {
    const kanbanState = [];
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const columnId = column.getAttribute('data-id');
        const cards = column.querySelectorAll('.kanban-card');
        const cardData = [];

        cards.forEach(card => {
            const title = card.querySelector('.card-title').innerText;
            const priority = card.querySelector('.badge').classList[1];
            const commentCount = parseInt(card.querySelector('.fa-comment').parentElement.innerText);
            const attachmentCount = parseInt(card.querySelector('.fa-paperclip').parentElement.innerText);
            const userImage = card.querySelector('.user img').src;
            const description = card.querySelector('.card-description').innerText; // Adiciona a descrição

            cardData.push({ title, priority, commentCount, attachmentCount, userImage, description });
        });

        kanbanState.push({ columnId, cards: cardData });
    });

    localStorage.setItem('kanbanState', JSON.stringify(kanbanState));
}

// Função para carregar o estado do Kanban
function loadBoardState() {
    const savedState = JSON.parse(localStorage.getItem('kanbanState'));
    if (savedState) {
        savedState.forEach(columnData => {
            columnData.cards.forEach(cardData => {
                addNewCardWithData(columnData.columnId, cardData);
            });
        });
    }
}

// Função para adicionar um novo card com dados específicos (para carregar o estado salvo)
function addNewCardWithData(columnId, cardData) {
    const { title, priority, commentCount, attachmentCount, userImage, description } = cardData;
    createCard(columnId, title, priority, commentCount, attachmentCount, userImage, description);
}

// Função para criar e adicionar um novo card
function createCard(columnId, cardTitle, priority, commentCount, attachmentCount, userImage, description = "") {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;

    const priorityAndButtons = document.createElement('div');
    priorityAndButtons.className = 'priority_e_buttons';

    const badge = document.createElement('div');
    badge.className = `badge ${priority}`;
    const badgeText = document.createElement('span');
    badgeText.innerText = `Prioridade ${priority}`;
    badge.appendChild(badgeText);

    const buttons = document.createElement('div');
    buttons.className = "buttons";
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-card';
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.addEventListener('click', () => deleteCard(card));

    const editButton = document.createElement('button');
    editButton.className = 'edit-card';
    editButton.innerHTML = '<i class="fa-solid fa-edit"></i>';
    editButton.addEventListener('click', () => editCard(card));
    priorityAndButtons.appendChild(badge);
    
    priorityAndButtons.appendChild(buttons);
    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);
    
    const titleElement = document.createElement('p');
    titleElement.className = 'card-title';
    titleElement.innerText = cardTitle;

    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'card-description';
    descriptionElement.innerText = description;

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const cardIcons = document.createElement('div');
    cardIcons.className = 'card-icons';

    const commentIcon = document.createElement('p');
    commentIcon.innerHTML = `<i class="fa-regular fa-comment"></i> ${commentCount}`;
    cardIcons.appendChild(commentIcon);

    const attachmentIcon = document.createElement('p');
    attachmentIcon.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${attachmentCount}`;
    cardIcons.appendChild(attachmentIcon);

    const userDiv = document.createElement('div');
    userDiv.className = 'user';
    const userImg = document.createElement('img');
    userImg.src = userImage;
    userImg.alt = "perfil";
    userDiv.appendChild(userImg);

    cardInfo.appendChild(cardIcons);
    cardInfo.appendChild(userDiv);
    card.appendChild(priorityAndButtons);
    card.appendChild(titleElement);
    card.appendChild(descriptionElement); // Adiciona a descrição ao card
    card.appendChild(cardInfo);

    const column = document.querySelector(`.kanban-column[data-id="${columnId}"] .kanban-cards`);
    column.appendChild(card);

    enableDrag(card);
    saveBoardState();
}

// Função para editar um card
function editCard(card) {
    const newTitle = prompt("Digite o novo título do card:", card.querySelector('.card-title').innerText);
    const newPriority = prompt("Digite a nova prioridade (alta, média, baixa):", card.querySelector('.badge').classList[1]).toLowerCase();
    const newDescription = prompt("Digite a nova descrição do card:", card.querySelector('.card-description').innerText);

    const validPriorities = ["alta", "média", "baixa"];
    while (!validPriorities.includes(newPriority)) {
        newPriority = prompt("Prioridade inválida. Digite a nova prioridade (alta, média, baixa):").toLowerCase();
    }

    if (newTitle) {
        card.querySelector('.card-title').innerText = newTitle;
    }
    if (newPriority) {
        const badge = card.querySelector('.badge');
        badge.classList.remove('alta', 'media', 'baixa'); // Remove classes de prioridade antigas
        badge.classList.add(newPriority); // Adiciona nova prioridade
        badge.querySelector('span').innerText = `Prioridade ${newPriority}`;
    }
    if (newDescription) {
        card.querySelector('.card-description').innerText = newDescription;
    }

    saveBoardState(); // Salva o estado atualizado do Kanban
}

// Função para adicionar um novo card com input do usuário
function addNewCard(columnId) {
    const cardTitle = prompt("Digite o título do card:");
    const priority = prompt("Digite a prioridade (alta, média, baixa):").toLowerCase();
    const description = prompt("Digite a descrição do card:");
    const validPriorities = ["alta", "média", "baixa"];

    // Valida a prioridade
    while (!validPriorities.includes(priority)) {
        priority = prompt("Prioridade inválida. Digite a prioridade (alta, média, baixa):").toLowerCase();
    }

    const commentCount = 1;
    const attachmentCount = 0;
    const userImage = "images/green.png";

    if (cardTitle) {
        createCard(columnId, cardTitle, priority, commentCount, attachmentCount, userImage, description);
    }
}

// Função para habilitar o arraste para o card
function enableDrag(card) {
    card.addEventListener('dragstart', (e) => {
        e.currentTarget.classList.add('dragging');
    });

    card.addEventListener('dragend', (e) => {
        e.currentTarget.classList.remove('dragging');
        saveBoardState(); // Salva o estado do board ao finalizar o arraste
    });
    
}

// Função para configurar as colunas para arrastar e soltar
function setupColumns() {
    const columns = document.querySelectorAll('.kanban-column .kanban-cards');

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            column.appendChild(dragging);
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            saveBoardState(); // Salva o estado ao soltar o card
        });
    });
}

// Função para excluir um card e atualizar o estado
function deleteCard(card) {
    card.remove();
    saveBoardState();
}

// Configuração inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    setupColumns();
    loadBoardState(); // Carrega o estado salvo ao iniciar

    const addButtons = document.querySelectorAll('.add-card');
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const columnId = button.closest('.kanban-column').getAttribute('data-id');
            addNewCard(columnId);
        });
    });

    const existingCards = document.querySelectorAll('.kanban-card');
    existingCards.forEach(card => enableDrag(card));
});

