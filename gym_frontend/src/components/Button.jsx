// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React from 'react';
//
// const Button = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   fullWidth = false,
//   className = '',
//   icon: Icon,
//   disabled,
//   isLoading,
//   ...props
// }) => {
//   const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[38px]';
//
//   const variants = {
//     primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm focus:ring-violet-500 dark:focus:ring-offset-neutral-900',
//     secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
//     outline: 'bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
//     danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-500',
//     ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800',
//   };
//
//   const sizes = {
//     sm: 'px-3 py-1.5 text-xs',
//     md: 'px-4 py-2 text-sm',
//     lg: 'px-6 py-3 text-base',
//   };
//
//   return (
//     <button
//       disabled={disabled || isLoading}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
//       {...props}
//     >
//       {isLoading && (
//         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//       )}
//       {!isLoading && Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
//       {children}
//     </button>
//   );
// };
//
// export default Button;
