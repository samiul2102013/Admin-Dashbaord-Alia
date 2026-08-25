'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Pencil, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import { getErrorMessage } from '@/lib/api-client';
import {
  listPresentations,
  updatePresentation,
  SECTION_LABELS,
} from '@/lib/services/presentations';
import type { Presentation } from '@/types/presentations';

const EDITABLE_KEYS = ['news', 'shorts', 'consultation', 'home', 'initiatives', 'emirates'];

export default function WebsiteContentPanel() {
  const [items, setItems] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Presentation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    listPresentations()
      .then((list) => {
        if (!mounted) return;
        const ordered = EDITABLE_KEYS
          .map((key) => list.find((p) => p.key === key))
          .filter(Boolean) as Presentation[];
        setItems(list.length === ordered.length ? ordered : list);
      })
      .catch((e) => {
        if (mounted) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updatePresentation(editing.id, {
        title: editing.title,
        titleAr: editing.titleAr,
        description: editing.description,
        descriptionAr: editing.descriptionAr,
        badge: editing.badge,
        heroImage: editing.heroImage,
        published: editing.published,
      });
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSaved(true);
      setTimeout(() => setEditing(null), 700);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const setField = (patch: Partial<Presentation>) => {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      {error && (
        <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-text-secondary text-sm font-[family-name:var(--font-poppins)]">
          No presentations found. Run the backend seed command to create the default pages.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-6 p-5 rounded-[12px] border border-secondary/40 bg-surface"
            >
              <div className="flex items-center gap-4 min-w-0">
                {item.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.heroImage}
                    alt={item.title}
                    className="h-[64px] w-[96px] rounded-md object-cover bg-secondary/20 shrink-0"
                  />
                ) : (
                  <div className="flex h-[64px] w-[96px] items-center justify-center rounded-md bg-secondary/20 shrink-0">
                    <span className="text-[10px] text-text-secondary font-[family-name:var(--font-poppins)]">
                      No image
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary uppercase font-[family-name:var(--font-manrope)]">
                      {SECTION_LABELS[item.key] ?? item.key}
                    </span>
                    {!item.published && (
                      <span className="rounded-full bg-danger/10 px-3 py-0.5 text-xs font-bold text-danger uppercase">
                        Unpublished
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-black leading-snug truncate font-[family-name:var(--font-poppins)]">
                    {item.title || 'No title set'}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 truncate font-[family-name:var(--font-poppins)]">
                    {item.description || 'No description set'}
                  </p>
                </div>
              </div>

              <Button variant="secondary" onClick={() => { setEditing(item); setError(''); setSaved(false); }}>
                <Pencil size={16} />
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit page presentation" size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm font-semibold text-success font-[family-name:var(--font-poppins)]">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !editing}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="flex flex-col gap-5">
            <Input label="Section" value={SECTION_LABELS[editing.key] ?? editing.key} disabled />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Title (English)" value={editing.title} onChange={(e) => setField({ title: e.target.value })} />
              <Input label="Title (Arabic)" value={editing.titleAr} onChange={(e) => setField({ titleAr: e.target.value })} />
            </div>
            <Textarea label="Description (English)" rows={3} value={editing.description} onChange={(e) => setField({ description: e.target.value })} />
            <Textarea label="Description (Arabic)" rows={3} value={editing.descriptionAr} onChange={(e) => setField({ descriptionAr: e.target.value })} />
            <Input label="Badge" value={editing.badge} onChange={(e) => setField({ badge: e.target.value })} />
            <Input label="Hero Image URL" value={editing.heroImage} onChange={(e) => setField({ heroImage: e.target.value })} />

            <label className="flex items-center gap-3 cursor-pointer font-[family-name:var(--font-poppins)]">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setField({ published: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-semibold">Published (visible on the website)</span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
