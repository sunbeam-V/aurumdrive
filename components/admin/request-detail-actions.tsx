'use client';

import {LoaderCircle} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

const statuses = ['new', 'in_progress', 'awaiting_details', 'confirmed', 'completed', 'cancelled', 'archived'];

export function RequestDetailActions({id, currentStatus}: {id: string; currentStatus: string}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState('');

  async function save() {
    setLoading(true);
    const token = (await fetch('/api/admin/auth/csrf').then((response) => response.json())).token;
    const response = await fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json', 'x-csrf-token': token},
      body: JSON.stringify({status, comment: comment || undefined})
    });
    setLoading(false);
    if (response.ok) {
      setComment('');
      router.refresh();
    }
  }

  return <div className="mt-8 border-t border-white/10 pt-6"><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Статус<select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl bg-obsidian px-4">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label><label className="grid gap-2 text-sm">Внутренний комментарий<textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-24 rounded-xl bg-obsidian p-4" maxLength={2000}/></label></div><button type="button" onClick={save} disabled={loading} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-aurum px-6 font-semibold text-obsidian">{loading && <LoaderCircle size={16} className="animate-spin"/>}Сохранить изменения</button></div>;
}
