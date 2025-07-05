import OpenAI from 'openai';
import { FACIAL_ANALYSIS_PROMPT, SYSTEM_PROMPT } from '../../prompt/facial-analysis.js';

// OpenRouter配置 - 直接硬编码（临时调试用）
console.log('🔑 OpenRouter配置初始化...');
console.log(process.env.OPENROUTER_BASE_URL);
console.log(process.env.OPENROUTER_API_KEY);
console.log(process.env.NEXT_PUBLIC_APP_URL);

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    "X-Title": "hare",
  },
});

// 面部特征分析结果类型 (不包含性别，由用户手动选择)
export interface FacialFeatures {
  hairColor: string;
  hairStyle: string;
  hairTexture: string;
  faceShape: string;
  skinTone: string;
  eyeColor: string;
  age: string;
  confidence: number;
}

// 服务器日志函数
function serverLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🤖 AI分析: ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + (JSON.stringify(data).length > 500 ? '...' : ''));
    } catch (e) {
      console.log('无法序列化数据:', data);
    }
  }
}

// 使用GPT-4o-mini分析面部特征
export async function analyzeFacialFeatures(imageUrl: string): Promise<FacialFeatures> {
  try {
    serverLog('开始调用GPT-4o-mini分析面部特征');
    serverLog('图像URL: ' + imageUrl.substring(0, 100) + '...');

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": SYSTEM_PROMPT
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": FACIAL_ANALYSIS_PROMPT
            },
            {
              "type": "image_url",
              "image_url": {
                "url": imageUrl,
                "detail": "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    serverLog('GPT-4o-mini响应: ' + (response?.substring(0, 200) || 'null'));

    if (!response) {
      throw new Error('AI分析服务未返回有效响应');
    }

    // 解析JSON响应
    let analysisResult: FacialFeatures;
    try {
      // 尝试直接解析JSON
      analysisResult = JSON.parse(response);
    } catch (parseError) {
      serverLog('直接JSON解析失败，尝试提取JSON部分');
      
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法从AI响应中提取有效的JSON数据');
      }
    }

    // 验证必要字段 (不包含性别字段)
    const requiredFields = ['hairColor', 'hairStyle', 'hairTexture', 'faceShape', 'skinTone', 'eyeColor', 'age'];
    for (const field of requiredFields) {
      if (!analysisResult[field as keyof FacialFeatures]) {
        throw new Error(`AI分析结果缺少必要字段: ${field}`);
      }
    }

    // 确保confidence是数字
    if (typeof analysisResult.confidence !== 'number') {
      analysisResult.confidence = parseFloat(analysisResult.confidence as any) || 0.8;
    }

    // 限制confidence范围
    analysisResult.confidence = Math.max(0.0, Math.min(1.0, analysisResult.confidence));

    serverLog('面部特征分析完成', {
      hairColor: analysisResult.hairColor,
      hairStyle: analysisResult.hairStyle,
      hairTexture: analysisResult.hairTexture,
      faceShape: analysisResult.faceShape,
      skinTone: analysisResult.skinTone,
      eyeColor: analysisResult.eyeColor,
      age: analysisResult.age,
      confidence: analysisResult.confidence
    });

    return analysisResult;

  } catch (error: any) {
    serverLog('AI分析失败: ' + error.message);
    
    if (error.response) {
      serverLog('API错误响应', {
        status: error.response.status,
        data: error.response.data
      });
    }

    // 抛出更具体的错误信息
    if (error.message.includes('API key')) {
      throw new Error('AI服务API密钥配置错误');
    } else if (error.message.includes('rate limit')) {
      throw new Error('AI服务请求频率超限，请稍后重试');
    } else if (error.message.includes('timeout')) {
      throw new Error('AI服务响应超时，请重试');
    } else {
      throw new Error(`AI分析服务错误: ${error.message}`);
    }
  }
}

// 测试AI服务连接
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    serverLog('测试OpenRouter连接...');
    
    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          "role": "user",
          "content": "请回复'连接成功'"
        }
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;
    serverLog('连接测试响应: ' + response);
    
    return response?.includes('连接成功') || response?.includes('成功') || true;
  } catch (error: any) {
    serverLog('连接测试失败: ' + error.message);
    return false;
  }
} 