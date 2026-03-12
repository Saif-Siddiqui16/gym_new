import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getTenantSettings } from '../../../api/admin/settingsApi';
import { Link2, MessageCircle, Globe, Mail, CreditCard } from 'lucide-react';
import { Loader } from 'lucide-react';

const Integrations = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await getTenantSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to fetch integrations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const integrations = [
        { 
            id: 1, 
            name: 'WhatsApp Business', 
            description: 'Official WhatsApp API for member communication', 
            status: settings?.whatsappEnabled ? 'Connected' : 'Disconnected', 
            icon: MessageCircle 
        },
        { 
            id: 2, 
            name: 'Google Business', 
            description: 'Google Maps and Review integration', 
            status: settings?.googleBusinessEnabled ? 'Connected' : 'Disconnected', 
            icon: Globe 
        },
        { 
            id: 3, 
            name: 'Email Service', 
            description: 'Custom SMTP or SendGrid for notifications', 
            status: 'Disconnected', // Default for now as schema doesn't have fields yet
            icon: Mail 
        },
        { 
            id: 4, 
            name: 'Payment Gateway', 
            description: 'Razorpay or PhonePe for automated payments', 
            status: 'Disconnected', // Default for now
            icon: CreditCard 
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="fade-in p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Integrations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {integrations.map((app) => {
                    const Icon = app.icon;
                    return (
                        <Card key={app.id}>
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                    <Icon size={20} className="sm:w-6 sm:h-6 text-gray-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{app.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{app.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${app.status === 'Connected'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {app.status}
                                </span>
                                <Button
                                    variant={app.status === 'Connected' ? 'outline' : 'primary'}
                                    size="small"
                                    className="w-full sm:w-auto"
                                    onClick={() => window.location.href = '/branchadmin/settings/integrations'}
                                >
                                    {app.status === 'Connected' ? 'Manage' : 'Connect'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default Integrations;

