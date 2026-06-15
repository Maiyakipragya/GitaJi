import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:5000';
const CHAT_ENDPOINT = `${PYTHON_BACKEND_URL}/api/chat`;

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response: string;
  error?: string;
}

/**
 * POST /api/chat
 * Forwards user messages to the Python backend MCP server
 * and returns the dharmic wisdom response
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    // Parse request body
    const body = await request.json();
    const { message } = body as ChatRequest;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { response: '', error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    // Forward request to Python backend
    const pythonResponse = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
      // Add a 30-second timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000),
    });

    // Handle backend response
    if (!pythonResponse.ok) {
      console.error(
        `Python backend error: ${pythonResponse.status} ${pythonResponse.statusText}`
      );

      // If backend returns an error, try to extract error message
      let errorData;
      try {
        errorData = await pythonResponse.json();
      } catch {
        errorData = null;
      }

      const errorMessage =
        errorData?.error ||
        `Backend server error (${pythonResponse.status}). Please try again.`;

      return NextResponse.json(
        { response: '', error: errorMessage },
        { status: pythonResponse.status }
      );
    }

    // Parse successful backend response
    const data = await pythonResponse.json();

    // Return the backend response to frontend
    return NextResponse.json(
      {
        response: data.response || 'I appreciate your question. Let me contemplate this wisdom.',
        error: undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Handle network errors and timeouts
    const errorMessage = getErrorMessage(error);

    console.error('Chat API error:', errorMessage);

    // Distinguish between different error types for better UX
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          response: '',
          error: `🙏 The GitaJi backend server is currently offline. Please ensure your Python server is running at ${PYTHON_BACKEND_URL}/api/chat and try again.`,
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      return NextResponse.json(
        {
          response: '',
          error: 'The backend server took too long to respond. Please try again or check if the server is running.',
        },
        { status: 504 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        response: '',
        error: 'An unexpected error occurred while processing your message. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Utility function to extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Please use POST.' },
    { status: 405 }
  );
}
