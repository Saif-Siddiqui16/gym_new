// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React from 'react';
// import { ChevronDown } from 'lucide-react';
//
// const Select = ({
//   label,
//   error,
//   options = [],
//   className = '',
//   containerClassName = '',
//   placeholder = 'Select option',
//   disabled,
//   ...props
// }) => {
//   return (
//     <div className={`flex flex-col ${containerClassName}`}>
//       {label && (
//         <label className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         <select
//           disabled={disabled}
//           className={`
//             w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600
//             bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100
//             focus:border-[#8e68e5] focus:outline-none focus:ring-1 focus:ring-[#8e68e5]
//             disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60
//             transition-time duration-200
//             ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
//             ${className}
//           `}
//           style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
//           {...props}
//         >
//           <option value="" disabled selected>{placeholder}</option>
//           {options.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//         <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//           <ChevronDown className="h-4 w-4" />
//         </div>
//       </div>
//       {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
//     </div>
//   );
// };
//
// export default Select;
