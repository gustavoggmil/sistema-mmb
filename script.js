function showForm(tipo) {
    document.getElementById("form-carga").classList.add("hidden");
    document.getElementById("form-debito").classList.add("hidden");
    document.getElementById("lista").classList.add("hidden");
    if (tipo === "carga") document.getElementById("form-carga").classList.remove("hidden");
    if (tipo === "debito") document.getElementById("form-debito").classList.remove("hidden");
  }
  
  function showList() {
    document.getElementById("form-carga").classList.add("hidden");
    document.getElementById("form-debito").classList.add("hidden");
    document.getElementById("lista").classList.remove("hidden");
  
    const registrosDiv = document.getElementById("registros");
    registrosDiv.innerHTML = "";
  
    const cargas = JSON.parse(localStorage.getItem("cargas") || "[]");
    const debitos = JSON.parse(localStorage.getItem("debitos") || "[]");
  
    registrosDiv.innerHTML += "<h3>Cargas:</h3>";
    cargas.forEach((c, i) => {
      registrosDiv.innerHTML += `
        <div style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
          <strong>${c.empresa}</strong> - ${c.origem} ➔ ${c.destino}<br>
          Frete: R$${c.frete} | Status: ${c.status}<br>
          <button onclick="editarCarga(${i})">Editar</button>
          <div>
            ${mostrarAnexo("Pix", c.pix)}
            ${mostrarAnexo("MDF-e", c.mdfe)}
            ${mostrarAnexo("CT-e", c.cte)}
            ${mostrarAnexo("Nota Fiscal", c.nf)}
            ${mostrarAnexo("Canhoto", c.canhoto)}
            ${mostrarAnexo("Contrato", c.contrato)}
          </div>
        </div>
      `;
    });
  
    registrosDiv.innerHTML += "<h3>Débitos:</h3>";
    debitos.forEach(d => {
      registrosDiv.innerHTML += `<div>${d.data} - ${d.descricao} | R$${d.valor}</div>`;
    });
  }
  
  function mostrarAnexo(nome, base64) {
    if (!base64) return "";
    return `<a href="${base64}" target="_blank">📎 ${nome}</a><br>`;
  }
  
  async function adicionarCarga(e) {
    e.preventDefault();
    const cargas = JSON.parse(localStorage.getItem("cargas") || "[]");
    const index = document.getElementById("editIndex")?.value;
  
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
  
    if (index === "" || index === undefined) {
      cargas.push(carga);
      alert("Carga registrada!");
    } else {
      cargas[index] = carga;
      alert("Carga atualizada!");
      document.getElementById("editIndex").value = "";
    }
  
    localStorage.setItem("cargas", JSON.stringify(cargas));
    e.target.reset();
    showList();
  }
  
  function editarCarga(index) {
    const cargas = JSON.parse(localStorage.getItem("cargas") || "[]");
    const c = cargas[index];
  
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
  
    if (!document.getElementById("editIndex")) {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "editIndex";
      hidden.value = index;
      document.getElementById("formCarga").appendChild(hidden);
    } else {
      document.getElementById("editIndex").value = index;
    }
  
    showForm("carga");
  }
  
  function adicionarDebito(e) {
    e.preventDefault();
    const debito = {
      descricao: document.getElementById("descDebito").value,
      valor: document.getElementById("valorDebito").value,
      data: document.getElementById("dataDebito").value
    };
    const debitos = JSON.parse(localStorage.getItem("debitos") || "[]");
    debitos.push(debito);
    localStorage.setItem("debitos", JSON.stringify(debitos));
    alert("Débito registrado!");
    e.target.reset();
  }
  
  function toBase64(file) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
  