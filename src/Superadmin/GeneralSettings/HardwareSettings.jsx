import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Edit2, Trash2, Plus, Monitor, Wifi, Activity, ArrowLeft } from 'lucide-react';
import CustomDropdown from '../../components/common/CustomDropdown';
import RightDrawer from '../../components/common/RightDrawer';
import { fetchDevices, addDevice, updateDevice, deleteDevice } from '../../api/superadmin/superAdminApi';

const HardwareSettings = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Access Controller',
        ip: '',
        status: 'active'
    });

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            const data = await fetchDevices();
            const formatted = data.map(d => ({
                id: d.id,
                name: d.name,
                type: d.type || 'Turnstile',
                ip: d.ipAddress || '',
                status: d.status === 'connected' || d.status === 'active' || d.status === 'Online' ? 'active' : 'offline'
            }));
            setDevices(formatted);
        } catch (error) {
            console.error("Failed to load devices", error);
        }
    };

    const handleAddDevice = () => {
        setModalMode('add');
        setFormData({
            name: '',
            type: 'Access Controller',
            ip: '',
            status: 'active'
        });
        setIsDrawerOpen(true);
    };

    const handleEdit = (device) => {
        setModalMode('edit');
        setSelectedDevice(device);
        setFormData({
            name: device.name,
            type: device.type,
            ip: device.ip,
            status: device.status
        });
        setIsDrawerOpen(true);
    };

    const handleSaveDevice = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.ip) {
            alert('Please fill in all required fields.');
            return;
        }

        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(formData.ip)) {
            alert('Please enter a valid IP address.');
            return;
        }

        try {
            if (modalMode === 'edit') {
                await updateDevice(selectedDevice.id, formData);
                alert('Device updated successfully!');
            } else {
                await addDevice(formData);
                alert('Device added successfully!');
            }
            loadDevices();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Failed to save device", error);
            alert("Failed to save device: " + error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRemove = async (id) => {
        if (confirm('Are you sure you want to remove this device?')) {
            try {
                await deleteDevice(id);
                loadDevices();
            } catch (error) {
                console.error("Failed to delete device", error);
                alert("Failed to delete device: " + error);
            }
        }
    };

    const getStatusBadge = (status) => {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 hover:scale-110 ${status === 'active'
                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'
                }`}>
                <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 flex flex-col items-center">
            {/* Page Header - Back Button */}
            <div className="w-full max-w-7xl mb-6">
                <button
                    onClick={() => navigate('/superadmin/general-settings/general')}
                    className="group flex items-center text-slate-500 hover:text-violet-600 transition-all duration-300 hover:scale-105"
                >
                    <div className="p-1 rounded-full group-hover:bg-violet-50 transition-all duration-300 mr-2 group-hover:scale-110">
                        <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    </div>
                    <span className="font-semibold">Back to Settings</span>
                </button>
            </div>
            {/* Premium Header with Gradient */}
            <div className="max-w-7xl mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Monitor size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Hardware Settings
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">Manage connected devices and access points</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddDevice}
                            className="group relative px-6 py-3 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Plus className="w-5 h-5 relative transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                            <span className="relative">Add New Device</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Devices Table */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Device Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">IP Address</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {devices.length > 0 ? (
                                devices.map((device) => (
                                    <tr
                                        key={device.id}
                                        className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-purple-50/30 hover:to-transparent transition-all duration-300"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${device.status === 'active'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                                                    : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                                    }`}>
                                                    <Server size={20} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block text-sm group-hover:text-violet-600 transition-colors">{device.name}</span>
                                                    <span className="text-xs text-slate-500">ID: {device.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">{device.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all duration-300 group-hover:bg-violet-50 group-hover:border-violet-200 group-hover:text-violet-700">
                                                <Wifi size={14} />
                                                {device.ip}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(device.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(device)}
                                                    className="group/btn p-2.5 text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-300 border border-transparent hover:border-violet-200 hover:scale-110 hover:shadow-md"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} className="transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(device.id)}
                                                    className="group/btn p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-transparent hover:border-red-200 hover:scale-110 hover:shadow-md"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} className="transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                                <Server size={32} className="text-violet-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Devices Found</h3>
                                            <p className="text-slate-600 text-sm">Add your first hardware device to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Device Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={modalMode === 'add' ? 'Add New Device' : 'Edit Device Configuration'}
                subtitle={modalMode === 'add' ? 'Configure a new hardware node' : `Updating ${selectedDevice?.name}`}
                maxWidth="max-w-lg"
                footer={
                    <div className="flex flex-row-reverse gap-3 w-full">
                        <button
                            type="submit"
                            form="device-form"
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            {modalMode === 'add' ? 'Add Device' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <form id="device-form" onSubmit={handleSaveDevice} className="flex flex-col gap-6 p-6">
                    {/* Device Name */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Device Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Reception Turnstile"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Device Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Device Type</label>
                            <CustomDropdown
                                options={[
                                    'Access Controller',
                                    'Biometric',
                                    'RFID Reader',
                                    'Turnstile',
                                    'Camera'
                                ]}
                                value={formData.type}
                                onChange={(val) => handleInputChange({ target: { name: 'type', value: val } })}
                                className="w-full"
                            />
                        </div>

                        {/* IP Address */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">IP Address *</label>
                            <input
                                type="text"
                                name="ip"
                                className="block w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                value={formData.ip}
                                onChange={handleInputChange}
                                placeholder="192.168.1.1"
                                required
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Initial Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-sm font-semibold text-slate-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="offline"
                                    checked={formData.status === 'offline'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-sm font-semibold text-slate-700">Offline</span>
                            </label>
                        </div>
                    </div>
                </form>
            </RightDrawer>
        </div>
    );
};

export default HardwareSettings;
