// @ts-ignore - ali-oss may not have type definitions
import OSS from 'ali-oss'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

interface OSSConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
}

interface UploadResult {
  url: string
  name: string
  size: number
}

class OSSService {
  private client: any | null = null
  private config: OSSConfig

  constructor(config: OSSConfig) {
    this.config = config
    this.initClient()
  }

  /**
   * 初始化 OSS 客户端
   */
  private initClient() {
    try {
      if (!this.config.accessKeyId || !this.config.accessKeySecret) {
        logger.warn('OSS credentials not configured, upload will be disabled')
        return
      }

      this.client = new OSS({
        region: this.config.region,
        accessKeyId: this.config.accessKeyId,
        accessKeySecret: this.config.accessKeySecret,
        bucket: this.config.bucket,
      })

      logger.info('OSS client initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize OSS client', error)
    }
  }

  /**
   * 上传文件到 OSS
   * @param buffer 文件 buffer
   * @param originalName 原始文件名
   * @param folder 存储文件夹（可选）
   * @returns 上传结果
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string = 'images'
  ): Promise<UploadResult> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      // 生成唯一文件名
      const ext = path.extname(originalName)
      const filename = `${uuidv4()}${ext}`
      const objectName = `${folder}/${filename}`

      // 上传文件
      const result = await this.client.put(objectName, buffer)

      logger.info(`File uploaded to OSS: ${objectName}`)

      return {
        url: result.url,
        name: objectName,
        size: buffer.length,
      }
    } catch (error) {
      logger.error('Failed to upload file to OSS', error)
      throw new Error('File upload failed')
    }
  }

  /**
   * 上传 base64 图片
   * @param base64Data base64 编码的图片数据
   * @param folder 存储文件夹（可选）
   * @returns 上传结果
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string = 'images'
  ): Promise<UploadResult> {
    // 解析 base64 数据
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image data')
    }

    const ext = matches[1]
    const data = matches[2]
    const buffer = Buffer.from(data, 'base64')

    return this.uploadFile(buffer, `image.${ext}`, folder)
  }

  /**
   * 删除文件
   * @param objectName 对象名称
   */
  async deleteFile(objectName: string): Promise<void> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      await this.client.delete(objectName)
      logger.info(`File deleted from OSS: ${objectName}`)
    } catch (error) {
      logger.error('Failed to delete file from OSS', error)
      throw new Error('File deletion failed')
    }
  }

  /**
   * 批量删除文件
   * @param objectNames 对象名称数组
   */
  async deleteFiles(objectNames: string[]): Promise<void> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      await this.client.deleteMulti(objectNames)
      logger.info(`${objectNames.length} files deleted from OSS`)
    } catch (error) {
      logger.error('Failed to delete files from OSS', error)
      throw new Error('Batch file deletion failed')
    }
  }

  /**
   * 获取文件签名 URL（用于私有文件访问）
   * @param objectName 对象名称
   * @param expires 过期时间（秒），默认 1 小时
   * @returns 签名 URL
   */
  async getSignedUrl(objectName: string, expires: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      const url = this.client.signatureUrl(objectName, {
        expires,
      })
      return url
    } catch (error) {
      logger.error('Failed to generate signed URL', error)
      throw new Error('Failed to generate signed URL')
    }
  }

  /**
   * 检查文件是否存在
   * @param objectName 对象名称
   * @returns 是否存在
   */
  async fileExists(objectName: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      await this.client.head(objectName)
      return true
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return false
      }
      throw error
    }
  }

  /**
   * 列出文件夹中的文件
   * @param prefix 文件夹前缀
   * @param maxKeys 最大返回数量
   * @returns 文件列表
   */
  async listFiles(prefix: string = '', maxKeys: number = 100): Promise<any[]> {
    if (!this.client) {
      throw new Error('OSS client not initialized')
    }

    try {
      const result = await this.client.list({
        prefix,
        'max-keys': maxKeys,
      })
      return result.objects || []
    } catch (error) {
      logger.error('Failed to list files from OSS', error)
      throw new Error('Failed to list files')
    }
  }
}

// 创建单例实例
const ossService = new OSSService({
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || '',
})

export { ossService, OSSService, UploadResult }
