'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Check } from 'lucide-react';
import {
  Cigarette, Package, FileText, Circle, Flame, Leaf, Sparkles, Droplets,
  Gift, Candy, Coffee, Wine, Beer, Cookie, Cake, Pizza, Drumstick, Apple, Carrot, Fish,
  Box, Archive, Briefcase, ShoppingBag, ShoppingCart, Truck, Store, Tag, Star,
  Heart, Zap, Sun, Moon, Cloud, Phone, Mail, MapPin, Wrench, Layers, Sticker,
  Pill, Syringe, Brush, Scissors, Hammer, Plug, Battery, Lightbulb, Key, Lock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '../lib/utils';

const ICONES: { nome: string; Icon: any }[] = [
  { nome: 'cigarette', Icon: Cigarette },
  { nome: 'package', Icon: Package },
  { nome: 'box', Icon: Box },
  { nome: 'archive', Icon: Archive },
  { nome: 'file-text', Icon: FileText },
  { nome: 'circle', Icon: Circle },
  { nome: 'flame', Icon: Flame },
  { nome: 'leaf', Icon: Leaf },
  { nome: 'sparkles', Icon: Sparkles },
  { nome: 'droplets', Icon: Droplets },
  { nome: 'gift', Icon: Gift },
  { nome: 'candy', Icon: Candy },
  { nome: 'coffee', Icon: Coffee },
  { nome: 'wine', Icon: Wine },
  { nome: 'beer', Icon: Beer },
  { nome: 'cookie', Icon: Cookie },
  { nome: 'cake', Icon: Cake },
  { nome: 'pizza', Icon: Pizza },
  { nome: 'drumstick', Icon: Drumstick },
  { nome: 'apple', Icon: Apple },
  { nome: 'carrot', Icon: Carrot },
  { nome: 'fish', Icon: Fish },
  { nome: 'briefcase', Icon: Briefcase },
  { nome: 'shopping-bag', Icon: ShoppingBag },
  { nome: 'shopping-cart', Icon: ShoppingCart },
  { nome: 'truck', Icon: Truck },
  { nome: 'store', Icon: Store },
  { nome: 'tag', Icon: Tag },
  { nome: 'star', Icon: Star },
  { nome: 'heart', Icon: Heart },
  { nome: 'zap', Icon: Zap },
  { nome: 'sun', Icon: Sun },
  { nome: 'moon', Icon: Moon },
  { nome: 'cloud', Icon: Cloud },
  { nome: 'phone', Icon: Phone },
  { nome: 'mail', Icon: Mail },
  { nome: 'map-pin', Icon: MapPin },
  { nome: 'wrench', Icon: Wrench },
  { nome: 'layers', Icon: Layers },
  { nome: 'sticker', Icon: Sticker },
  { nome: 'pill', Icon: Pill },
  { nome: 'syringe', Icon: Syringe },
  { nome: 'brush', Icon: Brush },
  { nome: 'scissors', Icon: Scissors },
  { nome: 'hammer', Icon: Hammer },
  { nome: 'plug', Icon: Plug },
  { nome: 'battery', Icon: Battery },
  { nome: 'lightbulb', Icon: Lightbulb },
  { nome: 'key', Icon: Key },
  { nome: 'lock', Icon: Lock },
];

const CORES = [
  '#dc2626', '#ea580c', '#f59e0b', '#16a34a', '#0891b2',
  '#2563eb', '#7c3aed', '#db2777', '#64748b', '#0f172a',
  '#a16207', '#059669', '#0d9488', '#0284c7', '#9333ea',
];

const MAPA_NOMES: Record<string, any> = Object.fromEntries(ICONES.map((i) => [i.nome, i.Icon]));
export function IconePorNome({ nome, className, cor }: { nome?: string | null; className?: string; cor?: string | null }) {
  const Icon = (nome && MAPA_NOMES[nome]) || Package;
  return <Icon className={className} style={cor ? { color: cor } : undefined} />;
}

export function CategoriaDialog({
  onCriada,
}: {
  onCriada?: (categoria: { id: number; nome: string; icone: string | null; cor: string | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('package');
  const [cor, setCor] = useState('#64748b');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Nome é obrigatório');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const r = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, icone, cor }),
      });
      if (!r.ok) {
        const d = await r.json();
        setErro(d.error || 'Erro ao criar');
        return;
      }
      const cat = await r.json();
      toast.success('Categoria criada!');
      onCriada?.(cat);
      setOpen(false);
      setNome('');
      setIcone('package');
      setCor('#64748b');
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-3.5 h-3.5" />Nova categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar nova categoria</DialogTitle>
          <DialogDescription>Escolha um nome, ícone e cor para identificar a categoria</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Acessórios, BEBIDAS, Tabacaria..."
              autoFocus
            />
          </div>

          <div>
            <Label>Cor</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={cn(
                    'h-10 rounded-lg border-2 transition-all',
                    cor === c ? 'border-slate-900 dark:border-slate-100 scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 mt-1 max-h-72 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
              {ICONES.map(({ nome: n, Icon }) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIcone(n)}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-md transition-all relative',
                    icone === n
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  title={n}
                >
                  <Icon className="w-4 h-4" />
                  {icone === n && (
                    <Check className="w-3 h-3 absolute top-0.5 right-0.5" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">Selecionado: <b>{icone}</b></p>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 mb-2">Preview</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: cor + '20' }}
              >
                <IconePorNome nome={icone} className="w-5 h-5" cor={cor} />
              </div>
              <span className="font-semibold">{nome || 'Nome da categoria'}</span>
            </div>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="flex-1">
              {salvando ? 'Criando...' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
