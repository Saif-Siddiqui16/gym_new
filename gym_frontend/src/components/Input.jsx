// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React from 'react';
//
// const Input = ({
//   label,
//   error,
//   className = '',
//   containerClassName = '',
//   icon: Icon,
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
//         {Icon && (
//           <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//             <Icon className="h-4 w-4" />
//           </div>
//         )}
//         <input
//           disabled={disabled}
//           className={`
//             w-full rounded-md border border-slate-300 dark:border-slate-600
//             bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
//             placeholder-slate-400 dark:placeholder-slate-500
//             focus:border-[#8e68e5] focus:outline-none focus:ring-1 focus:ring-[#8e68e5]
//             disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900
//             transition-colors duration-200
//             ${Icon ? 'pl-10' : 'px-3'} py-2.5 md:py-2
//             ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
//             ${className}
//           `}
//           {...props}
//         />
//       </div>
//       {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
//     </div>
//   );
// };
//
// export default Input;
