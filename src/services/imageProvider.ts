import type { AppSettings } from '../types';

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
}

export class ImageProvider {
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    switch (this.settings.imageProvider) {
      case 'dalle':
        return this.generateWithDalle(prompt);
      case 'comfyui':
        return this.generateWithComfyUI(prompt);
      default:
        throw new Error('Image generation not configured. Go to Settings > Image Generation.');
    }
  }

  private async generateWithDalle(prompt: string): Promise<ImageGenerationResult> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.dalleApiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DALL-E error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.data[0].url,
      prompt
    };
  }

  private async generateWithComfyUI(prompt: string): Promise<ImageGenerationResult> {
    const comfyUrl = this.settings.comfyUiUrl.replace(/\/$/, '');

    // Step 1: Build workflow
    const workflow = this.buildComfyWorkflow(prompt);

    // Step 2: Queue prompt
    const queueResponse = await fetch(`${comfyUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow })
    });

    if (!queueResponse.ok) {
      const error = await queueResponse.text();
      throw new Error(`ComfyUI error ${queueResponse.status}: ${error}`);
    }

    const queueData = await queueResponse.json();
    const promptId = queueData.prompt_id;

    // Step 3: Wait for completion and get image
    const imageUrl = await this.waitForComfyImage(comfyUrl, promptId);
    return { imageUrl, prompt };
  }

  private buildComfyWorkflow(prompt: string): Record<string, any> {
    return {
      '3': {
        class_type: 'KSampler',
        inputs: {
          seed: Math.floor(Math.random() * 999999999),
          steps: this.settings.imageSteps,
          cfg: 7.0,
          sampler_name: 'euler',
          scheduler: 'normal',
          denoise: 1.0,
          model: ['4', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0]
        }
      },
      '4': {
        class_type: 'CheckpointLoaderSimple',
        inputs: { ckpt_name: this.settings.comfyUiModel }
      },
      '5': {
        class_type: 'EmptyLatentImage',
        inputs: {
          width: this.settings.imageWidth,
          height: this.settings.imageHeight,
          batch_size: 1
        }
      },
      '6': {
        class_type: 'CLIPTextEncode',
        inputs: {
          text: this.settings.comfyUiPositivePrompt + ', ' + prompt,
          clip: ['4', 1]
        }
      },
      '7': {
        class_type: 'CLIPTextEncode',
        inputs: {
          text: this.settings.comfyUiNegativePrompt,
          clip: ['4', 1]
        }
      },
      '8': {
        class_type: 'VAEDecode',
        inputs: {
          samples: ['3', 0],
          vae: ['4', 2]
        }
      },
      '9': {
        class_type: 'SaveImage',
        inputs: {
          images: ['8', 0],
          filename_prefix: 'ai-chat-game'
        }
      }
    };
  }

  private async waitForComfyImage(comfyUrl: string, promptId: string): Promise<string> {
    const maxWait = 120000; // 2 minutes
    const pollInterval = 2000;
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));

      // Check history
      const historyResponse = await fetch(`${comfyUrl}/history/${promptId}`);
      const history = await historyResponse.json();

      if (history[promptId]?.status?.completed) {
        // Get the output image
        const outputs = history[promptId].outputs;
        for (const nodeId of Object.keys(outputs)) {
          const images = outputs[nodeId].images;
          if (images && images.length > 0) {
            const img = images[0];
            return `${comfyUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder)}&type=${img.type}`;
          }
        }
      }

      if (history[promptId]?.status?.status_str === 'error') {
        throw new Error('ComfyUI generation failed');
      }
    }

    throw new Error('ComfyUI generation timed out');
  }

  async generateAvatar(description: string): Promise<string> {
    const result = await this.generateImage(`character portrait: ${description}, anime style, clean background, centered face`);
    return result.imageUrl;
  }
}
