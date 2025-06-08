import { HttpClient } from "./http-client"
import type { IApiResponse } from "@/lib/types/api-types"

export interface PronunciationSample {
     realTranscript: string
     ipaTranscript: string
     transcriptTranslation?: string
}

export interface PronunciationResult {
     pronunciationAccuracy: number
     ipaTranscript: string
     realTranscriptsIpa: string
     matchedTranscriptsIpa: string
     pairAccuracyCategory: string
     isLetterCorrectAllWords: string
     startTime: string
     endTime: string
}

export interface PronunciationRequest {
     text: string
     base64Audio: string
}

class PronunciationService {
     private readonly httpClient: HttpClient

     constructor() {
          this.httpClient = new HttpClient()
     }

     async getSample(level = "EASY", customText?: string): Promise<IApiResponse<PronunciationSample>> {
          try {
               const params = new URLSearchParams({ level });
               if (customText) params.append("customText", customText);

               const url = `/pub/pronunciations/samples?${params.toString()}`;

               return await this.httpClient.get<IApiResponse<PronunciationSample>>(url, true);
          } catch (error) {
               console.error("Error getting pronunciation sample:", error)
               return {
                    meta: {
                         code: 500,
                         message: error instanceof Error ? error.message : "Failed to get pronunciation sample",
                         requestId: "",
                    },
                    data: undefined
               }
          }
     }

     async analyzePronunciation(request: PronunciationRequest): Promise<IApiResponse<PronunciationResult>> {
          try {
               return await this.httpClient.post<IApiResponse<PronunciationResult>>("/pub/pronunciations/accuracy", request)
          } catch (error) {
               console.error("Error analyzing pronunciation:", error)
               return {
                    meta: {
                         code: 500,
                         message: error instanceof Error ? error.message : "Failed to analyze pronunciation",
                         requestId: "",
                    },
                    data: undefined
               }
          }
     }
}

export const pronunciationService = new PronunciationService()
