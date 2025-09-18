
import React, { useState } from 'react';
import { Project } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { STATUS_COLORS } from '../constants';

interface CalendarViewProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projects, onSelectProject }) => {
    const { t, language } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = lastDayOfMonth.getDate();
    
    const today = new Date();
    const isToday = (date: Date) => 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const days = [];
    // Previous month's padding
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push({ key: `prev-${i}`, date: null, isCurrentMonth: false });
    }
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        days.push({ key: `current-${day}`, date: new Date(year, month, day), isCurrentMonth: true });
    }
    // Next month's padding
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ key: `next-${i}`, date: null, isCurrentMonth: false });
        }
    }

    const projectsByDate = projects.reduce((acc, project) => {
        try {
            const dateKey = new Date(project.publishDateTime).toDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(project);
        } catch (e) {
            console.error("Invalid date for project:", project.projectName, project.publishDateTime);
        }
        return acc;
    }, {} as Record<string, Project[]>);
    
    const weekdays = [...Array(7).keys()].map(i => {
        const d = new Date(Date.UTC(2023, 0, i + 1)); // A week in Jan 2023 (starts on Sunday)
        return d.toLocaleDateString(language, { weekday: 'short', timeZone: 'UTC' });
    });

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg p-4 md:p-6 h-full flex flex-col">
            <header className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        {currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                    </h1>
                     <button
                        onClick={goToToday}
                        className="text-sm font-semibold py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {t('calendar.today')}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Previous month">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Next month">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{minHeight: '60vh'}}>
                {weekdays.map(day => (
                    <div key={day} className="text-center font-semibold text-sm py-2 bg-light-card dark:bg-dark-card text-gray-600 dark:text-gray-300">
                        {day}
                    </div>
                ))}

                {days.map(({ key, date, isCurrentMonth }) => {
                    const projectsForDay = date ? projectsByDate[date.toDateString()] || [] : [];
                    const dayIsToday = date && isToday(date);

                    return (
                        <div
                            key={key}
                            className={`p-1 bg-light-card dark:bg-dark-card ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-dark-bg/50' : ''} flex flex-col`}
                        >
                            <span className={`text-sm mb-1 self-start ${
                                isCurrentMonth ? 'text-light-text dark:text-dark-text' : 'text-gray-400 dark:text-gray-500'
                            } ${dayIsToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : 'p-1'}`}>
                                {date?.getDate()}
                            </span>
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                                {projectsForDay.map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => onSelectProject(project)}
                                        className={`p-1.5 text-xs rounded-md truncate cursor-pointer text-white ${STATUS_COLORS[project.status]} hover:opacity-80 transition-opacity`}
                                        title={project.projectName || project.videoTitle}
                                    >
                                        {project.projectName || project.videoTitle}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
