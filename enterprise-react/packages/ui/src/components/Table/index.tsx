import React from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string);
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRowClick?: (record: T, index: number) => void;
}

const sizeClass = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};

export function Table<T extends object = Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  empty = 'No data',
  className,
  striped = false,
  bordered = false,
  size = 'md',
  onRowClick,
}: TableProps<T>) {
  const getKey = (record: T): string => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  };

  return (
    <div className={cn('relative w-full overflow-auto rounded-lg border border-gray-200', className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <Spinner size="lg" />
        </div>
      )}

      <table className="w-full border-collapse text-left">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  sizeClass[size],
                  bordered && 'border border-gray-200',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                )}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-sm text-gray-400"
              >
                {empty}
              </td>
            </tr>
          ) : (
            data.map((record, rowIndex) => (
              <tr
                key={getKey(record)}
                className={cn(
                  'transition-colors hover:bg-gray-50',
                  striped && rowIndex % 2 === 1 && 'bg-gray-50/50',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(record, rowIndex)}
              >
                {columns.map((col) => {
                  const value = col.dataIndex ? record[col.dataIndex] : undefined;
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        sizeClass[size],
                        'text-gray-700',
                        bordered && 'border border-gray-200',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                      )}
                    >
                      {col.render ? col.render(value, record, rowIndex) : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';
