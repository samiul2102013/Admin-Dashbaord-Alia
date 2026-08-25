'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Textarea from '@/components/shared/Textarea';
import Button from '@/components/shared/Button';
import Select from '@/components/shared/Select';
import { STATUS_OPTIONS } from '@/lib/constants';
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
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Draft');
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setCategoryName(category.category);
      setDescription(category.description);
      setDate(category.date);
      setStatus(category.status);
    } else {
      setCategoryName('');
      setDescription('');
      setDate('');
      setStatus('Draft');
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

  function handleSubmit() {
    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    const payload: Partial<Category> = {
      category: categoryName.trim(),
      description: description.trim() || undefined,
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
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'} footer={footer}>
      <div className="flex flex-col gap-8">
        {error && <p className="text-danger text-sm font-[family-name:var(--font-poppins)]">{error}</p>}

        <div className="flex gap-8">
          <div className="flex-1">
            <Input label="Category" required placeholder="Enter category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <Textarea label="Description" placeholder="Enter category description" rows={5} className="h-[149px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}