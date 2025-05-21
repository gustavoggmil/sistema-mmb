// Puxando funções do Firebase já importadas no HTML
const { ref, push, set, onValue, update, remove } = window.firebaseRefs;
const database = window.database;

// Variáveis globais para armazenar temporariamente os registros
let cargas = [];
let debitos = [];
let motoristas = [];
let empresas = [];

// 1) Carregar registros em tempo real
function carregarRegistrosFirebase() {
  // Cargas
  onValue(ref(database, 'cargas'), snapshot => {
    const data = snapshot.val() || {};
    cargas = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    renderizarLista();
  });
  // Débitos
  onValue(ref(database, 'debitos'), snapshot => {
    const data = snapshot.val() || {};
    debitos = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    renderizarLista();
  });
  // Motoristas
  onValue(ref(database, 'motoristas'), snapshot => {
    const data = snapshot.val() || {};
    motoristas = Object.entries(data).map(([id, val]) => ({ id, ...val }));
  });
  // Empresas
  onValue(ref(database, 'empresas'), snapshot => {
    const data = snapshot.val() || {};
    empresas = Object.entries(data).map(([id, val]) => ({ id, ...val }));
  });
}

// 2) Renderizar a lista de cargas e débitos
function renderizarLista() {
  showSection('lista');
  const registrosDiv = document.getElementById("registros");
  registrosDiv.innerHTML = "";

  // Cargas
  registrosDiv.innerHTML += "<h3>Cargas:</h3>";
  cargas.forEach(c => {
    registrosDiv.innerHTML += `
      <div class="registro-card">
        <strong>${c.empresa}</strong> - ${c.origem} ➔ ${c.destino}<br>
        Frete total: R$${c.frete} | Status: ${c.status}<br>
        <button onclick="editarCarga('${c.id}')">Editar</button>
        <button onclick="deletarCarga('${c.id}')">Excluir</button>
        <button onclick="mostrarDetalhes('${c.id}')">Detalhar Transporte</button>
        <div>
          ${mostrarAnexo("Pix", c.pix)}
          ${mostrarAnexo("MDF-e", c.mdfe)}
          ${mostrarAnexo("CT-e", c.cte)}
          ${mostrarAnexo("Nota Fiscal", c.nf)}
          ${mostrarAnexo("Canhoto", c.canhoto)}
          ${mostrarAnexo("Contrato", c.contrato)}
        </div>
        <div id="detail-${c.id}" class="detail-panel hidden">
          <h4>MMB</h4>
          <div class="row"><span>Recebido:</span><span>R$${c.recebido}</span></div>
          <div class="row"><span>A Receber:</span><span>R$${c.areceber}</span></div>
          <h4>Motorista</h4>
          <div class="row"><span>Adiantamento:</span><span>R$${c.adiantamento||0}</span></div>
          <div class="row"><span>Saldo:</span><span>R$${c.saldo||0}</span></div>
        </div>
      </div>
    `;
  });

  // Débitos
  registrosDiv.innerHTML += "<h3>Débitos:</h3>";
  debitos.forEach(d => {
    registrosDiv.innerHTML += `
      <div class="registro-card">
        ${d.data} - ${d.descricao} | R$${d.valor}
        <button onclick="deletarDebito('${d.id}')">Excluir</button>
      </div>
    `;
  });
}

// Mostrar/ocultar seções
function showSection(id) {
  ['form-carga','form-debito','form-motorista','form-empresa','lista'].forEach(sec => {
    document.getElementById(sec).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  // Ajustar título do form
  const titulo = document.getElementById('form-titulo');
  if (titulo) titulo.innerText = id === 'form-carga' ? 'Registrar Carga' : id === 'form-debito' ? 'Registrar Débito' : id === 'form-motorista' ? 'Cadastro de Motorista' : 'Cadastro de Empresa';
}

// showForm genérico
function showForm(tipo) {
  showSection(tipo === 'carga' ? 'form-carga' : tipo === 'debito' ? 'form-debito' : tipo === 'motorista' ? 'form-motorista' : 'form-empresa');
}

// 3) Adicionar ou atualizar carga (mantido)
async function adicionarCarga(e) { /* ... existente ... */ }
// 4) Editar e deletar carga (mantido)
function editarCarga(id) { /* ... existente ... */ }
function deletarCarga(id) { /* ... existente ... */ }
// 5) Adicionar e deletar débito (mantido)
async function adicionarDebito(e) { /* ... existente ... */ }
function deletarDebito(id) { /* ... existente ... */ }

// 6) Adicionar Motorista
async function adicionarMotorista(e) {
  e.preventDefault();
  const tipo = document.getElementById('tipoMotorista').value;
  const motorista = { nome: document.getElementById('nomeMotorista').value, tipo };
  if (tipo === 'autonomo') motorista.cpf = document.getElementById('cpfAutonomo').value;
  if (tipo === 'contratado') motorista.empresa = document.getElementById('empresaContratada').value;
  const newRef = push(ref(database,'motoristas'));
  await set(newRef, motorista);
  alert('Motorista registrado!');
  e.target.reset();
  atualizarCamposMotorista();
}

// 7) Adicionar Empresa
async function adicionarEmpresa(e) {
  e.preventDefault();
  const empresa = {
    nome: document.getElementById('nomeEmpresa').value,
    cnpj: document.getElementById('cnpjEmpresa').value,
    contato: document.getElementById('contatoEmpresa').value
  };
  const newRef = push(ref(database,'empresas'));
  await set(newRef, empresa);
  alert('Empresa registrada!');
  e.target.reset();
}

// 8) Atualizar campos dinâmicos em cadastro de motorista
function atualizarCamposMotorista() {
  ['autonomo','contratado','mmb'].forEach(tipo => {
    document.getElementById(`field-${tipo}`).classList.add('hidden');
  });
  const tipo = document.getElementById('tipoMotorista').value;
  if (tipo) document.getElementById(`field-${tipo}`).classList.remove('hidden');
}

// 9) Detalhar transporte
function mostrarDetalhes(id) {
  const panel = document.getElementById(`detail-${id}`);
  panel.classList.toggle('visible');
  panel.classList.toggle('hidden');
}

// 10) Utilitário de anexos e base64 (mantido)
function mostrarAnexo(nome, base64) { /* ... existente ... */ }
function toBase64(file) { /* ... existente ... */ }

// 11) Iniciar listeners Firebase
window.addEventListener('load', () => {
  carregarRegistrosFirebase();
});
