// 🔕 COMMENTED OUT: Unused / Legacy File
// Reason: Not imported or referenced anywhere in the active project
// Date: 2026-02-06
//
// import React from 'react';
// import { Archive } from 'lucide-react';
//
// const SkeletonRow = ({ columns }) => (
//   <tr className="animate-pulse border-b border-slate-100 dark:border-slate-700">
//     {columns.map((_, idx) => (
//       <td key={idx} className="px-6 py-4 whitespace-nowrap">
//         <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
//       </td>
//     ))}
//     <td className="px-6 py-4">
//       <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div>
//     </td>
//   </tr>
// );
//
// const Table = ({ columns, data, actions, onRowClick, isLoading = false }) => {
//   return (
//     <div className="w-full">
//       {/* Table View (Desktop & Tablet) */}
//       <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
//         <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//           <thead className="bg-slate-50 dark:bg-slate-900/50">
//             <tr>
//               {columns.map((col, idx) => (
//                 <th
//                   key={idx}
//                   scope="col"
//                   className={`px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.className || ''}`}
//                 >
//                   {col.header}
//                 </th>
//               ))}
//               {actions && <th scope="col" className="relative px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, idx) => (
//                 <SkeletonRow key={idx} columns={columns} />
//               ))
//             ) : data.length > 0 ? (
//               data.map((row, rowIdx) => (
//                 <tr
//                   key={row.id || rowIdx}
//                   className={`group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
//                   onClick={() => onRowClick && onRowClick(row)}
//                 >
//                   {columns.map((col, colIdx) => (
//                     <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 ${col.cellClassName || ''}`}>
//                       {col.render ? col.render(row) : row[col.accessor]}
//                     </td>
//                   ))}
//                   {actions && (
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       {actions(row)}
//                     </td>
//                   )}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
//                       <Archive className="w-6 h-6 text-slate-400" />
//                     </div>
//                     <p className="font-medium text-slate-900 dark:text-white">No records found</p>
//                     <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//
//       {/* Card View (Mobile) */}
//       <div className="grid grid-cols-1 gap-4 md:hidden">
//         {isLoading ? (
//           Array.from({ length: 3 }).map((_, idx) => (
//             <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 animate-pulse space-y-3">
//               <div className="h-4 bg-slate-100 rounded w-1/2"></div>
//               <div className="h-3 bg-slate-50 rounded w-3/4"></div>
//               <div className="h-3 bg-slate-50 rounded w-2/3"></div>
//             </div>
//           ))
//         ) : data.length > 0 ? (
//           data.map((row, rowIdx) => (
//             <div
//               key={row.id || rowIdx}
//               className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4"
//               onClick={() => onRowClick && onRowClick(row)}
//             >
//               <div className="space-y-3">
//                 {columns.map((col, colIdx) => (
//                   <div key={colIdx} className="flex justify-between items-start gap-4">
//                     <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">{col.header}</span>
//                     <span className="text-sm text-slate-700 dark:text-slate-300 text-right">
//                       {col.render ? col.render(row) : row[col.accessor]}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               {actions && (
//                 <div className="pt-3 border-t border-slate-50 dark:border-slate-700 flex justify-end">
//                   {actions(row)}
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
//             <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
//             <p className="text-slate-500 text-sm font-medium">No records found</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
//
// export default Table;
