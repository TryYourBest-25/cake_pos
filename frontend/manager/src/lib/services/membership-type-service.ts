import { apiClient } from "@/lib/api-client";
import { 
  MembershipType, 
  BackendMembershipTypeResponse,
  BackendPaginatedResponse,
  transformMembershipTypeResponse,
  CreateMembershipTypeDto, 
  UpdateMembershipTypeDto,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateMembershipTypeFormData, 
  transformUpdateMembershipTypeFormData,
  CreateMembershipTypeFormData,
  UpdateMembershipTypeFormData 
} from "@/lib/validations/membership-type";

/**
 * MembershipType Service
 * Xử lý tất cả API calls liên quan đến membership types
 */
export class MembershipTypeService {
  private readonly endpoint = "/membership-types";

  /**
   * Lấy danh sách membership types với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
  }): Promise<PaginatedResponse<MembershipType>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendMembershipTypeResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformMembershipTypeResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy membership type theo ID
   */
  async getById(id: number, includeCustomers?: boolean): Promise<MembershipType> {
    const params = includeCustomers ? { includeCustomers: true } : undefined;
    const backendResponse = await apiClient.get<BackendMembershipTypeResponse>(`${this.endpoint}/${id}`, params);
    return transformMembershipTypeResponse(backendResponse);
  }

  /**
   * Lấy membership type theo type name
   */
  async getByType(type: string, includeCustomers?: boolean): Promise<MembershipType> {
    const params = includeCustomers ? { includeCustomers: true } : undefined;
    const backendResponse = await apiClient.get<BackendMembershipTypeResponse>(`${this.endpoint}/by-type/${type}`, params);
    return transformMembershipTypeResponse(backendResponse);
  }

  /**
   * Tạo membership type mới
   */
  async create(formData: CreateMembershipTypeFormData): Promise<MembershipType> {
    const backendData = transformCreateMembershipTypeFormData(formData);
    const backendResponse = await apiClient.post<BackendMembershipTypeResponse>(this.endpoint, backendData);
    return transformMembershipTypeResponse(backendResponse);
  }

  /**
   * Cập nhật membership type
   */
  async update(id: number, formData: UpdateMembershipTypeFormData): Promise<MembershipType> {
    const backendData = transformUpdateMembershipTypeFormData(formData);
    const backendResponse = await apiClient.patch<BackendMembershipTypeResponse>(`${this.endpoint}/${id}`, backendData);
    return transformMembershipTypeResponse(backendResponse);
  }

  /**
   * Xóa membership type
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

// Export singleton instance
export const membershipTypeService = new MembershipTypeService(); 