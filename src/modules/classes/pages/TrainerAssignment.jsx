import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getClassById, updateClass } from '../../../api/manager/classesApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

const TrainerAssignment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cls, staff] = await Promise.all([
                getClassById(id),
                getAllStaff()
            ]);
            setClassData(cls);
            setTrainers(staff.filter(s => s.role === 'TRAINER' || s.role === 'STAFF'));
            setSelectedTrainer(cls.trainerId || '');
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load assignment data');
            navigate(`/classes/${id}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateClass(id, { trainerId: selectedTrainer });
            toast.success('Trainer assigned successfully!');
            navigate(`/classes/${id}`);
        } catch (error) {
            console.error('Error assigning trainer:', error);
            toast.error('Failed to assign trainer');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!classData) return <div>Class not found</div>;

    return (
        <div className="fade-in px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-6)' }}>
                <button
                    onClick={() => navigate(`/classes/${id}`)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-indigo-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-gray-900">Assign Trainer</h2>
            </div>

            <Card className="mb-8 border-indigo-100 bg-indigo-50/30">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Class</div>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-dark)' }}>{classData.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>Schedule</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{classData.schedule}</div>
                    </div>
                </div>
            </Card>

            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Select Available Trainer
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                {trainers.map(trainer => {
                    const isSelected = selectedTrainer === trainer.id;
                    return (
                        <div
                            key={trainer.id}
                            onClick={() => setSelectedTrainer(trainer.id)}
                            className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 shadow-sm hover:shadow-md ${isSelected
                                ? 'bg-indigo-50 border-indigo-500 shadow-indigo-100'
                                : 'bg-white border-gray-100 hover:border-indigo-200'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 text-indigo-600 animate-in zoom-in duration-300">
                                    <CheckCircle size={24} />
                                </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                <User size={24} />
                            </div>
                            <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{trainer.name}</div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{trainer.role}</div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 flex flex-col-reverse sm:flex-row justify-end gap-4 pb-12">
                <Button variant="outline" onClick={() => navigate(`/classes/${id}`)} disabled={saving} className="w-full sm:w-auto">Cancel</Button>
                <Button variant="primary" onClick={handleSave} loading={saving} className="w-full sm:w-auto">
                    Confirm Assignment
                </Button>
            </div>
        </div>
    );
};

export default TrainerAssignment;
