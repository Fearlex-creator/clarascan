import { AnalysisResult, Finding } from '../types';

// This mock service simulates the latency and response structure of a 
// real AI inference backend (like NVIDIA Clara / MONAI).

const CONDITIONS = [
    { name: 'Pneumonia', desc: 'Inflammation of the air sacs in one or both lungs.' },
    { name: 'Infiltration', desc: 'Substance denser than air, such as pus or blood, lingers in the parenchyma.' },
    { name: 'Nodule', desc: 'Growth of abnormal tissue.' },
    { name: 'Atelectasis', desc: 'Complete or partial collapse of the entire lung or area (lobe) of the lung.' },
    { name: 'Effusion', desc: 'Buildup of fluid between the layers of tissue that line the lungs and chest cavity.' },
];

const generateMockResult = (): AnalysisResult => {
    const isNormal = Math.random() > 0.6;
    const numFindings = isNormal ? 0 : Math.floor(Math.random() * 2) + 1;
    const findings: Finding[] = [];

    for (let i = 0; i < numFindings; i++) {
        const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        findings.push({
            condition: condition.name,
            confidence: 0.75 + (Math.random() * 0.24), // High confidence for AI demo
            severity: Math.random() > 0.5 ? 'medium' : 'high',
            description: condition.desc,
            coordinates: {
                x: 20 + Math.random() * 40,
                y: 20 + Math.random() * 40,
                width: 15 + Math.random() * 20,
                height: 15 + Math.random() * 20
            }
        });
    }

    return {
        id: `scan-${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date(),
        patientId: `ANON-${Math.floor(Math.random() * 9999)}`,
        modality: 'CXR (Chest X-Ray)',
        findings,
        overallStatus: isNormal ? 'Normal' : 'Abnormal',
        processingTimeMs: 120 + Math.floor(Math.random() * 300) // Fast inference
    };
};

export const analyzeImage = (file: File): Promise<AnalysisResult> => {
    return new Promise((resolve) => {
        // Simulate upload and processing delay
        setTimeout(() => {
            resolve(generateMockResult());
        }, 3500);
    });
};
