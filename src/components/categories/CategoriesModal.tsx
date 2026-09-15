'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import StatusField from '@/components/shared/StatusField';
import ArabicField from '@/components/shared/ArabicField';
import TranslationProvider from '@/components/shared/TranslationProvider';
import TranslationToolbar from '@/components/shared/TranslationToolbar';
import { getCategory } from '@/lib/services/categories';
import { getIsMachineFlag, getTranslationState, type TranslationState } from '@/lib/translation';
import { getErrorMessage } from '@/lib/api-client';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { Category } from '@/types/categories';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export default function CategoriesModal({ isOpen, onClose, category }: CategoriesModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [categoryName, setCategoryName] = useState('');
  const [categoryAr, setCategoryAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Draft');
  const [machineFlags, setMachineFlags] = useState<Record<string, boolean>>({});
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setCategoryName(category.category);
      setCategoryAr(category.categoryAr || '');
      setDescription(category.description);
      setDescriptionAr(category.descriptionAr || '');
      setDate(category.date);
      setStatus(category.status);
      setMachineFlags({
        categoryAr: getIsMachineFlag(category, 'categoryAr'),
        descriptionAr: getIsMachineFlag(category, 'descriptionAr'),
      });
      setFailedFields(new Set());
    } else {
      setCategoryName('');
      setCategoryAr('');
      setDescription('');
      setDescriptionAr('');
      setDate('');
      setStatus('Draft');
      setMachineFlags({});
      setFailedFields(new Set());
    }

    setError('');
    createCategory.reset();
    updateCategory.reset();
  }, [category, isOpen]);

  useEffect(() => {
    if (createCategory.isError) setError(getErrorMessage(createCategory.error));
    if (updateCategory.isError) setError(getErrorMessage(updateCategory.error));
  }, [createCategory.isError, createCategory.error, updateCategory.isError, updateCategory.error]);

  const mutation = category ? updateCategory : createCategory;
  const isPending = mutation.isPending;

  // Reload the record after a retranslation and refresh the per-field status.
  const reloadTranslations = useCallback(async () => {
    if (!category) return;
    const fresh = await getCategory(category.id);
    setCategoryAr(fresh.categoryAr || '');
    setDescriptionAr(fresh.descriptionAr || '');
    setMachineFlags({
      categoryAr: getIsMachineFlag(fresh, 'categoryAr'),
      descriptionAr: getIsMachineFlag(fresh, 'descriptionAr'),
    });
    const failed = new Set<string>();
    if ((fresh.category || '').trim() && !(fresh.categoryAr || '').trim()) failed.add('categoryAr');
    if ((fresh.description || '').trim() && !(fresh.descriptionAr || '').trim()) failed.add('descriptionAr');
    setFailedFields(failed);
  }, [category]);

  const translationStates: TranslationState[] = [
    getTranslationState(categoryName, categoryAr, machineFlags.categoryAr, failedFields.has('categoryAr')),
    getTranslationState(description, descriptionAr, machineFlags.descriptionAr, failedFields.has('descriptionAr')),
  ];

  function handleSubmit() {
    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    const payload: Partial<Category> = {
      category: categoryName.trim(),
      categoryAr: categoryAr.trim() || undefined,
      description: description.trim() || undefined,
      descriptionAr: descriptionAr.trim() || undefined,
      date: date || undefined,
      status: status as Category['status'],
    };

    if (category) {
      updateCategory.mutate(
        { id: category.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createCategory.mutate(payload, { onSuccess: () => onClose() });
    }
  }

  const footer = (
    <div className="flex justify-center gap-4">
      <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
        {category ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <TranslationProvider model="category" id={category?.id} onTranslated={reloadTranslations}>
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <TranslationToolbar states={translationStates} title={categoryName || undefined} />

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Category" required placeholder="Enter category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>
          <div className="flex-1">
            <ArabicField
              label="Category (Arabic)"
              placeholder="اسم الفئة"
              englishValue={categoryName}
              value={categoryAr}
              onChange={setCategoryAr}
              isMachine={machineFlags.categoryAr}
              failed={failedFields.has('categoryAr')}
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <StatusField value={status} onChange={setStatus} />
          </div>
        </div>

        <div>
          <Textarea label="Description" placeholder="Enter category description" rows={5} className="h-[149px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <ArabicField
            label="Description (Arabic)"
            placeholder="وصف الفئة"
            multiline
            rows={5}
            englishValue={description}
            value={descriptionAr}
            onChange={setDescriptionAr}
            isMachine={machineFlags.descriptionAr}
            failed={failedFields.has('descriptionAr')}
          />
        </div>
      </div>
    </Modal>
    </TranslationProvider>
  );
}
