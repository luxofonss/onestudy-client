import { httpClient } from "./http-client"
import type { IApiResponse } from "@/lib/types/api-types"

interface IResource {
     id: string;
     name: string;
     path: string | null;
     url: string;
     ownerId: string;
     extension: string | null;
     sizeBytes: number | null;
     cloudId: string | null;
     uploadedAt: string | null;
     lastModifiedAt: string | null;
     deletedAt: string | null;
     metadata: Record<string, any> | null;
}

class ResourceService {
     /**
      * Upload a file to the server
      * @param file The file to upload
      * @returns Promise with the uploaded resource information
      */
     async uploadFile(file: File): Promise<IApiResponse<IResource>> {
          try {
               const formData = new FormData()
               console.log("file:: ", file)
               formData.append("file", file)

               return await httpClient.post<IApiResponse<IResource>>("/resources", formData, true)
          } catch (error) {
               return {
                    meta: {
                         code: 500000,
                         message: error instanceof Error ? error.message : "Failed to upload file",
                         requestId: "",
                    },
                    data: undefined,
               }
          }
     }
}

export const resourceService = new ResourceService() 