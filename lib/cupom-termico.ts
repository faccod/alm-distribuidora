// Gera o texto de cupom térmico (58mm = 32 colunas, 80mm = 42 colunas)
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Item = {
  quantidade: number;
  produtoNome: string;
  unidade: string;
  precoUnit: number;
  total: number;
};

type Pedido = {
  numero: number;
  data: Date | string;
  cliente: { nome: string; cidade?: string | null; estado?: string | null; endereco?: string | null; contatos?: string | null };
  vendedor: { nome: string };
  itens: Item[];
  total: number;
  desconto?: number;
  condicaoPgto?: string | null;
  observacoes?: string | null;
};

function pad(value: string | number, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const s = String(value);
  if (s.length >= width) return s.slice(0, width);
  const padding = ' '.repeat(width - s.length);
  if (align === 'right') return padding + s;
  if (align === 'center') {
    const left = Math.floor((width - s.length) / 2);
    return ' '.repeat(left) + s + ' '.repeat(width - s.length - left);
  }
  return s + padding;
}

function line(char = '-', width = 32): string {
  return char.repeat(width);
}

function fmt(v: number, width = 10): string {
  return v.toFixed(2).replace('.', ',').padStart(width, ' ');
}

export function gerarCupom58mm(pedido: Pedido): string {
  const W = 32;
  const L: string[] = [];

  L.push(pad('ALM DISTRIBUIDORA', W, 'center'));
  L.push(pad('Rua Alberto Rodrigues Baião, 572', W, 'center'));
  L.push(pad('Bairro São João - Ubá/MG', W, 'center'));
  L.push(pad('CEP 36507-124', W, 'center'));
  L.push(pad('(32) 99976-2176', W, 'center'));
  L.push(line('=', W));
  L.push('');

  L.push(pad('PEDIDO #' + String(pedido.numero).padStart(6, '0'), W, 'center'));
  const data = typeof pedido.data === 'string' ? new Date(pedido.data) : pedido.data;
  L.push(pad(format(data, "dd/MM/yyyy HH:mm", { locale: ptBR }), W, 'center'));
  L.push(pad('Vendedor: ' + pedido.vendedor.nome.split(' (')[0], W, 'center'));
  L.push(line('=', W));
  L.push('');

  L.push('Cliente:');
  L.push(pedido.cliente.nome.slice(0, W));
  if (pedido.cliente.endereco) L.push(pedido.cliente.endereco.slice(0, W));
  if (pedido.cliente.cidade) {
    const cidade = `${pedido.cliente.cidade || ''}/${pedido.cliente.estado || ''}`;
    L.push(cidade.slice(0, W));
  }
  L.push('');

  L.push(line('-', W));
  L.push(pad('ITENS', W, 'center'));
  L.push(line('-', W));

  for (const item of pedido.itens) {
    // Linha do item: qtd x nome
    const qtdStr = `${item.quantidade}x`;
    const nome = item.produtoNome;
    const headerLine = `${qtdStr} ${nome}`;
    L.push(headerLine.length > W ? headerLine.slice(0, W) : headerLine);

    // Linha do preço: UN valor unit x total
    const priceLine = `  ${item.unidade} ${fmt(item.precoUnit, 7)} x ${item.quantidade} = ${fmt(item.total, 8)}`;
    L.push(priceLine);
    L.push('');
  }

  L.push(line('-', W));

  const subtotal = pedido.total + (pedido.desconto || 0);
  L.push(`${pad('SUBTOTAL', W - 11)}${fmt(subtotal, 11)}`);
  if (pedido.desconto && pedido.desconto > 0) {
    L.push(`${pad('DESCONTO', W - 11)}${fmt(-pedido.desconto, 11)}`);
  }
  L.push(line('=', W));
  L.push(`${pad('TOTAL', W - 11)}${fmt(pedido.total, 11)}`);
  L.push(line('=', W));
  L.push('');

  if (pedido.condicaoPgto) {
    L.push('Pgto: ' + pedido.condicaoPgto.slice(0, W));
  }
  if (pedido.observacoes) {
    L.push('');
    L.push('Obs:');
    const obs = pedido.observacoes.slice(0, 80);
    for (let i = 0; i < obs.length; i += W) {
      L.push(obs.slice(i, i + W));
    }
  }

  L.push('');
  L.push(line('=', W));
  L.push(pad('Obrigado pela preferencia!', W, 'center'));
  L.push(pad('ALM - ' + new Date().getFullYear(), W, 'center'));
  L.push('');
  L.push('');

  return L.join('\n');
}

// ESC/POS: converte texto em comandos da impressora térmica
export function textoParaESCPOS(texto: string): Uint8Array {
  const enc = new TextEncoder();
  const cmds: number[] = [];
  // Initialize
  cmds.push(0x1B, 0x40);
  // Text content
  for (const char of texto) {
    const code = char.charCodeAt(0);
    // CP850 / Latin-1 simple mapping
    if (code < 128) {
      cmds.push(code);
    } else if (code === 0xA7 || code === 0xC7) {
      cmds.push(0x80); // Ç
    } else if (code === 0xA3) {
      cmds.push(0x9C); // £
    } else if (code === 0xC2 || code === 0xA2) {
      cmds.push(0x9D); // ¢
    } else {
      // Fallback: replace com ?
      cmds.push(0x3F);
    }
  }
  // Feed and cut
  cmds.push(0x1B, 0x64, 0x05); // Feed 5 lines
  cmds.push(0x1D, 0x56, 0x41, 0x10); // Partial cut (opcional, nem toda impressora suporta)
  return new Uint8Array(cmds);
}
