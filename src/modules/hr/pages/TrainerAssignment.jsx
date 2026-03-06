import React from 'react';
import { Users, Shuffle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { TRAINER_ASSIGNMENTS } from '../data/mockHR';

const TrainerAssignment = () => {
    return (
        <div className="fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Trainer Assignment</h2>
                    <p className="text-gray-500 font-bold mt-1">Manage Personal Trainer capacity and allocations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TRAINER_ASSIGNMENTS.map(trainer => {
                    const usage = (trainer.activeClients / trainer.capacity) * 100;
                    const isHighLoad = usage > 80;

                    return (
                        <Card key={trainer.id} className="relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-gray-900">{trainer.name}</h3>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                    {trainer.specialty}
                                </span>
                            </div>

                            <div className="mb-2 flex justify-between text-sm font-bold text-gray-500">
                                <span>Capacity Utilization</span>
                                <span className={isHighLoad ? 'text-red-500' : 'text-emerald-500'}>
                                    {trainer.activeClients} / {trainer.capacity} Clients
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${isHighLoad ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${usage}%` }}
                                ></div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <Button variant="outline" className="w-full text-sm">
                                    <Shuffle size={14} className="mr-2" /> Re-assign Clients
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card title="Unassigned Members (Mock)">
                <div className="p-8 text-center text-gray-400 font-bold">
                    No unassigned premium members found.
                </div>
            </Card>
        </div>
    );
};

export default TrainerAssignment;
