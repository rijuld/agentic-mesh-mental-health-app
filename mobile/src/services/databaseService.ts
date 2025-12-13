import { User, MoodLog, SafetyContract, ShareSettings } from '../types';

// Backend API URL - use your machine's IP for physical device testing
// For iOS simulator: http://localhost:3000
// For Android emulator: http://10.0.2.2:3000
// For physical device: http://<your-machine-ip>:3000
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.205.1.208:3000';

const COLLECTIONS = {
  users: 'users',
  moodLogs: 'mood_logs',
  safetyContracts: 'safety_contracts',
  connectionRequests: 'connection_requests',
  linkedAccounts: 'linked_accounts',
};

interface MongoDBResponse<T> {
  document?: T;
  documents?: T[];
  insertedId?: string;
  matchedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
}

class DatabaseService {
  private async makeRequest<T>(
    action: string,
    collection: string,
    data: Record<string, unknown>
  ): Promise<MongoDBResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/action/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection,
          ...data,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error(`API request failed (${action}):`, error);
      throw error;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<string | null> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newUser = {
      ...user,
      id: userId,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await this.makeRequest<User>('insertOne', COLLECTIONS.users, {
        document: newUser,
      });
      console.log('User created in MongoDB:', newUser.name, newUser.role);
      return result.insertedId ? userId : null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.makeRequest<User>('findOne', COLLECTIONS.users, {
        filter: { id: userId },
      });
      return result.document || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.makeRequest<User>('findOne', COLLECTIONS.users, {
        filter: { email },
      });
      return result.document || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const result = await this.makeRequest<User>('updateOne', COLLECTIONS.users, {
        filter: { id: userId },
        update: {
          $set: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      return (result.modifiedCount || 0) > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async saveMoodLog(moodLog: Omit<MoodLog, 'id'> & { userId: string }): Promise<string | null> {
    try {
      const result = await this.makeRequest<MoodLog>('insertOne', COLLECTIONS.moodLogs, {
        document: {
          ...moodLog,
          createdAt: new Date().toISOString(),
        },
      });
      return result.insertedId || null;
    } catch (error) {
      console.error('Error saving mood log:', error);
      return null;
    }
  }

  async getMoodLogs(userId: string, limit: number = 30): Promise<MoodLog[]> {
    try {
      const result = await this.makeRequest<MoodLog>('find', COLLECTIONS.moodLogs, {
        filter: { userId },
        sort: { timestamp: -1 },
        limit,
      });
      return result.documents || [];
    } catch (error) {
      console.error('Error getting mood logs:', error);
      return [];
    }
  }

  async getAllUsersByRole(role: string): Promise<Array<{ id: string; name: string; email: string }>> {
    try {
      const result = await this.makeRequest<User>('find', COLLECTIONS.users, {
        filter: { role },
      });
      const users = result.documents || [];
      console.log(`Found ${users.length} ${role}s in MongoDB`);
      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  async sendConnectionRequest(
    fromUserId: string,
    fromUserRole: string,
    toUserId: string,
    toUserRole: string
  ): Promise<boolean> {
    const request = {
      id: `req_${Date.now()}`,
      fromUserId,
      fromUserRole,
      toUserId,
      toUserRole,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await this.makeRequest('insertOne', COLLECTIONS.connectionRequests, {
        document: request,
      });
      console.log('Connection request sent:', fromUserRole, '->', toUserRole);
      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      return false;
    }
  }

  async getConnectionRequests(userId: string): Promise<Array<{
    id: string;
    fromUserId: string;
    fromUserRole: string;
    fromUserName?: string;
    status: string;
  }>> {
    try {
      const result = await this.makeRequest<any>('find', COLLECTIONS.connectionRequests, {
        filter: { toUserId: userId, status: 'pending' },
      });
      return (result.documents || []).map((r: any) => ({
        id: r.id,
        fromUserId: r.fromUserId,
        fromUserRole: r.fromUserRole,
        status: r.status,
      }));
    } catch (error) {
      console.error('Error getting connection requests:', error);
      return [];
    }
  }

  async acceptConnectionRequest(requestId: string, patientId: string, therapistId: string): Promise<boolean> {
    try {
      // Update request status
      await this.makeRequest('updateOne', COLLECTIONS.connectionRequests, {
        filter: { id: requestId },
        update: { $set: { status: 'accepted' } },
      });

      // Add linked account
      await this.makeRequest('insertOne', COLLECTIONS.linkedAccounts, {
        document: {
          patientId,
          linkedUserId: therapistId,
          linkedUserRole: 'therapist',
          createdAt: new Date().toISOString(),
        },
      });
      console.log('Connection accepted:', patientId, '<->', therapistId);
      return true;
    } catch (error) {
      console.error('Error accepting connection request:', error);
      return false;
    }
  }

  async rejectConnectionRequest(requestId: string): Promise<boolean> {
    try {
      await this.makeRequest('updateOne', COLLECTIONS.connectionRequests, {
        filter: { id: requestId },
        update: { $set: { status: 'rejected' } },
      });
      return true;
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      return false;
    }
  }

  async getLinkedAccounts(userId: string, role: string): Promise<Array<{ id: string; role: string }>> {
    try {
      const filter = role === 'patient'
        ? { patientId: userId }
        : { linkedUserId: userId };

      const result = await this.makeRequest<any>('find', COLLECTIONS.linkedAccounts, { filter });
      
      return (result.documents || []).map((doc: any) => ({
        id: role === 'patient' ? doc.linkedUserId : doc.patientId,
        role: role === 'patient' ? doc.linkedUserRole : 'patient',
      }));
    } catch (error) {
      console.error('Error getting linked accounts:', error);
      return [];
    }
  }

  async saveSafetyContract(contract: Omit<SafetyContract, 'id'>): Promise<string | null> {
    try {
      const result = await this.makeRequest<SafetyContract>('insertOne', COLLECTIONS.safetyContracts, {
        document: {
          ...contract,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      return result.insertedId || null;
    } catch (error) {
      console.error('Error saving safety contract:', error);
      return null;
    }
  }

  async getSafetyContract(patientId: string): Promise<SafetyContract | null> {
    try {
      const result = await this.makeRequest<SafetyContract>('findOne', COLLECTIONS.safetyContracts, {
        filter: { patientId },
        sort: { createdAt: -1 },
      });
      return result.document || null;
    } catch (error) {
      console.error('Error getting safety contract:', error);
      return null;
    }
  }

  async updateShareSettings(userId: string, settings: ShareSettings): Promise<boolean> {
    return this.updateUser(userId, { shareSettings: settings } as Partial<User>);
  }
}

export const databaseService = new DatabaseService();
