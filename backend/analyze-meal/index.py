import json
import os
import requests
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Анализирует фотографию блюда через GigaChat и возвращает данные о белке и аминокислотах
    Args: event - содержит httpMethod, body с base64 изображением
          context - объект с request_id, function_name и другими атрибутами
    Returns: JSON с названием блюда, белком и аминокислотным профилем
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    image_base64 = body_data.get('image', '')
    
    if not image_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Image is required'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('GIGACHAT_API_KEY')
    
    # Получаем токен доступа
    try:
        auth_url = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
        auth_headers = {
            'Authorization': f'Bearer {api_key}',
            'RqUID': str(uuid.uuid4()),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        auth_data = {'scope': 'GIGACHAT_API_PERS'}
        
        auth_response = requests.post(auth_url, headers=auth_headers, data=auth_data, verify=False, timeout=10)
        access_token = auth_response.json()['access_token']
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Auth failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    # Анализируем изображение
    try:
        api_url = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        prompt = """Определи блюдо и верни JSON (без markdown):
{"name":"название","protein":число,"calories":число,"aminoAcids":{"leucine":мг,"isoleucine":мг,"valine":мг,"lysine":мг,"methionine":мг,"phenylalanine":мг,"threonine":мг,"tryptophan":мг,"histidine":мг},"limitingAminoAcid":"название"}"""
        
        payload = {
            'model': 'GigaChat',
            'messages': [
                {
                    'role': 'user',
                    'content': [
                        {'type': 'text', 'text': prompt},
                        {'type': 'image_url', 'image_url': {'url': image_base64}}
                    ]
                }
            ],
            'temperature': 0.1,
            'max_tokens': 300
        }
        
        response = requests.post(api_url, headers=headers, json=payload, verify=False, timeout=45)
        result = response.json()
        
        ai_response = result['choices'][0]['message']['content']
        
        # Парсим JSON из ответа
        meal_data = json.loads(ai_response.strip())
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Analysis failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(meal_data),
        'isBase64Encoded': False
    }