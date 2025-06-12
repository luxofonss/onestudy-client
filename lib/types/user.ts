/**
 * Represents a user in the application
 */
export interface User {
     id: string;
     name: string;
     username: string;
     email: string;
     avatarUrl?: string;
     role: 'user' | 'admin';
     createdAt: string;
     updatedAt: string;
} 