import React, { useState, useRef, useEffect } from 'react';
import { Idea, IdeaStatus, ToastMessage } from '../types';
import { X, Plus, Trash2, Send, CornerDownLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getIdeaStatusOptions, IDEA_STATUS_COLORS } from '../constants';

interface IdeaBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    ideas: Idea[];
    onUpdateIdeas: (updatedIdeas: Idea[]) => void;
    onSelectAsMain: (title: string) => void;
    onSelectAsNext: (title: string) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
}

export const IdeaBankModal: React.FC<IdeaBankModalProps> = ({ isOpen, onClose, ideas, onUpdateIdeas, onSelectAsMain, onSelectAsNext, showToast }) => {
    const { t } = useTranslation();
    const [newIdeaInput, setNewIdeaInput] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmTimerRef = useRef<number | null>(null);
    const statusOptions = getIdeaStatusOptions(t);

    useEffect(() => {
        // Clear timeout on unmount
        return () => {
            if (confirmTimerRef.current) {
                clearTimeout(confirmTimerRef.current);
            }
        };
    }, []);


    const handleAddIdeas = () => {
        const titles = newIdeaInput.split('\n').map(t => t.trim()).filter(Boolean);
        if (titles.length === 0) return;

        const newIdeas: Idea[] = titles.map(title => ({
            id: `idea_${Date.now()}_${Math.random()}`,
            title,
            status: IdeaStatus.NotStarted
        }));

        const updatedIdeas = [...ideas, ...newIdeas];
        onUpdateIdeas(updatedIdeas);
        setNewIdeaInput('');
        showToast(t('toasts.ideaAdded'), 'success');
    };

    const handleStatusChange = (ideaId: string, newStatus: IdeaStatus) => {
        const updatedIdeas = ideas.map(idea =>
            idea.id === ideaId ? { ...idea, status: newStatus } : idea
        );
        onUpdateIdeas(updatedIdeas);
        showToast(t('toasts.ideaUpdated'), 'info');
    };
    
    const handleDeleteClick = (ideaId: string) => {
        if (confirmTimerRef.current) {
            clearTimeout(confirmTimerRef.current);
        }

        if (confirmDeleteId === ideaId) {
            // Confirmed deletion on second click
            const updatedIdeas = ideas.filter(idea => idea.id !== ideaId);
            onUpdateIdeas(updatedIdeas);
            showToast(t('toasts.ideaDeleted'), 'info');
            setConfirmDeleteId(null);
        } else {
            // First click, ask for confirmation
            setConfirmDeleteId(ideaId);
            confirmTimerRef.current = window.setTimeout(() => {
                setConfirmDeleteId(null);
            }, 4000); // Reset after 4 seconds
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{t('ideaBankModal.title')}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                </div>

                <div className="p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                    <label className="font-semibold text-sm mb-2 block">{t('ideaBankModal.addNewIdea')}</label>
                    <div className="flex gap-2">
                        <textarea
                            value={newIdeaInput}
                            onChange={(e) => setNewIdeaInput(e.target.value)}
                            placeholder={t('ideaBankModal.addNewIdeaPlaceholder')}
                            rows={3}
                            className="flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                        <button
                            onClick={handleAddIdeas}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg self-start"
                        >
                            <Plus size={16} />
                            {t('ideaBankModal.add')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {ideas.length === 0 ? (
                        <div className="text-center p-12">
                            <p className="font-semibold text-lg">{t('ideaBankModal.noIdeas')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ideas.map(idea => (
                                <div key={idea.id} className="p-4 flex items-center justify-between hover:bg-light-bg/50 dark:hover:bg-dark-bg/50">
                                    <div className="flex-1 font-medium mr-4">{idea.title}</div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={idea.status}
                                            onChange={(e) => handleStatusChange(idea.id, e.target.value as IdeaStatus)}
                                            className={`text-xs p-1.5 rounded-md text-white border-none ${IDEA_STATUS_COLORS[idea.status]}`}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value} className="bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text">{opt.label}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => onSelectAsMain(idea.title)} title={t('ideaBankModal.actions.useAsMain')} className="p-2 text-gray-500 hover:text-green-500"><Send size={16} /></button>
                                        <button onClick={() => onSelectAsNext(idea.title)} title={t('ideaBankModal.actions.useAsNext')} className="p-2 text-gray-500 hover:text-blue-500"><CornerDownLeft size={16} /></button>
                                        <button 
                                            onClick={() => handleDeleteClick(idea.id)} 
                                            title={confirmDeleteId === idea.id ? t('ideaBankModal.deleteConfirm') : t('ideaBankModal.actions.delete')} 
                                            className={`p-2 rounded-md transition-colors ${
                                                confirmDeleteId === idea.id 
                                                ? 'bg-red-500 text-white' 
                                                : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                                            }`}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};