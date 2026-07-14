'use client';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { brl } from '../lib/format';

type Item = { nome: string; cor: string | null; receita: number; itens: number };

export default function VendasCategoriaChart({ data }: { data: Item[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="nome"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const d = payload[0].payload as Item;
                return (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{d.nome}</p>
                    <p className="text-xs text-slate-500">{d.itens} itens vendidos</p>
                    <p className="font-bold text-green-600 mt-1">{brl(d.receita)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="receita" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.cor || '#0f172a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
