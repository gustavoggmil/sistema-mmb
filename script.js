// script.js — armazenamento em localStorage para testes

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  renderizarLista();
});

function bindUI() {
  window.showForm = showForm;
  window.adicionarCarga = adicionarCarga;
  window.adicionarDebito = adicionarDebito;
  window.editarCarga = editarCarga;
  window.deletarCarga = deletarCarga;
  window.deletarDebito = deletarDebito;
}

function showSection(id) {
  ['form-carga','form-debito','lista'].forEach(sec =>
    document.getElementById(sec).classList.add('hidden')
  );
  document.getElementById(id).classList.remove('hidden');
}

function showForm(tipo) {
  showSection(tipo === 'carga' ? 'form-carga' : 'form-debito');
}

function renderizarLista() {
  showSection('lista');
  const registrosDiv = document.getElementById('registros');
  registrosDiv.innerHTML = '';

  // Cargas
  registrosDiv.insertAdjacentHTML('beforeend','<h3>Cargas:</h3>');
  const cargas = JSON.parse(localStorage.getItem('cargas')||'[]');
  cargas.forEach((c,i) => {
    registrosDiv.insertAdjacentHTML('beforeend',`
      <div class="registro-card">
        <strong>${c.empresa}</strong> - ${c.origem} ➔ ${c.destino}<br>
        Frete: R$${c.frete} | Status: ${c.status}<br>
        <button onclick="editarCarga(${i})">Editar</button>
        <button onclick="deletarCarga(${i})">Excluir</button>
      </div>
    `);
  });

  // Débitos
  registrosDiv.insertAdjacentHTML('beforeend','<h3>Débitos:</h3>');
  const debitos = JSON.parse(localStorage.getItem('debitos')||'[]');
  debitos.forEach((d,i) => {
    registrosDiv.insertAdjacentHTML('beforeend',`
      <div class="registro-card">
        ${d.data} – ${d.descricao} | R$${d.valor}
        <button onclick="deletarDebito(${i})">Excluir</button>
      </div>
    `);
  });
}

function coletarCarga() {
  return {
    empresa: v('empresa'),
    origem: v('origem'),
    destino: v('destino'),
    frete: v('frete'),
    status: 'Em andamento',
    data: v('data')
    // adicione outros campos se quiser...
  };
}

function adicionarCarga(e) {
  e.preventDefault();
  const cargas = JSON.parse(localStorage.getItem('cargas')||'[]');
  cargas.push(coletarCarga());
  localStorage.setItem('cargas', JSON.stringify(cargas));
  document.getElementById('formCarga').reset();
  renderizarLista();
}

function editarCarga(idx) {
  const cargas = JSON.parse(localStorage.getItem('cargas')||'[]');
  const c = cargas[idx];
  // pré-carrega os campos
  vSet('empresa', c.empresa);
  vSet('origem', c.origem);
  vSet('destino', c.destino);
  vSet('frete', c.frete);
  vSet('data', c.data);
  // remove e salva ao reenviar
  cargas.splice(idx,1);
  localStorage.setItem('cargas', JSON.stringify(cargas));
  showSection('form-carga');
}

function deletarCarga(idx) {
  const cargas = JSON.parse(localStorage.getItem('cargas')||'[]');
  cargas.splice(idx,1);
  localStorage.setItem('cargas', JSON.stringify(cargas));
  renderizarLista();
}

function adicionarDebito(e) {
  e.preventDefault();
  const debitos = JSON.parse(localStorage.getItem('debitos')||'[]');
  debitos.push({
    descricao: v('descDebito'),
    valor: v('valorDebito'),
    data: v('dataDebito')
  });
  localStorage.setItem('debitos', JSON.stringify(debitos));
  document.getElementById('form-debito').reset();
  renderizarLista();
}

function deletarDebito(idx) {
  const debitos = JSON.parse(localStorage.getItem('debitos')||'[]');
  debitos.splice(idx,1);
  localStorage.setItem('debitos', JSON.stringify(debitos));
  renderizarLista();
}

function v(id){return document.getElementById(id).value;}
function vSet(id,val){document.getElementById(id).value=val;}
