import type { Diagnosis } from '@/ai/domain/model/diagnosis.entity';

/**
 * Maps the raw JSON returned by the .NET backend into the domain `Diagnosis` entity.
 * Backend GUIDs arrive as strings; confidenceScore is clamped to 0–1.
 */
export class DiagnosisAssembler {
  static toDomain(raw: Record<string, unknown>): Diagnosis {
    return {
      id: String(raw.id ?? ''),
      plantId: String(raw.plantId ?? ''),
      imageUrl: String(raw.imageUrl ?? ''),
      detectedPest: String(raw.detectedPest ?? 'None'),
      confidenceScore: typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0,
      recommendation: String(raw.recommendation ?? ''),
      status: (raw.status as Diagnosis['status']) ?? 'Pending',
      createdAt: String(raw.createdAt ?? ''),
      analyzedAt: raw.analyzedAt ? String(raw.analyzedAt) : null,
    };
  }

  static toDomainList(raw: unknown): Diagnosis[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => DiagnosisAssembler.toDomain(r as Record<string, unknown>));
  }
}
