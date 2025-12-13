import { User, MoodLog, SafetyContract, ShareSettings } from '../types';

const MONGODB_API_URL = 'http://localhost:3000';
const CLUSTER_NAME = 'Cluster0';
const DATABASE_NAME = 'bpd_recovery';

const COLLECTIONS = {
  users: 'users',
  moodLogs: 'mood_logs',
  safetyContracts: 'safety_contracts',
  anchorCodes: 'anchor_codes',
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
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private async makeRequest<T>(
    action: string,
    collection: string,
    data: Record<string, unknown>
  ): Promise<MongoDBResponse<T>> {
    const response = await fetch(`${MONGODB_API_URL}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataSource: CLUSTER_NAME,
        database: DATABASE_NAME,
        collection,
        ...data,
      }),
    });

    return await response.json();
  }

  async createUser(user: Omit<User, 'id'>): Promise<string | null> {
    try {
      const result = await this.makeRequest<User>('insertOne', COLLECTIONS.users, {
        document: {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      return result.insertedId || null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.makeRequest<User>('findOne', COLLECTIONS.users, {
        filter: { _id: { $oid: userId } },
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
        filter: { _id: { $oid: userId } },
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

  async generateAnchorCode(userId: string): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await this.makeRequest('insertOne', COLLECTIONS.anchorCodes, {
        document: {
          userId,
          code,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });
      return code;
    } catch (error) {
      console.error('Error generating anchor code:', error);
      return code;
    }
  }

  async linkAccountWithCode(
    code: string,
    linkingUserId: string,
    linkingUserRole: 'ally' | 'therapist'
  ): Promise<{ success: boolean; patientId?: string }> {
    try {
      const codeResult = await this.makeRequest<{ userId: string; expiresAt: string }>(
        'findOne',
        COLLECTIONS.anchorCodes,
        { filter: { code } }
      );

      if (!codeResult.document) {
        return { success: false };
      }

      const { userId: patientId, expiresAt } = codeResult.document;

      if (new Date(expiresAt) < new Date()) {
        return { success: false };
      }

      await this.makeRequest('insertOne', COLLECTIONS.linkedAccounts, {
        document: {
          patientId,
          linkedUserId: linkingUserId,
          linkedUserRole: linkingUserRole,
          createdAt: new Date().toISOString(),
        },
      });

      return { success: true, patientId };
    } catch (error) {
      console.error('Error linking account:', error);
      return { success: false };
    }
  }

  async getLinkedAccounts(userId: string, role: string): Promise<Array<{ id: string; role: string }>> {
    try {
      const filter = role === 'patient'
        ? { patientId: userId }
        : { linkedUserId: userId };

      const result = await this.makeRequest<{ patientId: string; linkedUserId: string; linkedUserRole: string }>(
        'find',
        COLLECTIONS.linkedAccounts,
        { filter }
      );

      return (result.documents || []).map(doc => ({
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
