// script.js
// =====================
// 0) Inicialização após DOMContentLoaded
// =====================
let ref, push, set, onValue, update, remove, database;

document.addEventListener('DOMContentLoaded', () => {
  // importar funções do Firebase expostas no HTML
  ({ ref, push, set, onValue, update, remove } = window.firebaseRefs);
  database = window.database;
  initApp();
});

// =====================
// 1) Estado global
// =====================
let cargas = [];
let debitos = [];
let motoristas = [];
let empresas = [];

// =====================
// 2) Inicialização da aplicação
// =====================
function initApp() {
  bindUI();
  setupFirebaseListeners();
  showSection('lista');
}

// =====================
// 3) Bind de eventos de UI
// =====================
function bindUI() {
  window.showForm = showForm;
  window.adicionarCarga = adicionarCarga;
  window.adicionarDebito = adicionarDebito;
  window.adicionarMotorista = adicionarMotorista;
  window.adicionarEmpresa = adicionarEmpresa;
  window.editarCarga = editarCarga;
  window.deletarCarga = deletarCarga;
  window.deletarDebito = deletarDebito;
  window.mostrarDetalhes = mostrarDetalhes;
  window.atualizarCamposMotorista = atualizarCamposMotorista;
}

// =====================
// 4) Configurar listeners do Firebase
// =====================
function setupFirebaseListeners() {
  onValue(ref(database, 'cargas'), snap => {
    cargas = snapshotToArray(snap);
    renderizarLista();
  });
  onValue(ref(database, 'debitos'), snap => {
    debitos = snapshotToArray(snap);
    renderizarLista();
  });
  onValue(ref(database, 'motoristas'), snap => {
    motoristas = snapshotToArray(snap);
  });
  onValue(ref(database, 'empresas'), snap => {
    empresas = snapshotToArray(snap);
  });
}

// =====================
// 5) Utilitário: converte snapshot para array
// =====================
function snapshotToArray(snapshot) {
  const data = snapshot.val() || {};
  return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

// =====================
// 6) Navegação entre seções
// =====================
function showSection(id) {
  ['form-carga','form-debito','form-motorista','form-empresa','lista']
    .forEach(sec => document.getElementById(sec).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  updateFormTitle(id);
}

function updateFormTitle(sectionId) {
  const titles = {
    'form-carga': 'Registrar Carga',
    'form-debito': 'Registrar Débito',
    'form-motorista': 'Cadastro de Motorista',
    'form-empresa': 'Cadastro de Empresa'
  };
  const titulo = document.getElementById('form-titulo');
  if (titulo) titulo.innerText = titles[sectionId] || '';
}

// =====================
// 7) Abrir formulário específico
// =====================
function showForm(tipo) {
  const map = {
    carga: 'form-carga',
    debito: 'form-debito',
    motorista: 'form-motorista',
    empresa: 'form-empresa'
  };
  showSection(map[tipo]);
}

// =====================
// 8) Renderização da lista
// =====================
function renderizarLista() {
  showSection('lista');
  const cont = document.getElementById('registros');
  cont.innerHTML = '';
  // Cargas
  cont.insertAdjacentHTML('beforeend','<h3>Cargas:</h3>');
  cargas.forEach(c => cont.insertAdjacentHTML('beforeend', buildCargaCard(c)));
  // Débitos
  cont.insertAdjacentHTML('beforeend','<h3>Débitos:</h3>');
  debitos.forEach(d => cont.insertAdjacentHTML('beforeend', buildDebitoCard(d)));
}

function buildCargaCard(c) {
  return `
    <div class="registro-card">
      <strong>${c.empresa}</strong> - ${c.origem} ➔ ${c.destino}<br>
      Frete total: R$${c.frete} | Status: ${c.status}<br>
      <button onclick="editarCarga('${c.id}')">Editar</button>
      <button onclick="deletarCarga('${c.id}')">Excluir</button>
      <button onclick="mostrarDetalhes('${c.id}')">Detalhar Transporte</button>
      <div>${['pix','mdfe','cte','nf','canhoto','contrato'].map(key=>mostrarAnexo(key.toUpperCase(),c[key])).join('')}</div>
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
}

function buildDebitoCard(d) {
  return `
    <div class="registro-card">
      ${d.data} - ${d.descricao} | R$${d.valor}
      <button onclick="deletarDebito('${d.id}')">Excluir</button>
    </div>
  `;
}

// =====================
// 9) Coleta de dados do formulário de carga
// =====================
async function collectFormCarga() {
  const toBase = file=>file ? await toBase64(file) : null;
  return {
    empresa: v('empresa'), valorMercadoria: v('valorMercadoria'), tipoMercadoria: v('tipoMercadoria'),
    origem: v('origem'), destino: v('destino'), km: v('km'), peso: v('peso'), manifestante: v('manifestante'),
    frete: v('frete'), custos: v('custos'), recebido: v('recebido'), areceber: v('areceber'), data: v('data'),
    relatorio: v('relatorio'), funcionarioMMB: cb('funcionarioMMB'), status:'Em andamento',
    pix: await toBase(document.getElementById('pix').files[0]),
    mdfe: await toBase(document.getElementById('mdfe').files[0]),
    cte: await toBase(document.getElementById('cte').files[0]),
    nf: await toBase(document.getElementById('nf').files[0]),
    canhoto: await toBase(document.getElementById('canhoto').files[0]),
    contrato: await toBase(document.getElementById('contrato').files[0])
  };
}

function v(id){return document.getElementById(id).value}
function cb(id){return document.getElementById(id).checked}

// =====================
// 10) Ações de carga
// =====================
async function adicionarCarga(e) {
  e.preventDefault();
  const id = v('editIndex');
  const data = await collectFormCarga();
  if(!id) { const n=push(ref(database,'cargas')); await set(n,data); alert('Carga registrada!'); }
  else     { await update(ref(database,`cargas/${id}`),data); alert('Carga atualizada!'); }
  document.getElementById('formCarga').reset();
  showSection('lista');
}

function editarCarga(id) {
  const c = cargas.find(x=>x.id===id); if(!c) return;
  showSection('form-carga'); document.getElementById('editIndex').value=id;
  ['empresa','valorMercadoria','tipoMercadoria','origem','destino','km','peso','manifestante','frete','custos','recebido','areceber','data','relatorio']
    .forEach(f=>document.getElementById(f).value=c[f]);
  document.getElementById('funcionarioMMB').checked=c.funcionarioMMB;
}

function deletarCarga(id) {
  const motivo=prompt('Motivo:'), senha=prompt('Senha:');
  if(senha!=='4619'||!motivo) return alert('Cancelado.');
  remove(ref(database,`cargas/${id}`));
}

// =====================
// 11) Ações de débito
// =====================
async function adicionarDebito(e) {
  e.preventDefault();
  const d={descricao:v('descDebito'),valor:v('valorDebito'),data:v('dataDebito')};
  const n=push(ref(database,'debitos')); await set(n,d); alert('Débito registrado!');
  document.getElementById('form-debito').reset(); showSection('lista');
}

function deletarDebito(id) {
  const motivo=prompt('Motivo:'), senha=prompt('Senha:');
  if(senha!=='4619'||!motivo) return alert('Cancelado.');
  remove(ref(database,`debitos/${id}`));
}

// =====================
// 12) Motorista & empresa
// =====================
async function adicionarMotorista(e) {
  e.preventDefault();
  const tipo=v('tipoMotorista'), m={nome:v('nomeMotorista'),tipo};
  if(tipo==='autonomo') m.cpf=v('cpfAutonomo');
  if(tipo==='contratado') m.empresa=v('empresaContratada');
  await set(push(ref(database,'motoristas')),m);
  alert('Motorista registrado!'); document.getElementById('form-motorista').reset(); atualizarCamposMotorista();
}

async function adicionarEmpresa(e) {
  e.preventDefault();
  const emp={nome:v('nomeEmpresa'),cnpj:v('cnpjEmpresa'),contato:v('contatoEmpresa')};
  await set(push(ref(database,'empresas')),emp);
  alert('Empresa registrada!'); document.getElementById('form-empresa').reset();
}

function atualizarCamposMotorista() {
  ['autonomo','contratado','mmb'].forEach(t=>document.getElementById(`field-${t}`).classList.add('hidden'));
  const s=v('tipoMotorista'); if(s) document.getElementById(`field-${s}`).classList.remove('hidden');
}

// =====================
// 13) Detalhes e anexos
// =====================
function mostrarDetalhes(id) {
  document.getElementById(`detail-${id}`).classList.toggle('hidden');
}

function mostrarAnexo(nome, base64) {
  return base64?`<a href="${base64}" target="_blank">📎 ${nome}</a><br>`:'';
}

function toBase64(file) {
  return new Promise(res=>{ if(!file) return res(null); const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); });
}
