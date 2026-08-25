import { Edit3, Trash2, Loader2, FileX2, Star } from 'lucide-react';
import StatusBadge from './StatusBadge';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onAction?: (row: T) => void;
  actionIcon?: React.ReactNode;
  actionTooltip?: string;
  statusKey?: keyof T;
  isLoading?: boolean;
  loadingRows?: number;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onAction,
  actionIcon,
  actionTooltip,
  statusKey,
  isLoading = false,
  loadingRows = 5,
}: DataTableProps<T>) {
  const showActions = Boolean(onEdit || onDelete || onAction);

  return (
    <div className="w-full bg-table-bg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`text-left px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)] ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th className="text-center px-4 py-3 text-table-header-text text-[13px] font-medium uppercase tracking-wide font-[family-name:var(--font-poppins)]">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRows }, (_, i) => (
                <tr
                  key={i}
                  className="border-b border-border-soft/50 last:border-b-0"
                >
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-4">
                      <div className="h-3.5 rounded bg-black/5 animate-pulse" />
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-4">
                      <div className="h-6 w-6 rounded-full bg-black/5 animate-pulse mx-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-4 py-14 text-center"
                >
                  <div className="flex flex-col items-center gap-3 text-text-secondary">
                    <FileX2 size={36} className="opacity-40" />
                    <p className="text-sm font-medium font-[family-name:var(--font-poppins)]">
                      No records found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border-soft/50 last:border-b-0 hover:bg-black/[0.02] transition-colors"
                >
                  {columns.map((col) => {
                    let cell: React.ReactNode;

                    if (typeof col.accessor === 'function') {
                      cell = col.accessor(row);
                    } else if (
                      col.header === 'Status' ||
                      (statusKey && col.accessor === statusKey)
                    ) {
                      cell = <StatusBadge status={String(row[col.accessor])} />;
                    } else {
                      cell = String(row[col.accessor] ?? '');
                    }

                    return (
                      <td
                        key={col.header}
                        className={`px-4 py-3.5 text-[12px] font-[family-name:var(--font-poppins)] ${col.className || ''}`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                  {showActions && (
                    <td className="px-4 py-3.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        {onAction && (
                          <button
                            onClick={() => onAction(row)}
                            title={actionTooltip}
                            className="w-[34px] h-[34px] rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                          >
                            {actionIcon ?? <Star size={16} className="text-danger" />}
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="w-[34px] h-[34px] rounded-full bg-edit-icon-bg flex items-center justify-center hover:bg-edit-icon-bg/20 transition-colors cursor-pointer"
                          >
                            <Edit3 size={16} className="text-[#FA8600]" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="w-[34px] h-[34px] rounded-full bg-[#FDECEC] flex items-center justify-center hover:bg-[#FAD5D5] transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} className="text-danger" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}