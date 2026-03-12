import axios from 'axios'
import { logger } from '../utils/logger'

interface BaiduAIConfig {
  apiKey: string
  secretKey: string
}

interface FoodRecognitionResult {
  name: string
  calories: number
  confidence: number
}

class BaiduAIService {
  private config: BaiduAIConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: BaiduAIConfig) {
    this.config = config
  }

  /**
   * 获取百度 AI Access Token
   */
  private async getAccessToken(): Promise<string> {
    // 如果 token 还有效，直接返回
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: this.config.apiKey,
            client_secret: this.config.secretKey,
          },
        }
      )

      this.accessToken = response.data.access_token
      // Token 有效期通常是 30 天，这里设置为 29 天后过期
      this.tokenExpiry = Date.now() + 29 * 24 * 60 * 60 * 1000

      logger.info('Baidu AI access token refreshed')
      return this.accessToken!
    } catch (error) {
      logger.error('Failed to get Baidu AI access token', error)
      throw new Error('Failed to authenticate with Baidu AI')
    }
  }

  /**
   * 识别食物图片
   * @param imageUrl 图片 URL
   * @returns 食物识别结果
   */
  async recognizeFood(imageUrl: string): Promise<FoodRecognitionResult> {
    try {
      const token = await this.getAccessToken()

      // 下载图片并转换为 base64
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      })
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64')

      // 调用百度 AI 食物识别 API
      const response = await axios.post(
        `https://aip.baidubce.com/rest/2.0/image-classify/v2/dish`,
        `image=${encodeURIComponent(imageBase64)}`,
        {
          params: {
            access_token: token,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (response.data.error_code) {
        logger.error('Baidu AI recognition error', response.data)
        throw new Error(response.data.error_msg || 'Recognition failed')
      }

      // 解析结果
      const result = response.data.result?.[0]
      if (!result) {
        throw new Error('No food detected in image')
      }

      // 估算卡路里（这里使用简单的映射，实际应该有更完善的数据库）
      const calories = this.estimateCalories(result.name)

      return {
        name: result.name,
        calories,
        confidence: result.probability || 0,
      }
    } catch (error) {
      logger.error('Food recognition failed', error)
      throw error
    }
  }

  /**
   * 根据食物名称估算卡路里
   * 这是一个简化版本，实际应该使用完整的食物营养数据库
   */
  private estimateCalories(foodName: string): number {
    // 简单的卡路里映射表（每 100g）
    const calorieMap: Record<string, number> = {
      米饭: 116,
      面条: 137,
      馒头: 221,
      包子: 227,
      饺子: 198,
      苹果: 52,
      香蕉: 89,
      橙子: 47,
      西瓜: 30,
      鸡蛋: 147,
      牛奶: 54,
      鸡肉: 167,
      猪肉: 395,
      牛肉: 250,
      鱼肉: 104,
      豆腐: 81,
      青菜: 15,
      西红柿: 18,
      黄瓜: 15,
      土豆: 77,
    }

    // 尝试匹配食物名称
    for (const [key, value] of Object.entries(calorieMap)) {
      if (foodName.includes(key)) {
        return value
      }
    }

    // 默认返回 100 卡路里
    return 100
  }

  /**
   * 批量识别食物
   */
  async recognizeFoodBatch(imageUrls: string[]): Promise<FoodRecognitionResult[]> {
    const results = await Promise.allSettled(
      imageUrls.map((url) => this.recognizeFood(url))
    )

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<FoodRecognitionResult>).value)
  }
}

// 创建单例实例
const baiduAIService = new BaiduAIService({
  apiKey: process.env.BAIDU_API_KEY || '',
  secretKey: process.env.BAIDU_SECRET_KEY || '',
})

export { baiduAIService, BaiduAIService, FoodRecognitionResult }
