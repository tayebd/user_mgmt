import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dataGridClassNames = {
  root: "bg-white shadow-md rounded-lg overflow-hidden",
  columnHeaders: "bg-gray-50",
  row: "hover:bg-gray-50",
  cell: "px-4 py-2",
  footer: "border-t border-gray-200"
}

export const dataGridSxStyles = {
  root: {
    border: 'none',
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
    },
  },
  columnHeaders: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  row: {
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  cell: {
    borderBottom: '1px solid #e5e7eb',
  },
  footer: {
    borderTop: '1px solid #e5e7eb',
  },
}
