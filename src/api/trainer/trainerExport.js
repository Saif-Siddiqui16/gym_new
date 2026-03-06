export const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
        Object.values(row).map(value =>
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(",")
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
    console.log(`Simulating PDF Export for ${filename}:`, data);
    alert(`PDF Export for ${filename} triggered. Check console for data dump.`);
};
