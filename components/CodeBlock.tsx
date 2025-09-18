import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const CodeBlock: React.FC<{ code: string; title: string; }> = ({ code, title }) => {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-md mt-2">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500">{title}</p>
                <button onClick={handleCopy} className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary">
                    {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {isCopied ? t('common.copied') : t('common.copy')}
                </button>
            </div>
            <pre className="p-4 text-xs whitespace-pre-wrap font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
};
