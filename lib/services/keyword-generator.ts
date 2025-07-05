import OpenAI from 'openai';
import { KEYWORD_GENERATION_PROMPT, KEYWORD_SYSTEM_PROMPT } from '../../prompt/keyword-generation.js';

// OpenRouter配置
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "https://localhost:3000",
    "X-Title": "BeautySnap",
  },
});

// 用户特征接口
export interface UserFeatures {
  hairColor: string;
  faceShape: string;
  skinTone: string;
  eyeColor: string;
  age: string;
  gender: string;
}

// 关键词结果接口
export interface KeywordCategories {
  skincare: string[];
  makeup: string[];
  haircare: string[];
  tools: string[];
  special: string[];
}

// 服务器日志函数
function serverLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 关键词生成: ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + (JSON.stringify(data).length > 500 ? '...' : ''));
    } catch (e) {
      console.log('无法序列化数据:', data);
    }
  }
}

// 使用AI生成个性化关键词
export async function generatePersonalizedKeywords(features: UserFeatures): Promise<KeywordCategories> {
  try {
    serverLog('开始AI关键词生成', features);

    // 构建个性化的提示词
    const personalizedPrompt = KEYWORD_GENERATION_PROMPT
      .replace('{hairColor}', features.hairColor)
      .replace('{faceShape}', features.faceShape)
      .replace('{skinTone}', features.skinTone)
      .replace('{eyeColor}', features.eyeColor)
      .replace('{age}', features.age)
      .replace('{gender}', features.gender);

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": KEYWORD_SYSTEM_PROMPT
        },
        {
          "role": "user",
          "content": personalizedPrompt
        }
      ],
      max_tokens: 400,
      temperature: 0.3, // 稍微增加创造性，但保持一致性
    });

    const response = completion.choices[0]?.message?.content;
    serverLog('AI关键词响应长度: ' + (response?.length || 0));

    if (!response) {
      throw new Error('AI关键词生成服务未返回有效响应');
    }

    // 解析JSON响应
    let keywordResult: KeywordCategories;
    try {
      // 尝试直接解析JSON
      keywordResult = JSON.parse(response);
    } catch (parseError) {
      serverLog('直接JSON解析失败，尝试提取JSON部分');
      
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        keywordResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法从AI响应中提取有效的JSON数据');
      }
    }

    // 验证必要字段
    const requiredCategories = ['skincare', 'makeup', 'haircare', 'tools', 'special'];
    for (const category of requiredCategories) {
      if (!keywordResult[category as keyof KeywordCategories]) {
        keywordResult[category as keyof KeywordCategories] = [];
      }
    }

    // 统计生成的关键词数量
    const totalKeywords = Object.values(keywordResult).reduce((sum, arr) => sum + arr.length, 0);
    serverLog(`关键词生成完成，总计: ${totalKeywords} 个关键词`, {
      skincare: keywordResult.skincare.length,
      makeup: keywordResult.makeup.length,
      haircare: keywordResult.haircare.length,
      tools: keywordResult.tools.length,
      special: keywordResult.special.length,
    });

    return keywordResult;

  } catch (error: any) {
    serverLog('AI关键词生成失败: ' + error.message);
    
    if (error.response) {
      serverLog('API错误响应', {
        status: error.response.status,
        data: error.response.data
      });
    }

    // 如果AI生成失败，返回基于规则的备用关键词
    serverLog('使用备用关键词生成策略');
    return generateFallbackKeywords(features);
  }
}

// 备用关键词生成（基于规则的方法）
function generateFallbackKeywords(features: UserFeatures): KeywordCategories {
  const result: KeywordCategories = {
    skincare: [],
    makeup: [],
    haircare: [],
    tools: [],
    special: []
  };

  // 基于肤色的护肤品推荐 (3个关键词)
  if (features.skinTone === 'Cool') {
    result.skincare = ['cool undertone moisturizer', 'hydrating serum', 'gentle cleanser'];
    result.makeup = ['pink-based foundation', 'cool-toned concealer', 'berry lipstick'];
  } else if (features.skinTone === 'Warm') {
    result.skincare = ['warm undertone moisturizer', 'vitamin C serum', 'gentle foam cleanser'];
    result.makeup = ['golden foundation', 'warm-toned concealer', 'coral lipstick'];
  } else if (features.skinTone === 'Deep') {
    result.skincare = ['rich moisturizer', 'brightening serum', 'deep cleansing oil'];
    result.makeup = ['deep foundation', 'full coverage concealer', 'bold lipstick'];
  } else if (features.skinTone === 'Light') {
    result.skincare = ['light moisturizer', 'gentle hydrating serum', 'mild cleanser'];
    result.makeup = ['light coverage foundation', 'brightening concealer', 'soft pink lipstick'];
  } else if (features.skinTone === 'Medium') {
    result.skincare = ['medium coverage moisturizer', 'balancing serum', 'foam cleanser'];
    result.makeup = ['medium foundation', 'natural concealer', 'nude lipstick'];
  } else {
    result.skincare = ['universal moisturizer', 'hydrating serum', 'gentle cleanser'];
    result.makeup = ['neutral foundation', 'medium coverage concealer', 'nude lipstick'];
  }

  // 基于发色的护发品推荐 (3个关键词)
  if (features.hairColor === 'Brown' || features.hairColor === 'Black') {
    result.haircare = ['dark hair shampoo', 'nourishing conditioner', 'hair oil treatment'];
  } else if (features.hairColor === 'Blonde') {
    result.haircare = ['blonde shampoo', 'purple toning shampoo', 'blonde conditioner'];
  } else if (features.hairColor === 'Red') {
    result.haircare = ['color-safe shampoo', 'red hair conditioner', 'color protection serum'];
  } else if (features.hairColor === 'Silver' || features.hairColor === 'Gray') {
    result.haircare = ['silver shampoo', 'gray hair conditioner', 'color enhancing treatment'];
  } else {
    result.haircare = ['gentle shampoo', 'moisturizing conditioner', 'hair treatment oil'];
  }

  // 基于年龄的特殊护理 (3个关键词)
  const ageNum = parseInt(features.age.split('-')[0]);
  if (ageNum >= 50) {
    result.special = ['anti-aging cream', 'retinol serum', 'firming mask'];
  } else if (ageNum >= 40) {
    result.special = ['preventive anti-aging', 'collagen serum', 'hydrating mask'];
  } else if (ageNum >= 30) {
    result.special = ['early anti-aging', 'vitamin C mask', 'gentle exfoliator'];
  } else {
    result.special = ['hydrating mask', 'gentle exfoliator', 'daily sunscreen'];
  }

  // 基本工具推荐 (3个关键词)
  result.tools = ['makeup brush set', 'beauty blender', 'skincare tools'];

  // 根据眼色调整彩妆推荐
  if (features.eyeColor === 'Brown') {
    // 如果彩妆还没有被设置，或者需要调整
    if (result.makeup.length < 3) {
      result.makeup = ['warm eyeshadow palette', 'bronze eyeshadow', 'brown mascara'];
    }
  } else if (features.eyeColor === 'Blue') {
    if (result.makeup.length < 3) {
      result.makeup = ['cool eyeshadow palette', 'copper eyeshadow', 'black mascara'];
    }
  } else if (features.eyeColor === 'Green') {
    if (result.makeup.length < 3) {
      result.makeup = ['purple eyeshadow palette', 'burgundy eyeshadow', 'brown eyeliner'];
    }
  } else if (features.eyeColor === 'Hazel') {
    if (result.makeup.length < 3) {
      result.makeup = ['neutral eyeshadow palette', 'golden eyeshadow', 'brown mascara'];
    }
  } else if (features.eyeColor === 'Gray') {
    if (result.makeup.length < 3) {
      result.makeup = ['smoky eyeshadow palette', 'silver eyeshadow', 'black eyeliner'];
    }
  } else if (features.eyeColor === 'Amber') {
    if (result.makeup.length < 3) {
      result.makeup = ['warm eyeshadow palette', 'amber eyeshadow', 'brown mascara'];
    }
  }

  // 确保每个品类都有恰好3个关键词
  Object.keys(result).forEach(category => {
    const keywords = result[category as keyof KeywordCategories];
    if (keywords.length < 3) {
      // 如果少于3个，添加通用关键词补足
      const genericKeywords: { [key: string]: string[] } = {
        skincare: ['daily moisturizer', 'gentle cleanser', 'hydrating serum'],
        makeup: ['foundation', 'concealer', 'lipstick'],
        haircare: ['shampoo', 'conditioner', 'hair mask'],
        tools: ['makeup brushes', 'sponge', 'mirror'],
        special: ['face mask', 'scrub', 'treatment']
      };
      
      while (keywords.length < 3 && genericKeywords[category]) {
        const generic = genericKeywords[category].find(k => !keywords.includes(k));
        if (generic) {
          keywords.push(generic);
        } else {
          break;
        }
      }
    } else if (keywords.length > 3) {
      // 如果超过3个，只保留前3个
      result[category as keyof KeywordCategories] = keywords.slice(0, 3);
    }
  });

  return result;
}

// 合并AI生成和规则生成的关键词
export async function generateHybridKeywords(features: UserFeatures): Promise<KeywordCategories> {
  try {
    // 首先尝试AI生成
    const aiKeywords = await generatePersonalizedKeywords(features);
    
    // 获取规则生成的关键词作为补充
    const fallbackKeywords = generateFallbackKeywords(features);
    
    // 合并关键词，去重
    const result: KeywordCategories = {
      skincare: [...new Set([...aiKeywords.skincare, ...fallbackKeywords.skincare])],
      makeup: [...new Set([...aiKeywords.makeup, ...fallbackKeywords.makeup])],
      haircare: [...new Set([...aiKeywords.haircare, ...fallbackKeywords.haircare])],
      tools: [...new Set([...aiKeywords.tools, ...fallbackKeywords.tools])],
      special: [...new Set([...aiKeywords.special, ...fallbackKeywords.special])]
    };

    serverLog('混合关键词生成完成', {
      总计: Object.values(result).reduce((sum, arr) => sum + arr.length, 0),
      各分类: Object.keys(result).map(key => `${key}: ${result[key as keyof KeywordCategories].length}`)
    });

    return result;
    
  } catch (error) {
    serverLog('混合关键词生成失败，使用备用方案');
    return generateFallbackKeywords(features);
  }
} 