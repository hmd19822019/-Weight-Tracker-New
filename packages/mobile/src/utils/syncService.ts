import { storage, STORAGE_KEYS } from './storage'

interface SyncableRecord {
  id: string
  syncStatus: 'local' | 'synced' | 'conflict'
  version?: number
  updatedAt?: string
}

export class SyncService {
  private static instance: SyncService
  private isSyncing = false

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  async syncData(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) {
      return { success: false, message: '同步进行中' }
    }

    this.isSyncing = true

    try {
      // Get local data
      const localRecords = await storage.getItem<SyncableRecord[]>(STORAGE_KEYS.USER_DATA) || []
      const token = await storage.getItem<string>(STORAGE_KEYS.USER_TOKEN)

      if (!token) {
        return { success: false, message: '未登录' }
      }

      // Filter records that need sync
      const needSync = localRecords.filter((r) => r.syncStatus === 'local')

      if (needSync.length === 0) {
        return { success: true, message: '数据已是最新' }
      }

      // Mock: In production, call API to sync
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))

      // Update sync status
      const updated = localRecords.map((r) =>
        needSync.find((n) => n.id === r.id)
          ? { ...r, syncStatus: 'synced' as const }
          : r
      )

      await storage.setItem(STORAGE_KEYS.USER_DATA, updated)

      return {
        success: true,
        message: `成功同步 ${needSync.length} 条记录`,
      }
    } catch (error) {
      console.error('Sync error:', error)
      return { success: false, message: '同步失败' }
    } finally {
      this.isSyncing = false
    }
  }

  async pullData(): Promise<{ success: boolean; message: string }> {
    try {
      const token = await storage.getItem<string>(STORAGE_KEYS.USER_TOKEN)

      if (!token) {
        return { success: false, message: '未登录' }
      }

      // Mock: In production, call API to pull data
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))

      // Mock: No new data from server
      return { success: true, message: '已是最新数据' }
    } catch (error) {
      console.error('Pull error:', error)
      return { success: false, message: '拉取数据失败' }
    }
  }

  async fullSync(): Promise<{ success: boolean; message: string }> {
    // Pull first, then push
    const pullResult = await this.pullData()
    if (!pullResult.success) {
      return pullResult
    }

    const pushResult = await this.syncData()
    return pushResult
  }
}

export const syncService = SyncService.getInstance()
