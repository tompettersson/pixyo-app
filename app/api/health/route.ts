import { NextResponse } from 'next/server';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceStatus[];
}

async function checkClaude(): Promise<ServiceStatus> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      name: 'Claude Opus',
      status: 'down',
      message: 'API key not configured',
    };
  }

  try {
    const start = Date.now();

    // Light API call to check connection
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    const latency = Date.now() - start;

    if (response.ok || response.status === 400) {
      // 400 is fine - means API is reachable but request was minimal
      return {
        name: 'Claude Opus',
        status: 'operational',
        latency,
      };
    }

    if (response.status === 401) {
      return {
        name: 'Claude Opus',
        status: 'down',
        message: 'Invalid API key',
      };
    }

    if (response.status === 429) {
      return {
        name: 'Claude Opus',
        status: 'degraded',
        message: 'Rate limited',
        latency,
      };
    }

    return {
      name: 'Claude Opus',
      status: 'degraded',
      message: `HTTP ${response.status}`,
      latency,
    };
  } catch (error) {
    return {
      name: 'Claude Opus',
      status: 'down',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkGemini(): Promise<ServiceStatus> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      name: 'Gemini',
      status: 'down',
      message: 'API key not configured',
    };
  }

  try {
    const start = Date.now();

    // Check if the API endpoint is reachable
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET' }
    );

    const latency = Date.now() - start;

    if (response.ok) {
      return {
        name: 'Gemini',
        status: 'operational',
        latency,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        name: 'Gemini',
        status: 'down',
        message: 'Invalid API key',
      };
    }

    if (response.status === 429) {
      return {
        name: 'Gemini',
        status: 'degraded',
        message: 'Rate limited',
        latency,
      };
    }

    return {
      name: 'Gemini',
      status: 'degraded',
      message: `HTTP ${response.status}`,
      latency,
    };
  } catch (error) {
    return {
      name: 'Gemini',
      status: 'down',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

export async function GET() {
  const [claude, gemini] = await Promise.all([
    checkClaude(),
    checkGemini(),
  ]);

  const services = [claude, gemini];

  // Overall status
  const allOperational = services.every(s => s.status === 'operational');
  const anyDown = services.some(s => s.status === 'down');

  const overallStatus: HealthResponse['status'] = allOperational
    ? 'operational'
    : anyDown
      ? 'down'
      : 'degraded';

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services,
  };

  return NextResponse.json(response);
}
