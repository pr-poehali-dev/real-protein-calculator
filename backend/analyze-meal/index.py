import json
import os
import base64
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Анализирует фото блюда через OpenAI Vision API и возвращает белковый состав
    Args: event - содержит httpMethod, body с base64 изображением
    Returns: JSON с названием блюда, БЖУ и аминокислотным профилем
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        import openai
        
        openai.api_key = os.environ['OPENAI_API_KEY']
        
        body_data = json.loads(event.get('body', '{}'))
        image_base64 = body_data.get('image', '')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Image is required'}),
                'isBase64Encoded': False
            }
        
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        client = openai.OpenAI(api_key=os.environ['OPENAI_API_KEY'])
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Ты эксперт-нутрициолог. Проанализируй фото блюда и верни JSON со следующей структурой:
{
  "name": "название блюда на русском",
  "protein": число (граммы белка),
  "calories": число (ккал),
  "fats": число (граммы жиров),
  "carbs": число (граммы углеводов),
  "proteinQuality": число 0-100 (качество белка),
  "limitingAminoAcid": "название лимитирующей аминокислоты на русском",
  "aminoAcids": [
    {
      "name": "English name",
      "nameRu": "Русское название",
      "amount": число (мг на 100г белка),
      "idealScore": число (мг эталонного белка ФАО/ВОЗ),
      "score": число 0-150 (процент от идеала),
      "essential": true/false
    }
  ]
}

Незаменимые аминокислоты и их эталоны ФАО/ВОЗ (мг на 1г белка):
- Leucine/Лейцин: 59 мг (essential: true)
- Isoleucine/Изолейцин: 30 мг (essential: true)
- Valine/Валин: 39 мг (essential: true)
- Lysine/Лизин: 45 мг (essential: true)
- Methionine/Метионин: 16 мг (essential: true)
- Threonine/Треонин: 23 мг (essential: true)
- Phenylalanine/Фенилаланин: 30 мг (essential: true)
- Tryptophan/Триптофан: 6 мг (essential: true)

Рассчитай реальные значения для этого блюда. Верни только JSON, без комментариев."""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Проанализируй это блюдо и определи содержание белка и аминокислотный профиль"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        result_text = response.choices[0].message.content.strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        result = json.loads(result_text)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to parse AI response',
                'details': str(e),
                'raw_response': result_text if 'result_text' in locals() else 'No response'
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Analysis failed',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
