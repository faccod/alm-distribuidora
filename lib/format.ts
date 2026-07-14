export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado ao CD',
  EM_SEPARACAO: 'Em separação',
  DESPACHADO: 'Despachado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const STATUS_COR: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-700',
  ENVIADO: 'bg-blue-100 text-blue-700',
  EM_SEPARACAO: 'bg-yellow-100 text-yellow-700',
  DESPACHADO: 'bg-purple-100 text-purple-700',
  ENTREGUE: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};
