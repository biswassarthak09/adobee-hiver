import React from 'react';
import { Department } from '../../types';

interface DepartmentTabsProps {
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
}

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  selectedDepartment,
  onSelectDepartment,
}) => {
  const departments: { id: Department; label: string; count: number }[] = [
    { id: 'All Departments', label: 'All Departments', count: 18 },
    { id: 'Engineering', label: 'Engineering', count: 8 },
    { id: 'Product & Design', label: 'Product & Design', count: 4 },
    { id: 'Sales & Marketing', label: 'Sales & Marketing', count: 3 },
    { id: 'Data & AI', label: 'Data & AI', count: 3 },
  ];

  return (
    <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2">
      {departments.map((dept) => {
        const isSelected = selectedDepartment === dept.id;
        return (
          <button
            key={dept.id}
            onClick={() => onSelectDepartment(dept.id)}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
              isSelected
                ? 'bg-primary text-black shadow-sm shadow-amber-500/20'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
            }`}
          >
            {dept.label} ({dept.count})
          </button>
        );
      })}
    </div>
  );
};
