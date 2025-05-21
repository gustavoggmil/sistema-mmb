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

// 3) Adicionar ou atualizar carga
async function adicionarCarga(e) {
  e.preventDefault();
  const id = document.getElementById("editIndex").value;
  const carga = {
    empresa: document.getElementById("empresa").value,
    valorMercadoria: document.getElementById("valorMercadoria").value,
    tipoMercadoria: document.getElementById("tipoMercadoria").value,
    origem: document.getElementById("origem").value,
    destino: document.getElementById("destino").value,
    km: document.getElementById("km").value,
    peso: document.getElementById("peso").value,
    manifestante: document.getElementById("manifestante").value,
    frete: document.getElementById("frete").value,
    custos: document.getElementById("custos").value,
    recebido: document.getElementById("recebido").value,
    areceber: document.getElementById("areceber").value,
    data: document.getElementById("data").value,
    relatorio: document.getElementById("relatorio").value,
    funcionarioMMB: document.getElementById("funcionarioMMB").checked,
    status: "Em andamento",
    pix: await toBase64(document.getElementById("pix").files[0]),
    mdfe: await toBase64(document.getElementById("mdfe").files[0]),
    cte: await toBase64(document.getElementById("cte").files[0]),
    nf: await toBase64(document.getElementById("nf").files[0]),
    canhoto: await toBase64(document.getElementById("canhoto").files[0]),
    contrato: await toBase64(document.getElementById("contrato").files[0])
  };

  if (!id) {
    const newRef = push(ref(database, 'cargas'));
    await set(newRef, carga);
    alert("Carga registrada!");
  } else {
    await update(ref(database, `cargas/${id}`), carga);
    alert("Carga atualizada!");
    document.getElementById("editIndex").value = "";
  }

  document.getElementById('formCarga').reset();
  renderizarLista();
}

// 4) Editar e deletar carga
function editarCarga(id) {
  const c = cargas.find(item => item.id === id);
  if (!c) return;
  document.getElementById("empresa").value = c.empresa;
  document.getElementById("valorMercadoria").value = c.valorMercadoria;
  document.getElementById("tipoMercadoria").value = c.tipoMercadoria;
  document.getElementById("origem").value = c.origem;
  document.getElementById("destino").value = c.destino;
  document.getElementById("km").value = c.km;
  document.getElementById("peso").value = c.peso;
  document.getElementById("manifestante").value = c.manifestante;
  document.getElementById("frete").value = c.frete;
  document.getElementById("custos").value = c.custos;
  document.getElementById("recebido").value = c.recebido;
  document.getElementById("areceber").value = c.areceber;
  document.getElementById("data").value = c.data;
  document.getElementById("relatorio").value = c.relatorio;
  document.getElementById("funcionarioMMB").checked = c.funcionarioMMB;
  document.getElementById("editIndex").value = id;
  document.getElementById("form-titulo").innerText = `Editando carga: ${c.empresa}`;
  showSection('form-carga');
}
function deletarCarga(id) {
  const motivo = prompt("Motivo da exclusão:");
  const senha = prompt("Senha para exclusão:");
  if (senha !== "4619") return alert("Senha incorreta.");
  if (!motivo) return alert("Motivo é obrigatório.");
  remove(ref(database, `cargas/${id}`));
  renderizarLista();
}

// 5) Adicionar e deletar débito
async function adicionarDebito(e) {
  e.preventDefault();
  const debito = {
    descricao: document.getElementById("descDebito").value,
    valor: document.getElementById("valorDebito").value,
    data: document.getElementById("dataDebito").value
  };
  const newRef = push(ref(database, 'debitos'));
  await set(newRef, debito);
  alert("Débito registrado!");
  e.target.reset();
  renderizarLista();
}
function deletarDebito(id) {
  const motivo = prompt("Motivo da exclusão:");
  const senha = prompt("Senha para exclusão:");
  if (senha !== "4619") return alert("Senha incorreta.");
  if (!motivo) return alert("Motivo é obrigatório.");
  remove(ref(database, `debitos/${id}`));
  renderizarLista();
}
function editarCarga(id) {
  // ... lógica existente ...
}
function deletarCarga(id) {
  // ... lógica existente ...
}

// 5) Adicionar e deletar débito
async function adicionarDebito(e) {
  e.preventDefault();
  // ... lógica existente ...
}
function deletarDebito(id) {
  // ... lógica existente ...
}

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
  const tipoSel = document.getElementById('tipoMotorista').value;
  if (tipoSel) document.getElementById(`field-${tipoSel}`).classList.remove('hidden');
}

// 9) Detalhar transporte
function mostrarDetalhes(id) {
  const panel = document.getElementById(`detail-${id}`);
  panel.classList.toggle('visible');
  panel.classList.toggle('hidden');
}

// 10) Utilitário de anexos e base64
function mostrarAnexo(nome, base64) {
  if (!base64) return "";
  return `<a href="${base64}" target="_blank">📎 ${nome}</a><br>`;
}
function toBase64(file) {
  return new Promise(resolve => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// 11) Inicialização e expor funções globais
window.addEventListener('load', () => {
  carregarRegistrosFirebase();
});

// Expor funções para HTML onclick
window.showForm = showForm;
window.renderizarLista = renderizarLista;
window.showList = renderizarLista;
window.adicionarCarga = adicionarCarga;
window.adicionarDebito = adicionarDebito;
window.adicionarMotorista = adicionarMotorista;
window.adicionarEmpresa = adicionarEmpresa;
window.atualizarCamposMotorista = atualizarCamposMotorista;
window.mostrarDetalhes = mostrarDetalhes;
window.editarCarga = editarCarga;
window.deletarCarga = deletarCarga;
window.deletarDebito = deletarDebito;
