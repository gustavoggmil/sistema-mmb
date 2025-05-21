// script.js
// 0) Inicialização de refs do Firebase após load
let ref, push, set, onValue, update, remove, database;

// 1) Variáveis globais
let cargas = [];
let debitos = [];
let motoristas = [];
let empresas = [];

// 2) Carregar registros em tempo real
function carregarRegistrosFirebase() {
  onValue(ref(database, 'cargas'), snapshot => {
    const data = snapshot.val() || {};
    cargas = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    renderizarLista();
  });
  onValue(ref(database, 'debitos'), snapshot => {
    const data = snapshot.val() || {};
    debitos = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    renderizarLista();
  });
  onValue(ref(database, 'motoristas'), snapshot => {
    motoristas = processSnapshot(snapshot);
  });
  onValue(ref(database, 'empresas'), snapshot => {
    empresas = processSnapshot(snapshot);
  });
}

function processSnapshot(snapshot) {
  const data = snapshot.val() || {};
  return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

// 3) Mostrar/ocultar seções
function showSection(id) {
  ['form-carga','form-debito','form-motorista','form-empresa','lista'].forEach(sec => {
    document.getElementById(sec).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  const titulo = document.getElementById('form-titulo');
  if (titulo) {
    let text = '';
    switch(id) {
      case 'form-carga': text = 'Registrar Carga'; break;
      case 'form-debito': text = 'Registrar Débito'; break;
      case 'form-motorista': text = 'Cadastro de Motorista'; break;
      case 'form-empresa': text = 'Cadastro de Empresa'; break;
    }
    titulo.innerText = text;
  }
}

// 4) showForm genérico
function showForm(tipo) {
  let sec = 'form-carga';
  if (tipo === 'debito') sec = 'form-debito';
  else if (tipo === 'motorista') sec = 'form-motorista';
  else if (tipo === 'empresa') sec = 'form-empresa';
  showSection(sec);
}

// 5) Renderizar lista de cargas e débitos
function renderizarLista() {
  showSection('lista');
  const registrosDiv = document.getElementById('registros');
  registrosDiv.innerHTML = '';
  registrosDiv.innerHTML += '<h3>Cargas:</h3>';
  cargas.forEach(c => {
    registrosDiv.innerHTML += `
      <div class="registro-card">
        <strong>${c.empresa}</strong> - ${c.origem} ➔ ${c.destino}<br>
        Frete total: R$${c.frete} | Status: ${c.status}<br>
        <button onclick="editarCarga('${c.id}')">Editar</button>
        <button onclick="deletarCarga('${c.id}')">Excluir</button>
        <button onclick="mostrarDetalhes('${c.id}')">Detalhar Transporte</button>
        <div>
          ${mostrarAnexo('Pix', c.pix)}
          ${mostrarAnexo('MDF-e', c.mdfe)}
          ${mostrarAnexo('CT-e', c.cte)}
          ${mostrarAnexo('Nota Fiscal', c.nf)}
          ${mostrarAnexo('Canhoto', c.canhoto)}
          ${mostrarAnexo('Contrato', c.contrato)}
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
  registrosDiv.innerHTML += '<h3>Débitos:</h3>';
  debitos.forEach(d => {
    registrosDiv.innerHTML += `
      <div class="registro-card">
        ${d.data} - ${d.descricao} | R$${d.valor} <button onclick="deletarDebito('${d.id}')">Excluir</button>
      </div>
    `;
  });
}

// 6) Adicionar/atualizar carga
async function adicionarCarga(e) {
  e.preventDefault();
  const id = document.getElementById('editIndex').value;
  const carga = await collectFormCarga();
  if (!id) {
    const newRef = push(ref(database, 'cargas'));
    await set(newRef, carga);
    alert('Carga registrada!');
  } else {
    await update(ref(database, `cargas/${id}`), carga);
    alert('Carga atualizada!');
    document.getElementById('editIndex').value = '';
  }
  document.getElementById('formCarga').reset();
  // Exibe lista; o onValue listener irá repopular automaticamente
  showSection('lista');
}

  document.getElementById('formCarga').reset();
  renderizarLista();
}

function collectFormCarga() {
  return {
    empresa: document.getElementById('empresa').value,
    valorMercadoria: document.getElementById('valorMercadoria').value,
    tipoMercadoria: document.getElementById('tipoMercadoria').value,
    origem: document.getElementById('origem').value,
    destino: document.getElementById('destino').value,
    km: document.getElementById('km').value,
    peso: document.getElementById('peso').value,
    manifestante: document.getElementById('manifestante').value,
    frete: document.getElementById('frete').value,
    custos: document.getElementById('custos').value,
    recebido: document.getElementById('recebido').value,
    areceber: document.getElementById('areceber').value,
    data: document.getElementById('data').value,
    relatorio: document.getElementById('relatorio').value,
    funcionarioMMB: document.getElementById('funcionarioMMB').checked,
    status: 'Em andamento',
    pix: await toBase64(document.getElementById('pix').files[0]),
    mdfe: await toBase64(document.getElementById('mdfe').files[0]),
    cte: await toBase64(document.getElementById('cte').files[0]),
    nf: await toBase64(document.getElementById('nf').files[0]),
    canhoto: await toBase64(document.getElementById('canhoto').files[0]),
    contrato: await toBase64(document.getElementById('contrato').files[0])
  };
}

// 7) Editar e deletar carga
function editarCarga(id) { /* lógica existente */ }
function deletarCarga(id) { /* lógica existente */ }

// 8) Adicionar/deletar débito
async function adicionarDebito(e) { /* lógica existente */ }
function deletarDebito(id) { /* lógica existente */ }

// 9) Motorista/Empresa
async function adicionarMotorista(e) { /* lógica existente */ }
async function adicionarEmpresa(e) { /* lógica existente */ }
function atualizarCamposMotorista() { /* lógica existente */ }

// 10) Detalhes, anexos e utilitários
function mostrarDetalhes(id) { /* lógica existente */ }
function mostrarAnexo(nome, base64) { /* lógica existente */ }
function toBase64(file) { /* lógica existente */ }

// 11) Inicialização após load
window.addEventListener('DOMContentLoaded', () => {
  ({ ref, push, set, onValue, update, remove } = window.firebaseRefs);
  database = window.database;
  carregarRegistrosFirebase();
});

// 12) Expor globalmente
window.showForm = showForm;
window.renderizarLista = renderizarLista;
window.adicionarCarga = adicionarCarga;
window.adicionarDebito = adicionarDebito;
window.adicionarMotorista = adicionarMotorista;
window.adicionarEmpresa = adicionarEmpresa;
window.atualizarCamposMotorista = atualizarCamposMotorista;
window.mostrarDetalhes = mostrarDetalhes;
window.editarCarga = editarCarga;
window.deletarCarga = deletarCarga;
window.deletarDebito = deletarDebito;
