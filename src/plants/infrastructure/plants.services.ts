import type { Plant } from "../domain/model/plants.entity.ts";
import { BaseApi, ENDPOINTS } from "../../shared/infrastructure/base-endpoint";
import { PlantAssembler } from "./assambler/plants-assembler";
import { tokenStorage } from "@/services/tokenStorage";

/**
 * Plant Management service. Talks to the .NET backend through the shared `apiClient`
 * (exposed by BaseApi.http), which already attaches the JWT Bearer token and transparently
 * refreshes it on 401 — so no manual Authorization headers are needed here.
 *
 * The owner id is derived from the authenticated session (the JWT `sub` claim) via
 * {@link tokenStorage}, replacing the stale `localStorage('userUuid')` lookup that the
 * real auth flow never populated.
 */
export class PlantsService {
  private baseApi: BaseApi;
  private resourceEndpoint = ENDPOINTS.PLANTS;

  constructor() {
    this.baseApi = new BaseApi();
  }

  async getPlantsByUser() {
    const userId = tokenStorage.getUserId();
    if (!userId) {
      throw new Error('User not authenticated. No user id found in the active session.');
    }
    const res = await this.baseApi.http.get<any>(
        `${ENDPOINTS.USERS}/${encodeURIComponent(userId)}/plants`
    );
    const data = Array.isArray(res.data) ? res.data : [];
    const mapped = data.map(r => PlantAssembler.toDomain(r));
    return { ...res, data: mapped };
  }

  async getPlantById(plantId: string) {
    const res = await this.baseApi.http.get<any>(`${this.resourceEndpoint}/${plantId}`);
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async createPlant(plantResource: { userId?: string; name: string; type: string; imgUrl?: string; bio?: string; location?: string; }) {
    // The backend derives the owner from the authenticated JWT; userId in the body is ignored.
    const body = {
      name: plantResource.name,
      type: plantResource.type,
      imgUrl: plantResource.imgUrl || '',
      bio: plantResource.bio || '',
      location: plantResource.location || ''
    };
    const res = await this.baseApi.http.post<any>(`${this.resourceEndpoint}`, body);
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async updatePlant(plantId: string, plantResource: Plant) {
    const body = PlantAssembler.toBackend(plantResource);
    const res = await this.baseApi.http.put<any>(`${this.resourceEndpoint}/${plantId}`, body);
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async deletePlant(plantId: string) {
    return this.baseApi.http.delete(`${this.resourceEndpoint}/${plantId}`);
  }

  async waterPlant(plantId: string, wateredAt?: string) {
    const body = wateredAt ? { wateredAt } : {};
    await this.baseApi.http.post<any>(`${this.resourceEndpoint}/${plantId}/watering`, body);
    // After watering, re-fetch the plant to get the updated state including metrics.
    return this.getPlantById(plantId);
  }
}
