'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function MarcaDialog({
  onCriada,
}: {
  onCriada?: (marca: { id: number; nome: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
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
      const r = await fetch('/api/marcas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });
      if (!r.ok) {
        const d = await r.json();
        setErro(d.error || 'Erro ao criar');
        return;
      }
      const marca = await r.json();
      toast.success('Marca criada!');
      onCriada?.(marca);
      setOpen(false);
      setNome('');
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
          <Plus className="w-3.5 h-3.5" />
          Nova marca
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar nova marca</DialogTitle>
          <DialogDescription>
            A marca ficará disponível no cadastro de produtos
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nome da marca *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Souza Cruz, BAT, Philip Morris..."
              autoFocus
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando} className="flex-1">
              {salvando ? 'Criando...' : 'Criar marca'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
