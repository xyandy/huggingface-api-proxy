# 介绍

将 huggingface api 转化为 openai api 格式，方便调用。可以免费部署在 cloudflare worker

# 使用

1. 创建 huggingface-api-key ( https://huggingface.co/settings/tokens )

2. 设置 baseurl 和 huggingface-api-key

> 目前可以使用我部署的 endpoint:
>
> https://huggingface-api-proxy.dogxy.workers.dev/v1/chat/completions

```shell
# shell curl
curl https://{baseurl}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {huggingface-api-key}" \
  -d '{
    "model": "Qwen/Qwen2.5-72B-Instruct",
    "messages": [{"role": "user", "content": "Hi, who are you"}],
    "temperature": 0.6
  }'
```

```python
# python
import openai
from openai import OpenAI

client = OpenAI(
    base_url={baseurl},
    api_key={huggingface-api-key}
)

try:
    response = client.chat.completions.create(
        model="Qwen/Qwen2.5-72B-Instruct",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hi, who are you"}
        ]
    )
    print(response.choices[0].message.content)
except Exception as e:
    print(f"An error occurred: {e}")
```

```javascript
// javascript
try {
	const response = await fetch('https://{baseurl}/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer {huggingface-api-key}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'Qwen/Qwen2.5-72B-Instruct',
			messages: [{ role: 'user', content: 'Hi, who are you' }],
			temperature: 0.7,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	console.log(data.choices[0].message.content);
} catch (error) {
	console.error('Error:', error.message);
}
```

# 部署

将 `src/index.js` 内容直接复制到 cloudflare worker 中即可

# 可用模型

参考 https://huggingface.co/docs/api-inference/supported-models

# 限制

参考 https://huggingface.co/docs/api-inference/rate-limits

个人用户大概一天 1000 次请求
