export enum ScanStatus {
    IDLE = 'IDLE',
    UPLOADING = 'UPLOADING',
    PROCESSING = 'PROCESSING',
    COMPLETE = 'COMPLETE',
    ERROR = 'ERROR'
}

export interface Finding {
    condition: string;
    confidence: number; // 0 to 1
    severity: 'low' | 'medium' | 'high';
    description: string;
    coordinates?: { x: number; y: number; width: number; height: number }; // For bounding boxes
}

export interface AnalysisResult {
    id: string;
    timestamp: Date;
    patientId: string;
    modality: string;
    findings: Finding[];
    overallStatus: 'Normal' | 'Abnormal' | 'Inconclusive';
    processingTimeMs: number;
}

export interface UploadedFile {
    file: File;
    previewUrl: string;
}
