let { contas, saques, depositos, transferencias } = require("../bancodedados");
const { format } = require("date-fns");

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta e o valor são obrigatórios" });
  }

  const contaEncontrada = contas.find(
    (conta) => Number(conta.numero) === Number(numero_conta)
  );

  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }

  if (valor <= 0) {
    return res
      .status(400)
      .json({ mensagem: "O valor não pode ser menor ou igual a zero" });
  }

  contaEncontrada.saldo += valor;

  const registro = {
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor,
  };

  depositos.push(registro);

  return res.status(201).send();
};

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || !valor || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta, valor e a senha são obrigatórios",
    });
  }

  const contaEncontrada = contas.find(
    (conta) => Number(conta.numero) === Number(numero_conta)
  );

  if (!contaEncontrada) {
    return res.status(404).json({ mensagem: "Conta não encontrada" });
  }

  if (contaEncontrada.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha Incorreta" });
  }

  if (contaEncontrada.saldo < valor) {
    return res.status(403).json({ mensagem: "Saldo Insuficiente" });
  }

  contaEncontrada.saldo -= valor;

  const registro = {
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor,
  };

  saques.push(registro);

  return res.status(201).send();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res.status(400).json({
      mensagem:
        "O número da conta de origem, de destino, valor e a senha são obrigatórios",
    });
  }

  const contaEncontradaOrigem = contas.find((conta) =>
    Number(conta.numero === numero_conta_origem)
  );

  if (!contaEncontradaOrigem) {
    return res.status(404).json({ mensagem: "Conta de origem não encotrada" });
  }

  const contaEncontradaDestino = contas.find((conta) =>
    Number(conta.numero === numero_conta_destino)
  );

  if (!contaEncontradaOrigem) {
    return res.status(404).json({ mensagem: "Conta de Destino não encotrada" });
  }

  if (contaEncontradaOrigem.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha Inválida" });
  }

  if (contaEncontradaOrigem.saldo < valor) {
    return res.status(403).json({ mensagem: "Saldo Insuficiente" });
  }

  contaEncontradaOrigem.saldo -= valor;
  contaEncontradaDestino.saldo += valor;

  const registro = {
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };

  transferencias.push(registro);

  return res.status(201).send();
};

module.exports = {
  depositar,
  sacar,
  transferir,
};
