import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    // Define the fields we want to export
    const exportFields = [
        { label: 'Name', key: 'name' },
        { label: 'Member ID', key: 'memberId' },
        { label: 'Phone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Status', key: 'status' },
        { label: 'Plan', key: 'plan' },
        { label: 'Branch', key: 'branch' },
        { label: 'Joined', key: 'joinDate' },
        { label: 'Gender', key: 'gender' },
        { label: 'DOB', key: 'dob' }
    ];

    const headers = exportFields.map(f => f.label).join(",");
    const rows = data.map(row =>
        exportFields.map(field => {
            const value = row[field.key] || "";
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(",")
    ).join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportPDF = (data, filename) => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    const doc = new jsPDF();
    const tableColumn = ["Name", "Member ID", "Phone", "Status", "Plan", "Joined"];
    const tableRows = [];

    data.forEach(member => {
        const memberData = [
            member.name || 'N/A',
            member.memberId || 'N/A',
            member.phone || 'N/A',
            member.status || 'N/A',
            member.plan || 'No Plan',
            member.joinDate || 'N/A'
        ];
        tableRows.push(memberData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [124, 58, 237] }, // Violet color to match UI
        margin: { top: 20 }
    });

    doc.text("Member List Report", 14, 15);
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
