import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateAndSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Invalid file type. Please upload a DICOM or Image file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
             setError('File size too large. Max 10MB.');
             return;
        }
        setError(null);
        onFileSelect(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    }, [disabled, onFileSelect]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSelect(e.target.files[0]);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed 
                transition-all duration-300 ease-out
                ${isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.01]' 
                    : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                h-64 flex flex-col items-center justify-center text-center p-6
            `}
        >
            <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleFileInput}
                disabled={disabled}
            />
            
            <div className="z-10 flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/10'}`}>
                    <UploadCloud size={32} />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium text-slate-700">
                        {isDragging ? 'Drop X-Ray here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-slate-500">
                        DICOM, PNG, JPG (Max 10MB)
                    </p>
                </div>
            </div>

            {error && (
                <div className="absolute bottom-4 left-0 right-0 mx-auto w-max flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full animate-fade-in-up">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </div>
    );
};
